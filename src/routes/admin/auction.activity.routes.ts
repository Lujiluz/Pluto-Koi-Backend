import { Router } from "express";
import { auctionActivityController } from "../../controllers/auction.activity.controller.js";
import { validatePlaceBid, validateAuctionIdParam, validatePaginationQuery } from "../../validations/auction.activity.validation.js";

const router = Router();

/**
 * Admin Auction Activity Routes
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

/**
 * @route   GET /api/admin/auction-activity/all
 * @desc    Get all auction activities
 * @access  Private (Admin only)
 */
router.get("/all", validatePaginationQuery, auctionActivityController.getAllAuctionActivities.bind(auctionActivityController));

/**
 * @route   GET /api/admin/auction-activity/auction/:auctionId/participants
 * @desc    Get all participants for an auction
 * @access  Private (Admin only)
 */
router.get("/auction/:auctionId/participants", validateAuctionIdParam, auctionActivityController.getAuctionParticipation.bind(auctionActivityController));

/**
 * @route   GET /api/admin/auction-activity/auction/:auctionId/highest-bid
 * @desc    Get current highest bid for an auction
 * @access  Private (Admin only)
 */
router.get("/auction/:auctionId/highest-bid", validateAuctionIdParam, auctionActivityController.getCurrentHighestBid.bind(auctionActivityController));

/**
 * @route   GET /api/admin/auction-activity/auction/:auctionId/stats
 * @desc    Get auction statistics
 * @access  Private (Admin only)
 */
router.get("/auction/:auctionId/stats", validateAuctionIdParam, auctionActivityController.getAuctionStats.bind(auctionActivityController));

/**
 * @route   GET /api/admin/auction-activity/auction/:auctionId/user/:userId/history
 * @desc    Get user's bid history for a specific auction
 * @access  Private (Admin only)
 */
router.get("/auction/:auctionId/user/:userId/history", validateAuctionIdParam, auctionActivityController.getUserAuctionHistory.bind(auctionActivityController));

export default router;
