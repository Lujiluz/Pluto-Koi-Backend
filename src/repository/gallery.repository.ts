import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { GalleryModel, IGallery } from "../models/gallery.model.js";
import { paginationMetadata } from "../utils/pagination.js";

export interface CreateGalleryData {
  galleryName: string;
  owner: string;
  handling: string;
  folderName?: string;
  isActive?: boolean;
  media?: { fileUrl: string }[];
}

export interface UpdateGalleryData {
  galleryName?: string;
  owner?: string;
  handling?: string;
  folderName?: string;
  isActive?: boolean;
  media?: { fileUrl: string }[];
}

export class GalleryRepository {
  /**
   * Create a new gallery
   */
  async create(galleryData: CreateGalleryData): Promise<IGallery> {
    try {
      const gallery = new GalleryModel(galleryData);
      return await gallery.save();
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to create gallery");
    }
  }

  /**
   * Find gallery by ID
   */
  async findById(id: string): Promise<IGallery | null> {
    try {
      return await GalleryModel.findById(id);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find gallery by ID");
    }
  }

  /**
   * Update gallery by ID
   */
  async updateById(id: string, updateData: UpdateGalleryData): Promise<IGallery | null> {
    try {
      return await GalleryModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to update gallery");
    }
  }

  /**
   * Delete gallery by ID (soft delete)
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await GalleryModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
      return result !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to delete gallery");
    }
  }

  /**
   * Hard delete gallery by ID
   */
  async hardDeleteById(id: string): Promise<boolean> {
    try {
      const result = await GalleryModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to permanently delete gallery");
    }
  }

  /**
   * Get all galleries with pagination and filtering
   */
  async findAll(page: number = 1, limit: number = 10, filters: { isActive?: boolean; search?: string; owner?: string; folderName?: string } = {}): Promise<{ galleries: IGallery[]; metadata: any }> {
    try {
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};

      // Filter by active status
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      // Search by gallery name
      if (filters.search) {
        query["$text"] = { $search: filters.search };
      }

      // Filter by owner
      if (filters.owner) {
        query.owner = { $regex: filters.owner, $options: "i" };
      }

      // Filter by folder name
      if (filters.folderName) {
        query.folderName = filters.folderName;
      }

      const [total] = await Promise.all([GalleryModel.countDocuments(query)]);

      const galleries = await GalleryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

      const metadata = paginationMetadata(page, limit, total);

      return { galleries, metadata };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to fetch galleries");
    }
  }

  /**
   * Get gallery statistics
   */
  async getGalleryStats(): Promise<{
    totalGalleries: number;
    activeGalleries: number;
    inactiveGalleries: number;
    totalMediaFiles: number;
    galleriesByOwner: { owner: string; count: number }[];
  }> {
    try {
      const [stats, mediaStats, ownerStats] = await Promise.all([
        GalleryModel.aggregate([
          {
            $group: {
              _id: null,
              totalGalleries: { $sum: 1 },
              activeGalleries: {
                $sum: { $cond: ["$isActive", 1, 0] },
              },
              inactiveGalleries: {
                $sum: { $cond: ["$isActive", 0, 1] },
              },
            },
          },
        ]),
        GalleryModel.aggregate([
          {
            $group: {
              _id: null,
              totalMediaFiles: { $sum: { $size: "$media" } },
            },
          },
        ]),
        GalleryModel.aggregate([
          {
            $group: {
              _id: "$owner",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

      const galleryStats = stats[0] || {
        totalGalleries: 0,
        activeGalleries: 0,
        inactiveGalleries: 0,
      };

      const mediaData = mediaStats[0] || { totalMediaFiles: 0 };

      const ownerData = ownerStats.map((item) => ({
        owner: item._id,
        count: item.count,
      }));

      return {
        totalGalleries: galleryStats.totalGalleries,
        activeGalleries: galleryStats.activeGalleries,
        inactiveGalleries: galleryStats.inactiveGalleries,
        totalMediaFiles: mediaData.totalMediaFiles,
        galleriesByOwner: ownerData,
      };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get gallery statistics");
    }
  }

  /**
   * Check if gallery exists by name
   */
  async existsByName(galleryName: string, excludeId?: string): Promise<boolean> {
    try {
      const query: any = {
        galleryName: { $regex: new RegExp(`^${galleryName}$`, "i") },
      };

      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const gallery = await GalleryModel.findOne(query);
      return gallery !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to check gallery existence");
    }
  }

  /**
   * Get galleries by owner
   */
  async findByOwner(owner: string): Promise<IGallery[]> {
    try {
      return await GalleryModel.find({
        owner: { $regex: owner, $options: "i" },
        isActive: true,
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find galleries by owner");
    }
  }

  /**
   * Get featured/active galleries
   */
  async getFeaturedGalleries(limit: number = 10): Promise<IGallery[]> {
    try {
      return await GalleryModel.find({ isActive: true }).sort({ createdAt: -1 }).limit(limit);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get featured galleries");
    }
  }

  /**
   * Search galleries by multiple criteria
   */
  async searchGalleries(searchTerm: string): Promise<IGallery[]> {
    try {
      return await GalleryModel.find({
        $or: [{ galleryName: { $regex: searchTerm, $options: "i" } }, { owner: { $regex: searchTerm, $options: "i" } }, { handling: { $regex: searchTerm, $options: "i" } }],
        isActive: true,
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to search galleries");
    }
  }

  /**
   * Get galleries with media count
   */
  async getGalleriesWithMediaCount(): Promise<any[]> {
    try {
      return await GalleryModel.aggregate([
        {
          $match: { isActive: true },
        },
        {
          $addFields: {
            mediaCount: { $size: "$media" },
          },
        },
        {
          $sort: { mediaCount: -1, createdAt: -1 },
        },
      ]);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get galleries with media count");
    }
  }

  /**
   * Get galleries by folder name
   */
  async findByFolderName(folderName: string, isActive: boolean = true): Promise<IGallery[]> {
    try {
      const query: any = { folderName };
      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      return await GalleryModel.find(query).sort({ createdAt: -1 });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find galleries by folder name");
    }
  }

  /**
   * Update gallery folder assignment
   */
  async updateGalleryFolder(galleryId: string, folderName: string): Promise<IGallery | null> {
    try {
      return await GalleryModel.findByIdAndUpdate(galleryId, { folderName }, { new: true, runValidators: true });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to update gallery folder assignment");
    }
  }

  /**
   * Move all galleries from one folder to another
   */
  async moveGalleriesBetweenFolders(fromFolderName: string, toFolderName: string): Promise<number> {
    try {
      const result = await GalleryModel.updateMany({ folderName: fromFolderName }, { folderName: toFolderName });
      return result.modifiedCount;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to move galleries between folders");
    }
  }

  /**
   * Get gallery statistics with folder breakdown
   */
  async getGalleryStatsWithFolders(): Promise<{
    totalGalleries: number;
    activeGalleries: number;
    inactiveGalleries: number;
    totalMediaFiles: number;
    galleriesByOwner: { owner: string; count: number }[];
    galleriesByFolder: { folderName: string; count: number }[];
  }> {
    try {
      const [stats, mediaStats, ownerStats, folderStats] = await Promise.all([
        GalleryModel.aggregate([
          {
            $group: {
              _id: null,
              totalGalleries: { $sum: 1 },
              activeGalleries: {
                $sum: { $cond: ["$isActive", 1, 0] },
              },
              inactiveGalleries: {
                $sum: { $cond: ["$isActive", 0, 1] },
              },
            },
          },
        ]),
        GalleryModel.aggregate([
          {
            $group: {
              _id: null,
              totalMediaFiles: { $sum: { $size: "$media" } },
            },
          },
        ]),
        GalleryModel.aggregate([
          {
            $group: {
              _id: "$owner",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        GalleryModel.aggregate([
          {
            $group: {
              _id: "$folderName",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),
      ]);

      const galleryStats = stats[0] || {
        totalGalleries: 0,
        activeGalleries: 0,
        inactiveGalleries: 0,
      };

      const mediaData = mediaStats[0] || { totalMediaFiles: 0 };

      const ownerData = ownerStats.map((item) => ({
        owner: item._id,
        count: item.count,
      }));

      const folderData = folderStats.map((item) => ({
        folderName: item._id || "General",
        count: item.count,
      }));

      return {
        totalGalleries: galleryStats.totalGalleries,
        activeGalleries: galleryStats.activeGalleries,
        inactiveGalleries: galleryStats.inactiveGalleries,
        totalMediaFiles: mediaData.totalMediaFiles,
        galleriesByOwner: ownerData,
        galleriesByFolder: folderData,
      };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get gallery statistics with folders");
    }
  }
}

export const galleryRepository = new GalleryRepository();
