import { Types } from "mongoose";
import { AuctionActivityModel, IAuctionActivity } from "#models/auction.activity.model.js";
import { CustomErrorHandler } from "#middleware/errorHandler.js";
import { GeneralResponse } from "#interfaces/global.interface.js";
import { AuctionModel } from "#models/auction.model.js";

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
   * Place a new bid for an auction
   */
  async placeBid(bidData: BidData): Promise<GeneralResponse<IAuctionActivity>> {
    try {
      const { auctionId, userId, bidAmount, bidType = "initial" } = bidData;

      // Validate auction exists and is active
      const auction = await AuctionModel.findById(auctionId);
      if (!auction) throw new CustomErrorHandler(404, "Auction not found");
      if (auction.endDate < new Date()) throw new CustomErrorHandler(400, "Auction has ended");

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
        bidTime: new Date(),
      });

      const savedBid = await newBid.save();
      await savedBid.populate("userId", "name email role");

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
