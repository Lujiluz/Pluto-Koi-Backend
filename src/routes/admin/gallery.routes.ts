import { Router } from "express";
import { galleryController } from "../../controllers/gallery.controller.js";
import { uploadGalleryMedia } from "../../middleware/uploadMiddleware.js";

const router = Router();

/**
 * Admin Gallery Routes
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

/**
 * @route GET /api/admin/gallery
 * @desc Get all galleries with pagination and filtering
 * @access Private (Admin only)
 */
router.get("/", galleryController.getAllGalleries);

/**
 * @route GET /api/admin/gallery/featured
 * @desc Get featured galleries
 * @access Private (Admin only)
 */
router.get("/featured", galleryController.getFeaturedGalleries);

/**
 * @route GET /api/admin/gallery/search
 * @desc Search galleries
 * @access Private (Admin only)
 */
router.get("/search", galleryController.searchGalleries);

/**
 * @route GET /api/admin/gallery/media-count
 * @desc Get galleries with media count statistics
 * @access Private (Admin only)
 */
router.get("/media-count", galleryController.getGalleriesWithMediaCount);

/**
 * @route GET /api/admin/gallery/owner/:owner
 * @desc Get galleries by owner
 * @access Private (Admin only)
 */
router.get("/owner/:owner", galleryController.getGalleriesByOwner);

/**
 * @route GET /api/admin/gallery/:galleryId
 * @desc Get gallery by ID
 * @access Private (Admin only)
 */
router.get("/:galleryId", galleryController.getGalleryById);

/**
 * @route POST /api/admin/gallery
 * @desc Create a new gallery
 * @access Private (Admin only)
 */
router.post("/", uploadGalleryMedia, galleryController.createGallery);

/**
 * @route PUT /api/admin/gallery/:galleryId
 * @desc Update gallery by ID
 * @access Private (Admin only)
 */
router.put("/:galleryId", uploadGalleryMedia, galleryController.updateGallery);

/**
 * @route DELETE /api/admin/gallery/:galleryId
 * @desc Delete gallery by ID (soft delete)
 * @access Private (Admin only)
 */
router.delete("/:galleryId", galleryController.deleteGallery);

/**
 * @route DELETE /api/admin/gallery/:galleryId/permanent
 * @desc Permanently delete gallery by ID
 * @access Private (Admin only)
 */
router.delete("/:galleryId/permanent", galleryController.permanentlyDeleteGallery);

/**
 * @route PATCH /api/admin/gallery/:galleryId/toggle-status
 * @desc Toggle gallery active status
 * @access Private (Admin only)
 */
router.patch("/:galleryId/toggle-status", galleryController.toggleGalleryStatus);

/**
 * @route POST /api/admin/gallery/:galleryId/media
 * @desc Upload additional media to existing gallery
 * @access Private (Admin only)
 */
router.post("/:galleryId/media", uploadGalleryMedia, galleryController.uploadMediaToGallery);

/**
 * @route DELETE /api/admin/gallery/:galleryId/media
 * @desc Remove all media from gallery
 * @access Private (Admin only)
 */
router.delete("/:galleryId/media", galleryController.removeAllMediaFromGallery);

export default router;
