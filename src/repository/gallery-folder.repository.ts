import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { GalleryFolderModel, IGalleryFolder } from "../models/gallery-folder.model.js";
import { GalleryModel } from "../models/gallery.model.js";
import { paginationMetadata } from "../utils/pagination.js";

export interface CreateGalleryFolderData {
  folderName: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateGalleryFolderData {
  folderName?: string;
  description?: string;
  isActive?: boolean;
}

export class GalleryFolderRepository {
  /**
   * Create a new gallery folder
   */
  async create(folderData: CreateGalleryFolderData): Promise<IGalleryFolder> {
    try {
      const folder = new GalleryFolderModel(folderData);
      return await folder.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new CustomErrorHandler(409, "Folder with this name already exists");
      }
      throw new CustomErrorHandler(500, "Failed to create gallery folder");
    }
  }

  /**
   * Find gallery folder by ID
   */
  async findById(id: string): Promise<IGalleryFolder | null> {
    try {
      return await GalleryFolderModel.findById(id);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find gallery folder by ID");
    }
  }

  /**
   * Find gallery folder by name
   */
  async findByName(folderName: string): Promise<IGalleryFolder | null> {
    try {
      return await GalleryFolderModel.findOne({
        folderName: { $regex: new RegExp(`^${folderName}$`, "i") },
      });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find gallery folder by name");
    }
  }

  /**
   * Update gallery folder by ID
   */
  async updateById(id: string, updateData: UpdateGalleryFolderData): Promise<IGalleryFolder | null> {
    try {
      return await GalleryFolderModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        throw new CustomErrorHandler(409, "Folder with this name already exists");
      }
      if (error.message && error.message.includes("General folder")) {
        throw new CustomErrorHandler(400, error.message);
      }
      throw new CustomErrorHandler(500, "Failed to update gallery folder");
    }
  }

  /**
   * Delete gallery folder by ID (soft delete) and move galleries to General folder
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      // Get the folder first to check if it's the General folder
      const folder = await GalleryFolderModel.findById(id);
      if (!folder) {
        return false;
      }

      if (folder.folderName === "General") {
        throw new CustomErrorHandler(400, "General folder cannot be deleted");
      }

      // Move all galleries from this folder to "General" folder
      await GalleryModel.updateMany({ folderName: folder.folderName }, { folderName: "General" });

      // Soft delete the folder
      const result = await GalleryFolderModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
      return result !== null;
    } catch (error: any) {
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to delete gallery folder");
    }
  }

  /**
   * Hard delete gallery folder by ID and move galleries to General folder
   */
  async hardDeleteById(id: string): Promise<boolean> {
    try {
      // Get the folder first to check if it's the General folder
      const folder = await GalleryFolderModel.findById(id);
      if (!folder) {
        return false;
      }

      if (folder.folderName === "General") {
        throw new CustomErrorHandler(400, "General folder cannot be deleted");
      }

      // Move all galleries from this folder to "General" folder
      await GalleryModel.updateMany({ folderName: folder.folderName }, { folderName: "General" });

      // Hard delete the folder
      const result = await GalleryFolderModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error: any) {
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      if (error.message && error.message.includes("General folder")) {
        throw new CustomErrorHandler(400, error.message);
      }
      throw new CustomErrorHandler(500, "Failed to permanently delete gallery folder");
    }
  }

  /**
   * Get all gallery folders with pagination and filtering
   */
  async findAll(page: number = 1, limit: number = 10, filters: { isActive?: boolean; search?: string } = {}): Promise<{ folders: IGalleryFolder[]; metadata: any }> {
    try {
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};

      // Filter by active status
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      // Search by folder name or description
      if (filters.search) {
        query["$text"] = { $search: filters.search };
      }

      const [total] = await Promise.all([GalleryFolderModel.countDocuments(query)]);

      const folders = await GalleryFolderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

      const metadata = paginationMetadata(page, limit, total);

      return { folders, metadata };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to fetch gallery folders");
    }
  }

  /**
   * Get all active gallery folders (for dropdown/selection purposes)
   */
  async findAllActive(): Promise<IGalleryFolder[]> {
    try {
      return await GalleryFolderModel.find({ isActive: true }).sort({ folderName: 1 });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to fetch active gallery folders");
    }
  }

  /**
   * Get gallery folder statistics
   */
  async getFolderStats(): Promise<{
    totalFolders: number;
    activeFolders: number;
    inactiveFolders: number;
    foldersWithGalleryCount: { folderName: string; galleryCount: number }[];
  }> {
    try {
      const [folderStats, galleryCountStats] = await Promise.all([
        GalleryFolderModel.aggregate([
          {
            $group: {
              _id: null,
              totalFolders: { $sum: 1 },
              activeFolders: {
                $sum: { $cond: ["$isActive", 1, 0] },
              },
              inactiveFolders: {
                $sum: { $cond: ["$isActive", 0, 1] },
              },
            },
          },
        ]),
        GalleryModel.aggregate([
          {
            $group: {
              _id: "$folderName",
              galleryCount: { $sum: 1 },
            },
          },
          { $sort: { galleryCount: -1 } },
        ]),
      ]);

      const stats = folderStats[0] || {
        totalFolders: 0,
        activeFolders: 0,
        inactiveFolders: 0,
      };

      const galleryCountData = galleryCountStats.map((item) => ({
        folderName: item._id,
        galleryCount: item.galleryCount,
      }));

      return {
        totalFolders: stats.totalFolders,
        activeFolders: stats.activeFolders,
        inactiveFolders: stats.inactiveFolders,
        foldersWithGalleryCount: galleryCountData,
      };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get gallery folder statistics");
    }
  }

  /**
   * Check if gallery folder exists by name
   */
  async existsByName(folderName: string, excludeId?: string): Promise<boolean> {
    try {
      const query: any = {
        folderName: { $regex: new RegExp(`^${folderName}$`, "i") },
      };

      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const folder = await GalleryFolderModel.findOne(query);
      return folder !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to check gallery folder existence");
    }
  }

  /**
   * Ensure General folder exists in database
   */
  async ensureGeneralFolderExists(): Promise<IGalleryFolder> {
    try {
      let generalFolder = await this.findByName("General");

      if (!generalFolder) {
        generalFolder = await this.create({
          folderName: "General",
          description: "Default folder for galleries",
          isActive: true,
        });
      } else if (!generalFolder.isActive) {
        // Reactivate if it was somehow deactivated
        const updatedFolder = await this.updateById(generalFolder.id, {
          isActive: true,
        });
        generalFolder = updatedFolder || generalFolder;
      }

      return generalFolder as IGalleryFolder;
    } catch (error: any) {
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to ensure General folder exists");
    }
  }

  /**
   * Search gallery folders by name or description
   */
  async searchFolders(searchTerm: string): Promise<IGalleryFolder[]> {
    try {
      return await GalleryFolderModel.find({
        $or: [{ folderName: { $regex: searchTerm, $options: "i" } }, { description: { $regex: searchTerm, $options: "i" } }],
        isActive: true,
      }).sort({ folderName: 1 });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to search gallery folders");
    }
  }

  /**
   * Get gallery folders with gallery count
   */
  async getFoldersWithGalleryCount(): Promise<any[]> {
    try {
      return await GalleryFolderModel.aggregate([
        {
          $match: { isActive: true },
        },
        {
          $lookup: {
            from: "galleries",
            localField: "folderName",
            foreignField: "folderName",
            as: "galleries",
          },
        },
        {
          $addFields: {
            galleryCount: { $size: "$galleries" },
          },
        },
        {
          $project: {
            galleries: 0, // Remove the actual gallery data, keep only count
          },
        },
        {
          $sort: { galleryCount: -1, folderName: 1 },
        },
      ]);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get gallery folders with gallery count");
    }
  }
}

export const galleryFolderRepository = new GalleryFolderRepository();
