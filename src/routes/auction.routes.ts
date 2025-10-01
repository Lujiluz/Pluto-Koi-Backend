import { auctionController } from "#controllers/auction.controller.js";
import { authenticateToken } from "#middleware/auth.middleware.js";
import { uploadAuctionMedia, handleMulterError } from "#middleware/uploadMiddleware.js";
import { validateCreateAuction, validateAuctionId, validateAuctionPagination } from "#validations/auction.validation.js";
import { Router } from "express";

const router = Router();

router.use(authenticateToken);

/**
 * @route   GET /api/auction
 * @desc    Get all auctions with pagination
 * @access  Private
 */
router.get("/", validateAuctionPagination, auctionController.getAllAuctions.bind(auctionController));

/**
 * @route   POST /api/auction
 * @desc    Create a new auction with media upload
 * @access  Private
 */
router.post(
  "/",
  uploadAuctionMedia, // Handle multipart/form-data and file uploads
  handleMulterError, // Handle multer-specific errors
  validateCreateAuction, // Validate form data
  auctionController.createAuction.bind(auctionController)
);

/**
 * @route   GET /api/auction/:id
 * @desc    Get auction by ID
 * @access  Private
 */
router.get("/:id", validateAuctionId, auctionController.getAuctionById.bind(auctionController));

/**
 * @route   DELETE /api/auction/:id
 * @desc    Delete auction by ID
 * @access  Private
 */
router.delete("/:id", validateAuctionId, auctionController.deleteAuctionById.bind(auctionController));

export default router;
