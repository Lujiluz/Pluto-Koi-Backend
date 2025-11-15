import { GeneralResponse } from "../interfaces/global.interface.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { IGalleryFolder } from "../models/gallery-folder.model.js";
import { galleryFolderRepository, CreateGalleryFolderData, UpdateGalleryFolderData } from "../repository/gallery-folder.repository.js";

export interface CreateGalleryFolderServiceData {
  folderName: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateGalleryFolderServiceData {
  folderName?: string;
  description?: string;
  isActive?: boolean;
}

export class GalleryFolderService {
  /**
   * Create a new gallery folder
   */
  async createGalleryFolder(folderData: CreateGalleryFolderServiceData): Promise<GeneralResponse<IGalleryFolder>> {
    try {
      // Validate required fields
      if (!folderData.folderName) {
        throw new CustomErrorHandler(400, "Folder name is required");
      }

      // Check if folder name already exists
      const existingFolder = await galleryFolderRepository.existsByName(folderData.folderName);
      if (existingFolder) {
        throw new CustomErrorHandler(409, "Folder with this name already exists");
      }

      // Prepare folder data for database
      const folderToCreate: CreateGalleryFolderData = {
        folderName: folderData.folderName.trim(),
        description: folderData.description?.trim(),
        isActive: folderData.isActive !== undefined ? folderData.isActive : true,
      };

      // Create folder in database
      const createdFolder = await galleryFolderRepository.create(folderToCreate);

      return {
        status: "success",
        message: "Gallery folder created successfully",
        data: createdFolder,
      };
    } catch (error) {
      console.error("Error creating gallery folder:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to create gallery folder");
    }
  }

  /**
   * Get all gallery folders with pagination and filtering
   */
  async getAllGalleryFolders(page: number = 1, limit: number = 10, isActive?: boolean, search?: string): Promise<GeneralResponse<{ folders: IGalleryFolder[]; metadata: any; statistics: any }>> {
    try {
      const filters: { isActive?: boolean; search?: string } = {};

      if (isActive !== undefined) {
        filters.isActive = isActive;
      }

      if (search) {
        filters.search = search.trim();
      }

      const { folders, metadata } = await galleryFolderRepository.findAll(page, limit, filters);
      const statistics = await galleryFolderRepository.getFolderStats();

      return {
        status: "success",
        message: "Gallery folders retrieved successfully",
        data: { folders, metadata, statistics },
      };
    } catch (error) {
      console.error("Error retrieving gallery folders:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve gallery folders");
    }
  }

  /**
   * Get all active gallery folders (for dropdown/selection purposes)
   */
  async getActiveGalleryFolders(): Promise<GeneralResponse<IGalleryFolder[]>> {
    try {
      const folders = await galleryFolderRepository.findAllActive();

      return {
        status: "success",
        message: "Active gallery folders retrieved successfully",
        data: folders,
      };
    } catch (error) {
      console.error("Error retrieving active gallery folders:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve active gallery folders");
    }
  }

  /**
   * Get gallery folder by ID
   */
  async getGalleryFolderById(folderId: string): Promise<GeneralResponse<IGalleryFolder | null>> {
    try {
      const folder = await galleryFolderRepository.findById(folderId);

      if (!folder) {
        throw new CustomErrorHandler(404, "Gallery folder not found");
      }

      return {
        status: "success",
        message: "Gallery folder retrieved successfully",
        data: folder,
      };
    } catch (error) {
      console.error("Error retrieving gallery folder:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to retrieve gallery folder");
    }
  }

  /**
   * Get gallery folder by name
   */
  async getGalleryFolderByName(folderName: string): Promise<GeneralResponse<IGalleryFolder | null>> {
    try {
      if (!folderName || folderName.trim().length === 0) {
        throw new CustomErrorHandler(400, "Folder name is required");
      }

      const folder = await galleryFolderRepository.findByName(folderName.trim());

      if (!folder) {
        throw new CustomErrorHandler(404, "Gallery folder not found");
      }

      return {
        status: "success",
        message: "Gallery folder retrieved successfully",
        data: folder,
      };
    } catch (error) {
      console.error("Error retrieving gallery folder by name:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to retrieve gallery folder by name");
    }
  }

  /**
   * Update gallery folder by ID
   */
  async updateGalleryFolder(folderId: string, updateData: UpdateGalleryFolderServiceData): Promise<GeneralResponse<IGalleryFolder | null>> {
    try {
      // Check if folder exists
      const existingFolder = await galleryFolderRepository.findById(folderId);
      if (!existingFolder) {
        throw new CustomErrorHandler(404, "Gallery folder not found");
      }

      // Prevent modification of General folder name
      if (existingFolder.folderName === "General" && updateData.folderName && updateData.folderName !== "General") {
        throw new CustomErrorHandler(400, "General folder name cannot be changed");
      }

      // Prevent deactivation of General folder
      if (existingFolder.folderName === "General" && updateData.isActive === false) {
        throw new CustomErrorHandler(400, "General folder cannot be deactivated");
      }

      // Validate folder name uniqueness if being updated
      if (updateData.folderName && updateData.folderName !== existingFolder.folderName) {
        const nameExists = await galleryFolderRepository.existsByName(updateData.folderName, folderId);
        if (nameExists) {
          throw new CustomErrorHandler(409, "Folder with this name already exists");
        }
      }

      // Prepare update data
      const updatePayload: UpdateGalleryFolderData = {};

      if (updateData.folderName !== undefined) {
        updatePayload.folderName = updateData.folderName.trim();
      }

      if (updateData.description !== undefined) {
        updatePayload.description = updateData.description?.trim();
      }

      if (updateData.isActive !== undefined) {
        updatePayload.isActive = updateData.isActive;
      }

      // Remove undefined values
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key as keyof UpdateGalleryFolderData] === undefined) {
          delete updatePayload[key as keyof UpdateGalleryFolderData];
        }
      });

      // Update folder
      const updatedFolder = await galleryFolderRepository.updateById(folderId, updatePayload);

      return {
        status: "success",
        message: "Gallery folder updated successfully",
        data: updatedFolder,
      };
    } catch (error) {
      console.error("Error updating gallery folder:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to update gallery folder");
    }
  }

  /**
   * Delete gallery folder by ID (soft delete) and move galleries to General folder
   */
  async deleteGalleryFolder(folderId: string): Promise<GeneralResponse<null>> {
    try {
      // Check if folder exists
      const folder = await galleryFolderRepository.findById(folderId);
      if (!folder) {
        throw new CustomErrorHandler(404, "Gallery folder not found");
      }

      // Prevent deletion of General folder
      if (folder.folderName === "General") {
        throw new CustomErrorHandler(400, "General folder cannot be deleted");
      }

      const success = await galleryFolderRepository.deleteById(folderId);

      if (!success) {
        throw new CustomErrorHandler(404, "Gallery folder not found");
      }

      return {
        status: "success",
        message: "Gallery folder deleted successfully. All galleries moved to General folder.",
        data: null,
      };
    } catch (error) {
      console.error("Error deleting gallery folder:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to delete gallery folder");
    }
  }

  /**
   * Permanently delete gallery folder by ID and move galleries to General folder
   */
  async permanentlyDeleteGalleryFolder(folderId: string): Promise<GeneralResponse<null>> {
    try {
      // Check if folder exists
      const folder = await galleryFolderRepository.findById(folderId);
      if (!folder) {
        throw new CustomErrorHandler(404, "Gallery folder not found");
      }

      // Prevent deletion of General folder
      if (folder.folderName === "General") {
        throw new CustomErrorHandler(400, "General folder cannot be deleted");
      }

      const success = await galleryFolderRepository.hardDeleteById(folderId);

      if (!success) {
        throw new CustomErrorHandler(404, "Gallery folder not found");
      }

      return {
        status: "success",
        message: "Gallery folder permanently deleted successfully. All galleries moved to General folder.",
        data: null,
      };
    } catch (error) {
      console.error("Error permanently deleting gallery folder:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to permanently delete gallery folder");
    }
  }

  /**
   * Search gallery folders
   */
  async searchGalleryFolders(searchTerm: string): Promise<GeneralResponse<IGalleryFolder[]>> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new CustomErrorHandler(400, "Search term must be at least 2 characters long");
      }

      const folders = await galleryFolderRepository.searchFolders(searchTerm.trim());

      return {
        status: "success",
        message: "Gallery folder search completed successfully",
        data: folders,
      };
    } catch (error) {
      console.error("Error searching gallery folders:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to search gallery folders");
    }
  }

  /**
   * Get gallery folders with gallery count
   */
  async getGalleryFoldersWithGalleryCount(): Promise<GeneralResponse<any[]>> {
    try {
      const foldersWithCount = await galleryFolderRepository.getFoldersWithGalleryCount();

      return {
        status: "success",
        message: "Gallery folders with gallery count retrieved successfully",
        data: foldersWithCount,
      };
    } catch (error) {
      console.error("Error getting gallery folders with gallery count:", error);
      throw new CustomErrorHandler(500, "Failed to get gallery folders with gallery count");
    }
  }

  /**
   * Ensure General folder exists
   */
  async ensureGeneralFolderExists(): Promise<GeneralResponse<IGalleryFolder>> {
    try {
      const generalFolder = await galleryFolderRepository.ensureGeneralFolderExists();

      return {
        status: "success",
        message: "General folder ensured successfully",
        data: generalFolder,
      };
    } catch (error) {
      console.error("Error ensuring General folder exists:", error);
      throw new CustomErrorHandler(500, "Failed to ensure General folder exists");
    }
  }

  /**
   * Toggle gallery folder active status
   */
  async toggleGalleryFolderStatus(folderId: string): Promise<GeneralResponse<IGalleryFolder | null>> {
    try {
      const folder = await galleryFolderRepository.findById(folderId);
      if (!folder) {
        throw new CustomErrorHandler(404, "Gallery folder not found");
      }

      // Prevent deactivation of General folder
      if (folder.folderName === "General" && folder.isActive) {
        throw new CustomErrorHandler(400, "General folder cannot be deactivated");
      }

      const updatedFolder = await galleryFolderRepository.updateById(folderId, {
        isActive: !folder.isActive,
      });

      return {
        status: "success",
        message: `Gallery folder ${updatedFolder?.isActive ? "activated" : "deactivated"} successfully`,
        data: updatedFolder,
      };
    } catch (error) {
      console.error("Error toggling gallery folder status:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to toggle gallery folder status");
    }
  }
}

export const galleryFolderService = new GalleryFolderService();
