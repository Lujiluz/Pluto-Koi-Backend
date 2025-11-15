import { Request, Response, NextFunction } from "express";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { galleryFolderService } from "../services/gallery-folder.service.js";
import { validateCreateGalleryFolder, validateUpdateGalleryFolder, validateGetGalleryFoldersQuery, validateSearchGalleryFolders, validateGalleryFolderId, validateGalleryFolderName } from "../validations/gallery-folder.validation.js";

export class GalleryFolderController {
  /**
   * Create a new gallery folder
   * POST /api/gallery-folders
   */
  async createGalleryFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = validateCreateGalleryFolder.parse(req.body);

      const result = await galleryFolderService.createGalleryFolder(validatedData);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all gallery folders with pagination and filtering
   * GET /api/gallery-folders
   */
  async getAllGalleryFolders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery = validateGetGalleryFoldersQuery.parse(req.query);

      const { page = 1, limit = 10, isActive, search } = validatedQuery;

      const result = await galleryFolderService.getAllGalleryFolders(page, limit, isActive, search);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all active gallery folders (for dropdown/selection purposes)
   * GET /api/gallery-folders/active
   */
  async getActiveGalleryFolders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await galleryFolderService.getActiveGalleryFolders();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gallery folder by ID
   * GET /api/gallery-folders/:folderId
   */
  async getGalleryFolderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate folder ID
      const { folderId } = validateGalleryFolderId.parse(req.params);

      const result = await galleryFolderService.getGalleryFolderById(folderId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gallery folder by name
   * GET /api/gallery-folders/name/:folderName
   */
  async getGalleryFolderByName(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate folder name
      const { folderName } = validateGalleryFolderName.parse(req.params);

      const result = await galleryFolderService.getGalleryFolderByName(folderName);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update gallery folder by ID
   * PUT /api/gallery-folders/:folderId
   */
  async updateGalleryFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate folder ID
      const { folderId } = validateGalleryFolderId.parse(req.params);

      // Validate request body
      const validatedData = validateUpdateGalleryFolder.parse(req.body);

      const result = await galleryFolderService.updateGalleryFolder(folderId, validatedData);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete gallery folder by ID (soft delete)
   * DELETE /api/gallery-folders/:folderId
   */
  async deleteGalleryFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate folder ID
      const { folderId } = validateGalleryFolderId.parse(req.params);

      const result = await galleryFolderService.deleteGalleryFolder(folderId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Permanently delete gallery folder by ID
   * DELETE /api/gallery-folders/:folderId/permanent
   */
  async permanentlyDeleteGalleryFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate folder ID
      const { folderId } = validateGalleryFolderId.parse(req.params);

      const result = await galleryFolderService.permanentlyDeleteGalleryFolder(folderId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search gallery folders
   * GET /api/gallery-folders/search
   */
  async searchGalleryFolders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate search query
      const { q } = validateSearchGalleryFolders.parse(req.query);

      const result = await galleryFolderService.searchGalleryFolders(q);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle gallery folder active status
   * PATCH /api/gallery-folders/:folderId/toggle-status
   */
  async toggleGalleryFolderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate folder ID
      const { folderId } = validateGalleryFolderId.parse(req.params);

      const result = await galleryFolderService.toggleGalleryFolderStatus(folderId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gallery folders with gallery count
   * GET /api/gallery-folders/with-gallery-count
   */
  async getGalleryFoldersWithGalleryCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await galleryFolderService.getGalleryFoldersWithGalleryCount();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ensure General folder exists (initialization endpoint)
   * POST /api/gallery-folders/ensure-general
   */
  async ensureGeneralFolderExists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await galleryFolderService.ensureGeneralFolderExists();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const galleryFolderController = new GalleryFolderController();
