import { Router } from "express";
import { galleryController } from "#controllers/gallery.controller.js";
import { authenticateToken, requireRole } from "#middleware/auth.middleware.js";
import { uploadGalleryMedia, handleMulterError } from "#middleware/uploadMiddleware.js";

const router = Router();

/**
 * Gallery Routes
 * All routes are protected and require authentication
 */

// Public routes (anyone can view galleries)
/**
 * @route GET /api/galleries
 * @desc Get all galleries with pagination and filtering
 * @access Public
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10, max: 100)
 * @query {boolean} isActive - Filter by active status
 * @query {string} search - Search in gallery names, owner, or handling
 * @query {string} owner - Filter by owner name
 */
router.get("/", galleryController.getAllGalleries);

/**
 * @route GET /api/galleries/featured
 * @desc Get featured galleries
 * @access Public
 * @query {number} limit - Number of featured galleries to return (default: 10, max: 50)
 */
router.get("/featured", galleryController.getFeaturedGalleries);

/**
 * @route GET /api/galleries/search
 * @desc Search galleries
 * @access Public
 * @query {string} q - Search query (minimum 2 characters)
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
 * @param {string} owner - Owner name
 */
router.get("/owner/:owner", galleryController.getGalleriesByOwner);

/**
 * @route GET /api/galleries/:galleryId
 * @desc Get gallery by ID
 * @access Public
 * @param {string} galleryId - Gallery ID (MongoDB ObjectId)
 */
router.get("/:galleryId", galleryController.getGalleryById);

// Protected routes (require authentication)
/**
 * @route POST /api/galleries
 * @desc Create a new gallery
 * @access Private (Admin only)
 * @body {string} galleryName - Gallery name (required)
 * @body {string} owner - Owner name (required)
 * @body {string} handling - Handling information (required)
 * @body {boolean} isActive - Active status (optional, default: true)
 * @files media - Gallery media files (optional, max 20 files)
 */
router.post(
  "/",
  authenticateToken,
  requireRole(["admin"]),
  uploadGalleryMedia, // Allow up to 20 media files
  galleryController.createGallery
);

/**
 * @route PUT /api/galleries/:galleryId
 * @desc Update gallery by ID
 * @access Private (Admin only)
 * @param {string} galleryId - Gallery ID (MongoDB ObjectId)
 * @body {string} galleryName - Gallery name (optional)
 * @body {string} owner - Owner name (optional)
 * @body {string} handling - Handling information (optional)
 * @body {boolean} isActive - Active status (optional)
 * @body {boolean} keepExistingMedia - Whether to keep existing media when uploading new files (optional)
 * @files media - New media files (optional, max 20 files)
 */
router.put("/:galleryId", authenticateToken, requireRole(["admin"]), uploadGalleryMedia, galleryController.updateGallery);

/**
 * @route DELETE /api/galleries/:galleryId
 * @desc Delete gallery by ID (soft delete)
 * @access Private (Admin only)
 * @param {string} galleryId - Gallery ID (MongoDB ObjectId)
 */
router.delete("/:galleryId", authenticateToken, requireRole(["admin"]), galleryController.deleteGallery);

/**
 * @route DELETE /api/galleries/:galleryId/permanent
 * @desc Permanently delete gallery by ID
 * @access Private (Admin only)
 * @param {string} galleryId - Gallery ID (MongoDB ObjectId)
 */
router.delete("/:galleryId/permanent", authenticateToken, requireRole(["admin"]), galleryController.permanentlyDeleteGallery);

/**
 * @route PATCH /api/galleries/:galleryId/toggle-status
 * @desc Toggle gallery active status
 * @access Private (Admin only)
 * @param {string} galleryId - Gallery ID (MongoDB ObjectId)
 */
router.patch("/:galleryId/toggle-status", authenticateToken, requireRole(["admin"]), galleryController.toggleGalleryStatus);

/**
 * @route POST /api/galleries/:galleryId/media
 * @desc Upload additional media to existing gallery
 * @access Private (Admin only)
 * @param {string} galleryId - Gallery ID (MongoDB ObjectId)
 * @files media - Media files to add (required, max 20 files)
 */
router.post("/:galleryId/media", authenticateToken, requireRole(["admin"]), uploadGalleryMedia, galleryController.uploadMediaToGallery);

/**
 * @route DELETE /api/galleries/:galleryId/media
 * @desc Remove all media from gallery
 * @access Private (Admin only)
 * @param {string} galleryId - Gallery ID (MongoDB ObjectId)
 */
router.delete("/:galleryId/media", authenticateToken, requireRole(["admin"]), galleryController.removeAllMediaFromGallery);

export default router;
