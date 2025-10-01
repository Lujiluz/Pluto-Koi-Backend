import { GeneralResponse } from "#interfaces/global.interface.js";
import { CustomErrorHandler } from "#middleware/errorHandler.js";
import { AuctionActivityModel } from "#models/auction.activity.model.js";
import { IAuction } from "#models/auction.model.js";
import { auctionRepository } from "#repository/auction.repository.js";
import { Types } from "mongoose";

class AuctionService {
  /**
   * Get all auctions with pagination and statistics
   * @param page - Page number
   * @param limit - Number of auctions per page
   * @returns A response object containing auctions, metadata, and statistics
   */
  async getAllAuctions(page: number = 1, limit: number = 10): Promise<GeneralResponse<{ auctions: IAuction[]; metadata: any; statistics: any }>> {
    try {
      const { auctions, metadata } = await auctionRepository.findAll(page, limit);

      const auctionStats = await auctionRepository.getStats();

      if (auctions.length > 0) {
        const auctionsWithHighestBids = await Promise.all(
          auctions.map(async (auction) => {
            const highestBid = await AuctionActivityModel.getHighestBidForAuction(new Types.ObjectId(auction._id as string));
            return {
              ...auction.toObject(),
              currentHighestBid: highestBid ? highestBid.bidAmount : null,
              currentWinner: highestBid
                ? {
                    userId: highestBid.userId,
                    bidAmount: highestBid.bidAmount,
                  }
                : null,
            };
          })
        );

        return {
          status: "success",
          message: "Auctions retrieved successfully",
          data: { statistics: auctionStats, auctions: auctionsWithHighestBids, metadata },
        };
      }

      return {
        status: "success",
        message: "Auctions retrieved successfully",
        data: { statistics: auctionStats, auctions, metadata },
      };
    } catch (error) {
      console.error("Error retrieving auctions:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve auctions");
    }
  }

  /**
   * Create a new auction
   * @param auctionData - Auction data to create
   * @returns A response object containing the created auction
   */
  async createAuction(auctionData: IAuction): Promise<GeneralResponse<IAuction>> {
    try {
      const createdAuction = await auctionRepository.create(auctionData);
      return {
        status: "success",
        message: "Auction created successfully",
        data: createdAuction,
      };
    } catch (error) {
      console.error("Error creating auction:", error);
      throw new CustomErrorHandler(500, "Failed to create auction");
    }
  }

  /**
   * Get an auction by ID
   * @param auctionId - Auction ID
   * @returns The auction or null if not found
   */
  async getAuctionById(auctionId: string): Promise<GeneralResponse<IAuction | null>> {
    try {
      const auction = await auctionRepository.findById(auctionId);

      if (!auction) {
        throw new CustomErrorHandler(404, "Auction not found");
      }

      return {
        status: "success",
        message: "Auction retrieved successfully",
        data: auction,
      };
    } catch (error) {
      console.error("Error retrieving auction:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve auction");
    }
  }

  /**
   * Delete an auction by ID
   * @param auctionId - Auction ID
   * @returns A response object indicating the result of the deletion
   */
  async deleteAuctionById(auctionId: string): Promise<GeneralResponse<null>> {
    try {
      const auction = await auctionRepository.findById(auctionId);

      if (!auction) {
        throw new CustomErrorHandler(404, "Auction not found");
      }

      await auctionRepository.delete(auctionId);

      return {
        status: "success",
        message: "Auction deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error deleting auction:", error);
      throw new CustomErrorHandler(500, "Failed to delete auction");
    }
  }
}

export const auctionService = new AuctionService();
