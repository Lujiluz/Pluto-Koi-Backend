import { Router } from "express";
import { galleryFolderController } from "../controllers/gallery-folder.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @route POST /api/gallery-folders
 * @desc Create a new gallery folder
 * @access Private
 */
router.post("/", authenticateToken, galleryFolderController.createGalleryFolder);

/**
 * @route GET /api/gallery-folders
 * @desc Get all gallery folders with pagination and filtering
 * @access Private
 */
router.get("/", authenticateToken, galleryFolderController.getAllGalleryFolders);

/**
 * @route GET /api/gallery-folders/active
 * @desc Get all active gallery folders
 * @access Private
 */
router.get("/active", authenticateToken, galleryFolderController.getActiveGalleryFolders);

/**
 * @route GET /api/gallery-folders/active/public
 * @desc Get all gallery folders
 * @access Public
 */
router.get("/active/public", galleryFolderController.getAllGalleryFolders);

/**
 * @route GET /api/gallery-folders/search
 * @desc Search gallery folders
 * @access Private
 */
router.get("/search", authenticateToken, galleryFolderController.searchGalleryFolders);

/**
 * @route GET /api/gallery-folders/with-gallery-count
 * @desc Get gallery folders with gallery count
 * @access Private
 */
router.get("/with-gallery-count", authenticateToken, galleryFolderController.getGalleryFoldersWithGalleryCount);

/**
 * @route POST /api/gallery-folders/ensure-general
 * @desc Ensure General folder exists
 * @access Private
 */
router.post("/ensure-general", authenticateToken, galleryFolderController.ensureGeneralFolderExists);

/**
 * @route GET /api/gallery-folders/name/:folderName
 * @desc Get gallery folder by name
 * @access Private
 */
router.get("/name/:folderName", authenticateToken, galleryFolderController.getGalleryFolderByName);

/**
 * @route GET /api/gallery-folders/:folderId
 * @desc Get gallery folder by ID
 * @access Private
 */
router.get("/:folderId", authenticateToken, galleryFolderController.getGalleryFolderById);

/**
 * @route PUT /api/gallery-folders/:folderId
 * @desc Update gallery folder by ID
 * @access Private
 */
router.put("/:folderId", authenticateToken, galleryFolderController.updateGalleryFolder);

/**
 * @route PATCH /api/gallery-folders/:folderId/toggle-status
 * @desc Toggle gallery folder active status
 * @access Private
 */
router.patch("/:folderId/toggle-status", authenticateToken, galleryFolderController.toggleGalleryFolderStatus);

/**
 * @route DELETE /api/gallery-folders/:folderId
 * @desc Delete gallery folder by ID (soft delete)
 * @access Private
 */
router.delete("/:folderId", authenticateToken, galleryFolderController.deleteGalleryFolder);

/**
 * @route DELETE /api/gallery-folders/:folderId/permanent
 * @desc Permanently delete gallery folder by ID
 * @access Private
 */
router.delete("/:folderId/permanent", authenticateToken, galleryFolderController.permanentlyDeleteGalleryFolder);

export default router;
