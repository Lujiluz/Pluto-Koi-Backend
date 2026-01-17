import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../interfaces/auth.interface.js";
import { auctionActivityService, BidData } from "../services/auction.activity.service.js";

export class AuctionActivityController {
  /**
   * Place a bid on an auction
   */
  async placeBid(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { auctionId, bidAmount, bidType } = req.body;

      if (!auctionId || !bidAmount) {
        res.status(400).json({
          success: false,
          message: "Auction ID and bid amount are required",
        });
        return;
      }

      if (bidAmount <= 0) {
        res.status(400).json({
          success: false,
          message: "Bid amount must be greater than 0",
        });
        return;
      }

      const bidData: BidData = {
        auctionId,
        userId: req.user.id,
        bidAmount: Number(bidAmount),
        bidType,
      };

      const result = await auctionActivityService.placeBid(bidData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error placing bid:", error);
      next(error);
    }
  }

  /**
   * Get all participants for an auction
   */
  async getAuctionParticipation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auctionId } = req.params;

      if (!auctionId) {
        res.status(400).json({
          success: false,
          message: "Auction ID is required",
        });
        return;
      }

      const result = await auctionActivityService.getAuctionParticipation(auctionId as string);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error getting auction participation:", error);
      next(error);
    }
  }

  /**
   * Get user's bid history for a specific auction
   */
  async getUserAuctionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { auctionId } = req.params;
      const userId = req.params.userId || req.user.id; // Allow getting other user's history for admins

      if (!auctionId) {
        res.status(400).json({
          success: false,
          message: "Auction ID is required",
        });
        return;
      }

      // If requesting another user's history, check if current user is admin
      if (userId !== req.user.id && req.user.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
        return;
      }

      const result = await auctionActivityService.getUserAuctionHistory(auctionId as string, userId as string);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error getting user auction history:", error);
      next(error);
    }
  }

  /**
   * Get all auction activities (admin only)
   */
  async getAllAuctionActivities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "Admin access required",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await auctionActivityService.getAllAuctionActivities(page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error getting auction activities:", error);
      next(error);
    }
  }

  /**
   * Get auction statistics
   */
  async getAuctionStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auctionId } = req.params;

      if (!auctionId) {
        res.status(400).json({
          success: false,
          message: "Auction ID is required",
        });
        return;
      }

      const result = await auctionActivityService.getAuctionStats(auctionId as string);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error getting auction stats:", error);
      next(error);
    }
  }

  /**
   * Get current highest bid for an auction
   */
  async getCurrentHighestBid(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auctionId } = req.params;

      if (!auctionId) {
        res.status(400).json({
          success: false,
          message: "Auction ID is required",
        });
        return;
      }

      // This is a simple wrapper around the participation endpoint for just the highest bid
      const participation = await auctionActivityService.getAuctionParticipation(auctionId as string);

      res.status(200).json({
        status: "success",
        message: "Current highest bid retrieved successfully",
        data: {
          auctionId,
          currentHighestBid: participation.data?.currentHighestBid || 0,
          currentWinner: participation.data?.currentWinner || null,
          totalParticipants: participation.data?.totalParticipants || 0,
        },
      });
    } catch (error) {
      console.error("Error getting current highest bid:", error);
      next(error);
    }
  }

  /**
   * Get all auctions where the user has placed bids
   */
  async getUserBidAuctions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await auctionActivityService.getUserBidAuctions(req.user.id, page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error getting user bid auctions:", error);
      next(error);
    }
  }
}

export const auctionActivityController = new AuctionActivityController();
