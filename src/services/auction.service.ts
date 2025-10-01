import { GeneralResponse } from "#interfaces/global.interface.js";
import { CustomErrorHandler } from "#middleware/errorHandler.js";
import { AuctionActivityModel } from "#models/auction.activity.model.js";
import { IAuction } from "#models/auction.model.js";
import { auctionRepository } from "#repository/auction.repository.js";
import { processUploadedFiles, UploadedFile, validateFiles } from "#utils/fileUpload.js";
import { Types } from "mongoose";

export interface CreateAuctionData {
  itemName: string;
  startPrice: number;
  endPrice?: number;
  startDate: string | Date;
  endDate: string | Date;
  highestBid?: number;
  media?: UploadedFile[];
}

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
   * Create a new auction with media upload support
   * @param auctionData - Auction data including optional media files
   * @returns A response object containing the created auction
   */
  async createAuction(auctionData: CreateAuctionData): Promise<GeneralResponse<IAuction>> {
    try {
      const { media, ...auctionFields } = auctionData;

      // Validate required fields
      if (!auctionFields.itemName || !auctionFields.startPrice || !auctionFields.startDate || !auctionFields.endDate) {
        throw new CustomErrorHandler(400, "Missing required fields: itemName, startPrice, startDate, endDate");
      }

      // Validate dates
      const startDate = new Date(auctionFields.startDate);
      const endDate = new Date(auctionFields.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new CustomErrorHandler(400, "Invalid date format");
      }

      if (endDate <= startDate) {
        throw new CustomErrorHandler(400, "End date must be after start date");
      }

      if (startDate <= new Date()) {
        throw new CustomErrorHandler(400, "Start date must be in the future");
      }

      // Validate and process media files if provided
      let processedMedia: any[] = [];
      if (media && media.length > 0) {
        // Validate files
        const validation = validateFiles(media, 10);
        if (!validation.isValid) {
          throw new CustomErrorHandler(400, `File validation failed: ${validation.errors.join(", ")}`);
        }

        try {
          // Process and save files
          processedMedia = await processUploadedFiles(media, "auctions");
        } catch (error) {
          console.error("Error processing media files:", error);
          throw new CustomErrorHandler(500, "Failed to process media files");
        }
      }

      // Prepare auction data for database
      const auctionToCreate = {
        itemName: auctionFields.itemName,
        startPrice: Number(auctionFields.startPrice),
        endPrice: auctionFields.endPrice ? Number(auctionFields.endPrice) : 0,
        startDate,
        endDate,
        highestBid: auctionFields.highestBid ? Number(auctionFields.highestBid) : 0,
        media: processedMedia.map((file) => ({ fileUrl: file.fileUrl })),
      };

      // Create auction in database
      const createdAuction = await auctionRepository.create(auctionToCreate as IAuction);

      return {
        status: "success",
        message: "Auction created successfully",
        data: createdAuction,
      };
    } catch (error) {
      console.error("Error creating auction:", error);

      // If it's already a CustomErrorHandler, re-throw it
      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new CustomErrorHandler(400, error.message);
      }

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
