import { Router } from "express";
import { galleryController } from "../controllers/gallery.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { uploadGalleryMedia, handleMulterError } from "../middleware/uploadMiddleware.js";

const router = Router();

/**
 * Gallery Routes
 */

// Public routes (anyone can view galleries)
/**
 * @route GET /api/galleries
 * @desc Get all galleries with pagination and filtering
 * @access Public
 */
router.get("/", galleryController.getAllGalleries);

/**
 * @route GET /api/galleries/featured
 * @desc Get featured galleries
 * @access Public
 */
router.get("/featured", galleryController.getFeaturedGalleries);

/**
 * @route GET /api/galleries/search
 * @desc Search galleries
 * @access Public
 */
router.get("/search", galleryController.searchGalleries);

/**
 * @route GET /api/galleries/media-count
 * @desc Get galleries with media count statistics
 * @access Public
 */
router.get("/media-count", galleryController.getGalleriesWithMediaCount);

/**
 * @route GET /api/galleries/owner/:owner
 * @desc Get galleries by owner
 * @access Public
 */
router.get("/owner/:owner", galleryController.getGalleriesByOwner);

/**
 * @route GET /api/galleries/:galleryId
 * @desc Get gallery by ID
 * @access Public
 */
router.get("/:galleryId", galleryController.getGalleryById);

// Protected routes (require authentication)
/**
 * @route POST /api/galleries
 * @desc Create a new gallery
 * @access Private
 */
router.post(
  "/",
  authenticateToken,
  uploadGalleryMedia,
  galleryController.createGallery
);

/**
 * @route PUT /api/galleries/:galleryId
 * @desc Update gallery by ID
 * @access Private
 */
router.put("/:galleryId", authenticateToken, uploadGalleryMedia, galleryController.updateGallery);

/**
 * @route DELETE /api/galleries/:galleryId
 * @desc Delete gallery by ID (soft delete)
 * @access Private
 */
router.delete("/:galleryId", authenticateToken, galleryController.deleteGallery);

/**
 * @route DELETE /api/galleries/:galleryId/permanent
 * @desc Permanently delete gallery by ID
 * @access Private
 */
router.delete("/:galleryId/permanent", authenticateToken, galleryController.permanentlyDeleteGallery);

/**
 * @route PATCH /api/galleries/:galleryId/toggle-status
 * @desc Toggle gallery active status
 * @access Private
 */
router.patch("/:galleryId/toggle-status", authenticateToken, galleryController.toggleGalleryStatus);

/**
 * @route POST /api/galleries/:galleryId/media
 * @desc Upload additional media to existing gallery
 * @access Private
 */
router.post("/:galleryId/media", authenticateToken, uploadGalleryMedia, galleryController.uploadMediaToGallery);

/**
 * @route DELETE /api/galleries/:galleryId/media
 * @desc Remove all media from gallery
 * @access Private
 */
router.delete("/:galleryId/media", authenticateToken, galleryController.removeAllMediaFromGallery);

export default router;