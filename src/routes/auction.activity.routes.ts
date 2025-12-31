import { Router } from "express";
import { auctionActivityController } from "../controllers/auction.activity.controller.js";
import { authenticateToken, authenticateAdminToken } from "../middleware/auth.middleware.js";
import { validatePlaceBid, validateAuctionIdParam, validatePaginationQuery } from "../validations/auction.activity.validation.js";

const router = Router();

// User routes - require user authentication (user cookie)
/**
 * @route   POST /api/auction-activity/bid
 * @desc    Place a bid on an auction
 * @access  Private (User)
 */
router.post("/bid", authenticateToken, validatePlaceBid, auctionActivityController.placeBid.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/auction/:auctionId/participants
 * @desc    Get all participants for an auction
 * @access  Private (User)
 */
router.get("/auction/:auctionId/participants", authenticateToken, validateAuctionIdParam, auctionActivityController.getAuctionParticipation.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/auction/:auctionId/highest-bid
 * @desc    Get current highest bid for an auction
 * @access  Private (User)
 */
router.get("/auction/:auctionId/highest-bid", authenticateToken, validateAuctionIdParam, auctionActivityController.getCurrentHighestBid.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/auction/:auctionId/stats
 * @desc    Get auction statistics
 * @access  Private (User)
 */
router.get("/auction/:auctionId/stats", authenticateToken, validateAuctionIdParam, auctionActivityController.getAuctionStats.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/auction/:auctionId/user/:userId?/history
 * @desc    Get user's bid history for a specific auction
 * @access  Private (own history) / Admin (other user's history)
 */
router.get("/auction/:auctionId/user/:userId/history", authenticateToken, validateAuctionIdParam, auctionActivityController.getUserAuctionHistory.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/my-auctions
 * @desc    Get all auctions where the user has placed bids
 * @access  Private (User)
 */
router.get("/my-auctions", authenticateToken, validatePaginationQuery, auctionActivityController.getUserBidAuctions.bind(auctionActivityController));

/**
 * @route   GET /api/auction-activity/all
 * @desc    Get all auction activities (admin only)
 * @access  Private (Admin only)
 */
router.get("/all", authenticateAdminToken, validatePaginationQuery, auctionActivityController.getAllAuctionActivities.bind(auctionActivityController));

export default router;
