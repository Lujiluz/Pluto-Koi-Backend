import { Router } from "express";
import { galleryFolderController } from "../../controllers/gallery-folder.controller.js";

const router = Router();

/**
 * Admin Gallery Folder Routes
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

/**
 * @route POST /api/admin/gallery-folders
 * @desc Create a new gallery folder
 * @access Private (Admin only)
 */
router.post("/", galleryFolderController.createGalleryFolder);

/**
 * @route GET /api/admin/gallery-folders
 * @desc Get all gallery folders with pagination and filtering
 * @access Private (Admin only)
 */
router.get("/", galleryFolderController.getAllGalleryFolders);

/**
 * @route GET /api/admin/gallery-folders/active
 * @desc Get all active gallery folders
 * @access Private (Admin only)
 */
router.get("/active", galleryFolderController.getActiveGalleryFolders);

/**
 * @route GET /api/admin/gallery-folders/search
 * @desc Search gallery folders
 * @access Private (Admin only)
 */
router.get("/search", galleryFolderController.searchGalleryFolders);

/**
 * @route GET /api/admin/gallery-folders/with-gallery-count
 * @desc Get gallery folders with gallery count
 * @access Private (Admin only)
 */
router.get("/with-gallery-count", galleryFolderController.getGalleryFoldersWithGalleryCount);

/**
 * @route POST /api/admin/gallery-folders/ensure-general
 * @desc Ensure General folder exists
 * @access Private (Admin only)
 */
router.post("/ensure-general", galleryFolderController.ensureGeneralFolderExists);

/**
 * @route GET /api/admin/gallery-folders/name/:folderName
 * @desc Get gallery folder by name
 * @access Private (Admin only)
 */
router.get("/name/:folderName", galleryFolderController.getGalleryFolderByName);

/**
 * @route GET /api/admin/gallery-folders/:folderId
 * @desc Get gallery folder by ID
 * @access Private (Admin only)
 */
router.get("/:folderId", galleryFolderController.getGalleryFolderById);

/**
 * @route PUT /api/admin/gallery-folders/:folderId
 * @desc Update gallery folder by ID
 * @access Private (Admin only)
 */
router.put("/:folderId", galleryFolderController.updateGalleryFolder);

/**
 * @route PATCH /api/admin/gallery-folders/:folderId/toggle-status
 * @desc Toggle gallery folder active status
 * @access Private (Admin only)
 */
router.patch("/:folderId/toggle-status", galleryFolderController.toggleGalleryFolderStatus);

/**
 * @route DELETE /api/admin/gallery-folders/:folderId
 * @desc Delete gallery folder by ID (soft delete)
 * @access Private (Admin only)
 */
router.delete("/:folderId", galleryFolderController.deleteGalleryFolder);

/**
 * @route DELETE /api/admin/gallery-folders/:folderId/permanent
 * @desc Permanently delete gallery folder by ID
 * @access Private (Admin only)
 */
router.delete("/:folderId/permanent", galleryFolderController.permanentlyDeleteGalleryFolder);

export default router;
