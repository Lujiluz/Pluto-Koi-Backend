import { Router } from "express";
import { auctionActivityController } from "../controllers/auction.activity.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";
import { validatePlaceBid, validateAuctionIdParam, validatePaginationQuery } from "../validations/auction.activity.validation.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/auction-activity/bid
 * @desc    Place a bid on an auction
 * @access  Private
 */
router.post("/bid", validatePlaceBid, auctionActivityController.placeBid.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/auction/:auctionId/participants
 * @desc    Get all participants for an auction
 * @access  Private
 */
router.get("/auction/:auctionId/participants", validateAuctionIdParam, auctionActivityController.getAuctionParticipation.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/auction/:auctionId/highest-bid
 * @desc    Get current highest bid for an auction
 * @access  Private
 */
router.get("/auction/:auctionId/highest-bid", validateAuctionIdParam, auctionActivityController.getCurrentHighestBid.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/auction/:auctionId/stats
 * @desc    Get auction statistics
 * @access  Private
 */
router.get("/auction/:auctionId/stats", validateAuctionIdParam, auctionActivityController.getAuctionStats.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/auction/:auctionId/user/:userId?/history
 * @desc    Get user's bid history for a specific auction
 * @access  Private (own history) / Admin (other user's history)
 */
router.get("/auction/:auctionId/user/:userId/history", validateAuctionIdParam, auctionActivityController.getUserAuctionHistory.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/all
 * @desc    Get all auction activities (admin only)
 * @access  Private (Admin only)
 */
router.get("/all", validatePaginationQuery, requireAdmin, auctionActivityController.getAllAuctionActivities.bind(auctionActivityController));

export default router;
