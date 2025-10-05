import { GeneralResponse } from "#interfaces/global.interface.js";
import { CustomErrorHandler } from "#middleware/errorHandler.js";
import { IGallery } from "#models/gallery.model.js";
import { galleryRepository, CreateGalleryData, UpdateGalleryData } from "#repository/gallery.repository.js";
import { processUploadedFiles, validateFiles, deleteFile } from "#utils/fileUpload.js";

export interface CreateGalleryServiceData {
  galleryName: string;
  owner: string;
  handling: string;
  isActive?: boolean;
  media?: Express.Multer.File[];
}

export interface UpdateGalleryServiceData {
  galleryName?: string;
  owner?: string;
  handling?: string;
  isActive?: boolean;
  media?: Express.Multer.File[];
  keepExistingMedia?: boolean;
}

export class GalleryService {
  /**
   * Create a new gallery with media upload support
   */
  async createGallery(galleryData: CreateGalleryServiceData): Promise<GeneralResponse<IGallery>> {
    try {
      const { media, ...galleryFields } = galleryData;

      // Validate required fields
      if (!galleryFields.galleryName || !galleryFields.owner || !galleryFields.handling) {
        throw new CustomErrorHandler(400, "Missing required fields: galleryName, owner, handling");
      }

      // Check if gallery name already exists
      const existingGallery = await galleryRepository.existsByName(galleryFields.galleryName);
      if (existingGallery) {
        throw new CustomErrorHandler(409, "Gallery with this name already exists");
      }

      // Validate and process media files if provided
      let processedMedia: any[] = [];
      if (media && media.length > 0) {
        // Validate files
        const validation = validateFiles(media, 20); // Allow up to 20 files for galleries
        if (!validation.isValid) {
          throw new CustomErrorHandler(400, `File validation failed: ${validation.errors.join(", ")}`);
        }

        try {
          // Process and save files
          processedMedia = await processUploadedFiles(media, "gallery");
        } catch (error) {
          console.error("Error processing media files:", error);
          throw new CustomErrorHandler(500, "Failed to process media files");
        }
      }

      // Prepare gallery data for database
      const galleryToCreate: CreateGalleryData = {
        galleryName: galleryFields.galleryName.trim(),
        owner: galleryFields.owner.trim(),
        handling: galleryFields.handling.trim(),
        isActive: galleryFields.isActive !== undefined ? galleryFields.isActive : true,
        media: processedMedia.map((file) => ({ fileUrl: file.fileUrl })),
      };

      // Create gallery in database
      const createdGallery = await galleryRepository.create(galleryToCreate);

      return {
        status: "success",
        message: "Gallery created successfully",
        data: createdGallery,
      };
    } catch (error) {
      console.error("Error creating gallery:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to create gallery");
    }
  }

  /**
   * Get all galleries with pagination and filtering
   */
  async getAllGalleries(page: number = 1, limit: number = 10, isActive?: boolean, search?: string, owner?: string): Promise<GeneralResponse<{ galleries: IGallery[]; metadata: any; statistics: any }>> {
    try {
      const filters: { isActive?: boolean; search?: string; owner?: string } = {};

      if (isActive !== undefined) {
        filters.isActive = isActive;
      }

      if (search) {
        filters.search = search.trim();
      }

      if (owner) {
        filters.owner = owner.trim();
      }

      const { galleries, metadata } = await galleryRepository.findAll(page, limit, filters);
      const statistics = await galleryRepository.getGalleryStats();

      return {
        status: "success",
        message: "Galleries retrieved successfully",
        data: { galleries, metadata, statistics },
      };
    } catch (error) {
      console.error("Error retrieving galleries:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve galleries");
    }
  }

  /**
   * Get gallery by ID
   */
  async getGalleryById(galleryId: string): Promise<GeneralResponse<IGallery | null>> {
    try {
      const gallery = await galleryRepository.findById(galleryId);

      if (!gallery) {
        throw new CustomErrorHandler(404, "Gallery not found");
      }

      return {
        status: "success",
        message: "Gallery retrieved successfully",
        data: gallery,
      };
    } catch (error) {
      console.error("Error retrieving gallery:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to retrieve gallery");
    }
  }

  /**
   * Update gallery by ID with media upload support
   */
  async updateGallery(galleryId: string, updateData: UpdateGalleryServiceData): Promise<GeneralResponse<IGallery | null>> {
    try {
      // Check if gallery exists
      const existingGallery = await galleryRepository.findById(galleryId);
      if (!existingGallery) {
        throw new CustomErrorHandler(404, "Gallery not found");
      }

      const { media, keepExistingMedia = false, ...galleryFields } = updateData;

      // Validate gallery name uniqueness if being updated
      if (galleryFields.galleryName) {
        const nameExists = await galleryRepository.existsByName(galleryFields.galleryName, galleryId);
        if (nameExists) {
          throw new CustomErrorHandler(409, "Gallery with this name already exists");
        }
      }

      // Handle media update
      let finalMedia = existingGallery.media;

      if (media && media.length > 0) {
        // Validate files
        const validation = validateFiles(media, 20); // Allow up to 20 files for galleries
        if (!validation.isValid) {
          throw new CustomErrorHandler(400, `File validation failed: ${validation.errors.join(", ")}`);
        }

        try {
          // Process new files
          const processedMedia = await processUploadedFiles(media, "gallery");

          if (keepExistingMedia) {
            // Append new media to existing
            finalMedia = [...existingGallery.media, ...processedMedia.map((file) => ({ fileUrl: file.fileUrl }))];
          } else {
            // Replace all media with new files
            // Note: In production, you might want to delete old files
            finalMedia = processedMedia.map((file) => ({ fileUrl: file.fileUrl }));
          }
        } catch (error) {
          console.error("Error processing media files:", error);
          throw new CustomErrorHandler(500, "Failed to process media files");
        }
      }

      // Prepare update data
      const updatePayload: UpdateGalleryData = {
        ...galleryFields,
        media: finalMedia,
      };

      // Remove undefined values
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key as keyof UpdateGalleryData] === undefined) {
          delete updatePayload[key as keyof UpdateGalleryData];
        }
      });

      // Update gallery
      const updatedGallery = await galleryRepository.updateById(galleryId, updatePayload);

      return {
        status: "success",
        message: "Gallery updated successfully",
        data: updatedGallery,
      };
    } catch (error) {
      console.error("Error updating gallery:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to update gallery");
    }
  }

  /**
   * Delete gallery by ID (soft delete)
   */
  async deleteGallery(galleryId: string): Promise<GeneralResponse<null>> {
    try {
      const success = await galleryRepository.deleteById(galleryId);

      if (!success) {
        throw new CustomErrorHandler(404, "Gallery not found");
      }

      return {
        status: "success",
        message: "Gallery deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error deleting gallery:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to delete gallery");
    }
  }

  /**
   * Permanently delete gallery by ID
   */
  async permanentlyDeleteGallery(galleryId: string): Promise<GeneralResponse<null>> {
    try {
      // Get gallery first to handle file cleanup
      const gallery = await galleryRepository.findById(galleryId);
      if (!gallery) {
        throw new CustomErrorHandler(404, "Gallery not found");
      }

      // Delete associated files (optional - implement based on your needs)
      // gallery.media.forEach(media => {
      //   const filePath = media.fileUrl.replace(process.env.BASE_URL || '', 'public');
      //   deleteFile(filePath);
      // });

      const success = await galleryRepository.hardDeleteById(galleryId);

      if (!success) {
        throw new CustomErrorHandler(404, "Gallery not found");
      }

      return {
        status: "success",
        message: "Gallery permanently deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error permanently deleting gallery:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to permanently delete gallery");
    }
  }

  /**
   * Get galleries by owner
   */
  async getGalleriesByOwner(owner: string): Promise<GeneralResponse<IGallery[]>> {
    try {
      if (!owner || owner.trim().length === 0) {
        throw new CustomErrorHandler(400, "Owner name is required");
      }

      const galleries = await galleryRepository.findByOwner(owner.trim());

      return {
        status: "success",
        message: "Galleries by owner retrieved successfully",
        data: galleries,
      };
    } catch (error) {
      console.error("Error getting galleries by owner:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to get galleries by owner");
    }
  }

  /**
   * Get featured galleries
   */
  async getFeaturedGalleries(limit: number = 10): Promise<GeneralResponse<IGallery[]>> {
    try {
      const galleries = await galleryRepository.getFeaturedGalleries(limit);

      return {
        status: "success",
        message: "Featured galleries retrieved successfully",
        data: galleries,
      };
    } catch (error) {
      console.error("Error getting featured galleries:", error);
      throw new CustomErrorHandler(500, "Failed to get featured galleries");
    }
  }

  /**
   * Search galleries
   */
  async searchGalleries(searchTerm: string): Promise<GeneralResponse<IGallery[]>> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new CustomErrorHandler(400, "Search term must be at least 2 characters long");
      }

      const galleries = await galleryRepository.searchGalleries(searchTerm.trim());

      return {
        status: "success",
        message: "Gallery search completed successfully",
        data: galleries,
      };
    } catch (error) {
      console.error("Error searching galleries:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to search galleries");
    }
  }

  /**
   * Toggle gallery active status
   */
  async toggleGalleryStatus(galleryId: string): Promise<GeneralResponse<IGallery | null>> {
    try {
      const gallery = await galleryRepository.findById(galleryId);
      if (!gallery) {
        throw new CustomErrorHandler(404, "Gallery not found");
      }

      const updatedGallery = await galleryRepository.updateById(galleryId, {
        isActive: !gallery.isActive,
      });

      return {
        status: "success",
        message: `Gallery ${updatedGallery?.isActive ? "activated" : "deactivated"} successfully`,
        data: updatedGallery,
      };
    } catch (error) {
      console.error("Error toggling gallery status:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to toggle gallery status");
    }
  }

  /**
   * Get galleries with media count
   */
  async getGalleriesWithMediaCount(): Promise<GeneralResponse<any[]>> {
    try {
      const galleries = await galleryRepository.getGalleriesWithMediaCount();

      return {
        status: "success",
        message: "Galleries with media count retrieved successfully",
        data: galleries,
      };
    } catch (error) {
      console.error("Error getting galleries with media count:", error);
      throw new CustomErrorHandler(500, "Failed to get galleries with media count");
    }
  }
}

export const galleryService = new GalleryService();
