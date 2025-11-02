import { Types } from "mongoose";
import { AuctionActivityModel, IAuctionActivity } from "../models/auction.activity.model.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { GeneralResponse } from "../interfaces/global.interface.js";
import { AuctionModel } from "../models/auction.model.js";
import { websocketService } from "./websocket.service.js";
import { LeaderboardUpdatePayload, TimeExtensionPayload, NewBidPayload, LeaderboardParticipant } from "../interfaces/websocket.interface.js";
import { logger } from "../utils/logger.js";
import { userRepository } from "../repository/user.repository.js";

export interface BidData {
  auctionId: string;
  userId: string;
  bidAmount: number;
  bidType?: "initial" | "outbid" | "winning" | "auto";
}

export interface AuctionParticipation {
  auctionId: string;
  participants: {
    userId: string;
    name: string;
    email: string;
    role: string;
    totalBids: number;
    highestBid: number;
    latestBidTime: Date;
    isHighestBidder: boolean;
  }[];
  totalParticipants: number;
  totalBids: number;
  currentHighestBid: number;
  currentWinner?: {
    userId: string;
    name: string;
    bidAmount: number;
  };
}

export class AuctionActivityService {
  /**
   * Check if bid is within extra time window and handle auto-extension
   */
  private async handleAutoExtension(auction: any, bidTime: Date): Promise<{ extended: boolean; newEndTime?: Date; extensionMinutes?: number }> {
    try {
      const extraTimeMinutes = auction.extraTime || 0;

      // If no extra time configured, no extension needed
      if (extraTimeMinutes === 0) {
        return { extended: false };
      }

      const currentEndTime = new Date(auction.endTime);
      const extraTimeMs = extraTimeMinutes * 60 * 1000; // Convert minutes to milliseconds
      const extensionThreshold = new Date(currentEndTime.getTime() - extraTimeMs);

      // Check if the bid is placed within the extra time window
      if (bidTime >= extensionThreshold && bidTime <= currentEndTime) {
        // Extend the end time by extra time minutes
        const newEndTime = new Date(bidTime.getTime() + extraTimeMs);

        // Update auction end time in database
        await AuctionModel.findByIdAndUpdate(auction._id, {
          endTime: newEndTime,
        });

        logger.info("Auction time extended", {
          auctionId: auction._id.toString(),
          oldEndTime: currentEndTime,
          newEndTime,
          extensionMinutes: extraTimeMinutes,
          bidTime,
        });

        return {
          extended: true,
          newEndTime,
          extensionMinutes: extraTimeMinutes,
        };
      }

      return { extended: false };
    } catch (error) {
      logger.error("Error handling auto-extension", {
        error: error instanceof Error ? error.message : error,
        auctionId: auction._id,
      });
      // Don't throw error, just return no extension
      return { extended: false };
    }
  }

  /**
   * Build leaderboard update payload
   */
  private async buildLeaderboardPayload(auctionId: string): Promise<LeaderboardUpdatePayload> {
    const auctionObjectId = new Types.ObjectId(auctionId);

    // Get all bids for the auction
    const allBids = await AuctionActivityModel.getAuctionParticipants(auctionObjectId);

    // Get current highest bid
    const currentHighestBid = await AuctionActivityModel.getHighestBidForAuction(auctionObjectId);

    // Group bids by user and calculate statistics
    const userBidMap = new Map();

    allBids.forEach((bid) => {
      const userId = bid.userId._id.toString();
      if (!userBidMap.has(userId)) {
        userBidMap.set(userId, {
          userId,
          name: (bid.userId as any).name,
          email: (bid.userId as any).email,
          totalBids: 0,
          highestBid: 0,
          latestBidTime: bid.bidTime,
          isHighestBidder: false,
        });
      }

      const userStats = userBidMap.get(userId);
      userStats.totalBids++;
      userStats.highestBid = Math.max(userStats.highestBid, bid.bidAmount);
      userStats.latestBidTime = bid.bidTime > userStats.latestBidTime ? bid.bidTime : userStats.latestBidTime;
    });

    // Mark the current highest bidder
    if (currentHighestBid) {
      const winnerId = currentHighestBid.userId._id.toString();
      if (userBidMap.has(winnerId)) {
        userBidMap.get(winnerId).isHighestBidder = true;
      }
    }

    // Sort participants by highest bid (descending) and add rank
    const participants: LeaderboardParticipant[] = Array.from(userBidMap.values())
      .sort((a, b) => b.highestBid - a.highestBid)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    return {
      auctionId,
      participants,
      totalParticipants: participants.length,
      totalBids: allBids.length,
      currentHighestBid: currentHighestBid?.bidAmount || 0,
      currentWinner: currentHighestBid
        ? {
            userId: currentHighestBid.userId._id.toString(),
            name: (currentHighestBid.userId as any).name,
            bidAmount: currentHighestBid.bidAmount,
          }
        : null,
      timestamp: new Date(),
    };
  }

  /**
   * Place a new bid for an auction
   */
  async placeBid(bidData: BidData): Promise<GeneralResponse<IAuctionActivity>> {
    try {
      const { auctionId, userId, bidAmount, bidType = "initial" } = bidData;
      const bidTime = new Date();

      // validate user status
      const userData = await userRepository.findById(userId);

      if (!userData) {
        throw new CustomErrorHandler(404, "User not found");
      }

      if (userData.status === "banned") {
        throw new CustomErrorHandler(403, "Your account has been blocked.");
      }

      // Validate auction exists and is active
      const auction = await AuctionModel.findById(auctionId);
      if (!auction) throw new CustomErrorHandler(404, "Auction not found");
      if (auction.endTime < bidTime) throw new CustomErrorHandler(400, "Auction has ended");

      // Get current highest bid
      const currentHighestBid = await AuctionActivityModel.getHighestBidForAuction(new Types.ObjectId(auctionId));

      // Validate bid amount
      if (currentHighestBid && bidAmount <= currentHighestBid.bidAmount) {
        throw new CustomErrorHandler(400, `Bid must be higher than current highest bid of ${currentHighestBid.bidAmount}`);
      }

      // Mark previous highest bid as outbid
      if (currentHighestBid) {
        await AuctionActivityModel.findByIdAndUpdate(currentHighestBid._id, { isActive: false, bidType: "outbid" });
      }

      // Create new bid
      const newBid = new AuctionActivityModel({
        auctionId: new Types.ObjectId(auctionId),
        userId: new Types.ObjectId(userId),
        bidAmount,
        bidType: currentHighestBid ? "winning" : bidType,
        isActive: true,
        bidTime,
      });

      const savedBid = await newBid.save();
      await savedBid.populate("userId", "name email role");

      // Handle auto-extension logic
      const extensionResult = await this.handleAutoExtension(auction, bidTime);

      // Emit WebSocket events
      if (websocketService.isInitialized()) {
        // 1. Emit new bid notification
        const newBidPayload: NewBidPayload = {
          auctionId,
          userId,
          userName: (savedBid.userId as any).name,
          bidAmount,
          bidType: savedBid.bidType,
          bidTime,
          isNewLeader: true,
        };
        websocketService.emitNewBid(auctionId, newBidPayload);

        // 2. Emit leaderboard update
        const leaderboardPayload = await this.buildLeaderboardPayload(auctionId);
        websocketService.emitLeaderboardUpdate(auctionId, leaderboardPayload);

        // 3. Emit time extension if applicable
        if (extensionResult.extended && extensionResult.newEndTime && extensionResult.extensionMinutes) {
          const timeExtensionPayload: TimeExtensionPayload = {
            auctionId,
            newEndTime: extensionResult.newEndTime,
            extensionMinutes: extensionResult.extensionMinutes,
            reason: `Bid placed within last ${extensionResult.extensionMinutes} minutes`,
            timestamp: new Date(),
          };
          websocketService.emitTimeExtension(auctionId, timeExtensionPayload);
        }
      }

      return {
        status: "success",
        message: "Bid placed successfully",
        data: savedBid,
      };
    } catch (error) {
      console.error("Error placing bid:", error);
      throw error instanceof CustomErrorHandler ? error : new CustomErrorHandler(500, "Failed to place bid");
    }
  }

  /**
   * Get all participants for an auction with detailed information
   */
  async getAuctionParticipation(auctionId: string): Promise<GeneralResponse<AuctionParticipation>> {
    try {
      const auctionObjectId = new Types.ObjectId(auctionId);

      // Get all bids for the auction
      const allBids = await AuctionActivityModel.getAuctionParticipants(auctionObjectId);

      // Get current highest bid
      const currentHighestBid = await AuctionActivityModel.getHighestBidForAuction(auctionObjectId);

      // Group bids by user and calculate statistics
      const userBidMap = new Map();

      allBids.forEach((bid) => {
        const userId = bid.userId._id.toString();
        if (!userBidMap.has(userId)) {
          userBidMap.set(userId, {
            userId,
            name: (bid.userId as any).name,
            email: (bid.userId as any).email,
            role: (bid.userId as any).role,
            totalBids: 0,
            highestBid: 0,
            latestBidTime: bid.bidTime,
            isHighestBidder: false,
            bids: [],
          });
        }

        const userStats = userBidMap.get(userId);
        userStats.totalBids++;
        userStats.highestBid = Math.max(userStats.highestBid, bid.bidAmount);
        userStats.latestBidTime = bid.bidTime > userStats.latestBidTime ? bid.bidTime : userStats.latestBidTime;
        userStats.bids.push(bid);
      });

      // Mark the current highest bidder
      if (currentHighestBid) {
        const winnerId = currentHighestBid.userId._id.toString();
        if (userBidMap.has(winnerId)) {
          userBidMap.get(winnerId).isHighestBidder = true;
        }
      }

      const participants = Array.from(userBidMap.values()).map((user) => ({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        totalBids: user.totalBids,
        highestBid: user.highestBid,
        latestBidTime: user.latestBidTime,
        isHighestBidder: user.isHighestBidder,
      }));

      const participationData: AuctionParticipation = {
        auctionId,
        participants,
        totalParticipants: participants.length,
        totalBids: allBids.length,
        currentHighestBid: currentHighestBid?.bidAmount || 0,
        currentWinner: currentHighestBid
          ? {
              userId: currentHighestBid.userId._id.toString(),
              name: (currentHighestBid.userId as any).name,
              bidAmount: currentHighestBid.bidAmount,
            }
          : undefined,
      };

      return {
        status: "success",
        message: "Auction participation retrieved successfully",
        data: participationData,
      };
    } catch (error) {
      console.error("Error getting auction participation:", error);
      throw new CustomErrorHandler(500, "Failed to get auction participation");
    }
  }

  /**
   * Get user's bid history for a specific auction
   */
  async getUserAuctionHistory(auctionId: string, userId: string): Promise<GeneralResponse<IAuctionActivity[]>> {
    try {
      const bids = await AuctionActivityModel.getUserBidsForAuction(new Types.ObjectId(auctionId), new Types.ObjectId(userId));

      return {
        status: "success",
        message: "User auction history retrieved successfully",
        data: bids,
      };
    } catch (error) {
      console.error("Error getting user auction history:", error);
      throw new CustomErrorHandler(500, "Failed to get user auction history");
    }
  }

  /**
   * Get all auction activities with pagination
   */
  async getAllAuctionActivities(
    page: number = 1,
    limit: number = 20
  ): Promise<
    GeneralResponse<{
      activities: IAuctionActivity[];
      metadata: any;
    }>
  > {
    try {
      const skip = (page - 1) * limit;

      const [activities, total] = await Promise.all([
        AuctionActivityModel.find().populate("userId", "name email role").populate("auctionId", "itemName startPrice endPrice").sort({ createdAt: -1 }).skip(skip).limit(limit),
        AuctionActivityModel.countDocuments(),
      ]);

      const metadata = {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      };

      return {
        status: "success",
        message: "Auction activities retrieved successfully",
        data: { activities, metadata },
      };
    } catch (error) {
      console.error("Error getting auction activities:", error);
      throw new CustomErrorHandler(500, "Failed to get auction activities");
    }
  }

  /**
   * Get auction statistics
   */
  async getAuctionStats(auctionId: string): Promise<
    GeneralResponse<{
      totalBids: number;
      uniqueParticipants: number;
      averageBidAmount: number;
      currentHighestBid: number;
      bidRange: { min: number; max: number };
    }>
  > {
    try {
      const auctionObjectId = new Types.ObjectId(auctionId);

      const [totalBids, uniqueParticipants, bidStats, highestBid] = await Promise.all([
        AuctionActivityModel.countDocuments({ auctionId: auctionObjectId }),
        AuctionActivityModel.getUniqueParticipantsCount(auctionObjectId),
        AuctionActivityModel.aggregate([
          { $match: { auctionId: auctionObjectId } },
          {
            $group: {
              _id: null,
              avgBid: { $avg: "$bidAmount" },
              minBid: { $min: "$bidAmount" },
              maxBid: { $max: "$bidAmount" },
            },
          },
        ]),
        AuctionActivityModel.getHighestBidForAuction(auctionObjectId),
      ]);

      const stats = bidStats[0] || { avgBid: 0, minBid: 0, maxBid: 0 };

      return {
        status: "success",
        message: "Auction statistics retrieved successfully",
        data: {
          totalBids,
          uniqueParticipants,
          averageBidAmount: Math.round(stats.avgBid || 0),
          currentHighestBid: highestBid?.bidAmount || 0,
          bidRange: {
            min: stats.minBid || 0,
            max: stats.maxBid || 0,
          },
        },
      };
    } catch (error) {
      console.error("Error getting auction stats:", error);
      throw new CustomErrorHandler(500, "Failed to get auction statistics");
    }
  }
}

export const auctionActivityService = new AuctionActivityService();
