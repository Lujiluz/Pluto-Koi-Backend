import { Request, Response, NextFunction } from "express";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { galleryService } from "../services/gallery.service.js";
import { validateCreateGallery, validateUpdateGallery, validateGetGalleriesQuery, validateSearchGalleries, validateGalleriesByOwner, validateGalleryId, validateFeaturedGalleriesQuery } from "../validations/gallery.validation.js";

export class GalleryController {
  /**
   * Create a new gallery
   * POST /api/galleries
   */
  async createGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = validateCreateGallery.parse(req.body);

      // Extract files from multer
      const files = req.files as Express.Multer.File[] | undefined;

      // Prepare service data
      const serviceData = {
        ...validatedData,
        media: files,
      };

      const result = await galleryService.createGallery(serviceData);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all galleries with pagination and filtering
   * GET /api/galleries
   */
  async getAllGalleries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery = validateGetGalleriesQuery.parse(req.query);

      const { page = 1, limit = 10, isActive, search, owner, folderName, galleryType } = validatedQuery;

      const result = await galleryService.getAllGalleries(page, limit, isActive, search, owner, folderName, galleryType);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gallery by ID
   * GET /api/galleries/:galleryId
   */
  async getGalleryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate gallery ID
      const { galleryId } = validateGalleryId.parse(req.params);

      const result = await galleryService.getGalleryById(galleryId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update gallery by ID
   * PUT /api/galleries/:galleryId
   */
  async updateGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate gallery ID
      const { galleryId } = validateGalleryId.parse(req.params);

      // Validate request body
      const validatedData = validateUpdateGallery.parse(req.body);

      // Extract files from multer
      const files = req.files as Express.Multer.File[] | undefined;

      // Prepare service data
      const serviceData = {
        ...validatedData,
        media: files,
      };

      console.log("serviceData: ", serviceData);

      const result = await galleryService.updateGallery(galleryId, serviceData);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete gallery by ID (soft delete)
   * DELETE /api/galleries/:galleryId
   */
  async deleteGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate gallery ID
      const { galleryId } = validateGalleryId.parse(req.params);

      const result = await galleryService.deleteGallery(galleryId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Permanently delete gallery by ID
   * DELETE /api/galleries/:galleryId/permanent
   */
  async permanentlyDeleteGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate gallery ID
      const { galleryId } = validateGalleryId.parse(req.params);

      const result = await galleryService.permanentlyDeleteGallery(galleryId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get galleries by owner
   * GET /api/galleries/owner/:owner
   */
  async getGalleriesByOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate owner parameter
      const { owner } = validateGalleriesByOwner.parse(req.params);

      const result = await galleryService.getGalleriesByOwner(owner);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get featured galleries
   * GET /api/galleries/featured
   */
  async getFeaturedGalleries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery = validateFeaturedGalleriesQuery.parse(req.query);
      const { limit = 10 } = validatedQuery;

      const result = await galleryService.getFeaturedGalleries(limit);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search galleries
   * GET /api/galleries/search
   */
  async searchGalleries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate search query
      const { q } = validateSearchGalleries.parse(req.query);

      const result = await galleryService.searchGalleries(q);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle gallery active status
   * PATCH /api/galleries/:galleryId/toggle-status
   */
  async toggleGalleryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate gallery ID
      const { galleryId } = validateGalleryId.parse(req.params);

      const result = await galleryService.toggleGalleryStatus(galleryId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get galleries with media count
   * GET /api/galleries/media-count
   */
  async getGalleriesWithMediaCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await galleryService.getGalleriesWithMediaCount();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload media to existing gallery
   * POST /api/galleries/:galleryId/media
   */
  async uploadMediaToGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate gallery ID
      const { galleryId } = validateGalleryId.parse(req.params);

      // Extract files from multer
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        throw new CustomErrorHandler(400, "No media files provided");
      }

      // Use update service with keepExistingMedia=true
      const result = await galleryService.updateGallery(galleryId, {
        media: files,
        keepExistingMedia: true,
      });

      res.status(200).json({
        status: "success",
        message: "Media uploaded successfully",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove all media from gallery
   * DELETE /api/galleries/:galleryId/media
   */
  async removeAllMediaFromGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate gallery ID
      const { galleryId } = validateGalleryId.parse(req.params);

      // Update gallery with empty media array
      const result = await galleryService.updateGallery(galleryId, {
        media: [],
        keepExistingMedia: false,
      });

      res.status(200).json({
        status: "success",
        message: "All media removed successfully",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const galleryController = new GalleryController();
