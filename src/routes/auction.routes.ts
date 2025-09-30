import { auctionController } from "#controllers/auction.controller.js";
import { authenticateToken } from "#middleware/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.use(authenticateToken);

/**
 * @route   POST /api/auction
 * @desc    Create a new auction
 * @access  Private
 */
router.get("/", auctionController.getAllAuctions.bind(auctionController));

/**
 * @route   POST /api/auction
 * @desc    Create a new auction
 * @access  Private
 */
router.post("/", auctionController.createAuction.bind(auctionController));

/**
 * @route   GET /api/auction/:id
 * @desc    Get auction by ID
 * @access  Private
 */
router.get("/:id", auctionController.getAuctionById.bind(auctionController));

/**
 * @route   DELETE /api/auction/:id
 * @desc    Delete auction by ID
 * @access  Private
 */
router.delete("/:id", auctionController.deleteAuctionById.bind(auctionController));

export default router;
