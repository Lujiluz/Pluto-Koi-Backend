import { Router } from "express";
import { auctionController } from "../../controllers/auction.controller.js";
import { uploadAuctionMedia, handleMulterError } from "../../middleware/uploadMiddleware.js";
import { validateCreateAuction, validateAuctionId, validateAuctionPagination } from "../../validations/auction.validation.js";

const router = Router();

/**
 * Admin Auction Routes
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

/**
 * @route   GET /api/admin/auction
 * @desc    Get all auctions with pagination
 * @access  Private (Admin only)
 */
router.get("/", validateAuctionPagination, auctionController.getAllAuctions.bind(auctionController));

/**
 * @route   POST /api/admin/auction
 * @desc    Create a new auction with media upload
 * @access  Private (Admin only)
 */
router.post("/", uploadAuctionMedia, handleMulterError, validateCreateAuction, auctionController.createAuction.bind(auctionController));

/**
 * @route   GET /api/admin/auction/:id
 * @desc    Get auction by ID
 * @access  Private (Admin only)
 */
router.get("/:id", validateAuctionId, auctionController.getAuctionById.bind(auctionController));

/**
 * @route   PUT /api/admin/auction/:id
 * @desc    Update auction by ID
 * @access  Private (Admin only)
 */
router.put("/:id", uploadAuctionMedia, handleMulterError, validateAuctionId, auctionController.updateAuction.bind(auctionController));

/**
 * @route   DELETE /api/admin/auction/:id
 * @desc    Delete auction by ID
 * @access  Private (Admin only)
 */
router.delete("/:id", validateAuctionId, auctionController.deleteAuctionById.bind(auctionController));

export default router;
