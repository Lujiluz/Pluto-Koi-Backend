import { GeneralResponse } from "../interfaces/global.interface.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { AuctionActivityModel } from "../models/auction.activity.model.js";
import { IAuction } from "../models/auction.model.js";
import { auctionRepository } from "../repository/auction.repository.js";
import { processUploadedFiles, UploadedFile, validateFiles } from "../utils/fileUpload.js";
import { Types } from "mongoose";
import { eventService } from "./event.service.js";

export interface CreateAuctionData {
  itemName: string;
  note?: string;
  startPrice: number;
  priceMultiplication?: number;
  startDate: string | Date;
  endDate: string | Date;
  endTime: string | Date;
  extraTime?: number;
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
  async getAllAuctions(page: number = 1, limit: number = 10, search: string = ""): Promise<GeneralResponse<{ auctions: IAuction[]; metadata: any; statistics: any; eventDetail?: { totalBidAmount: number } }>> {
    try {
      const { auctions, metadata } = await auctionRepository.findAll(page, limit, search);

      const auctionStats = await auctionRepository.getStats();

      // Get event details if event is active
      const eventDetail = await eventService.getEventDetailsForAuction();

      if (auctions.length > 0) {
        const auctionsWithHighestBids = await Promise.all(
          auctions.map(async (auction) => {
            const highestBid = await AuctionActivityModel.getHighestBidForAuction(new Types.ObjectId(auction._id as string));

            if (highestBid) {
              await auctionRepository.update(auction._id as string, { highestBid: highestBid.bidAmount });
            }
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

        const responseData: any = {
          statistics: auctionStats,
          auctions: auctionsWithHighestBids,
          metadata,
        };

        // Add eventDetail only if event is active
        if (eventDetail) {
          responseData.eventDetail = eventDetail;
        }

        console.log("RESPONSE DATA: ", responseData);

        return {
          status: "success",
          message: "Auctions retrieved successfully",
          data: responseData,
        };
      }

      const responseData: any = {
        statistics: auctionStats,
        auctions,
        metadata,
      };

      // Add eventDetail only if event is active
      if (eventDetail) {
        responseData.eventDetail = eventDetail;
      }

      return {
        status: "success",
        message: "Auctions retrieved successfully",
        data: responseData,
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
      if (!auctionFields.itemName || !auctionFields.startPrice || !auctionFields.startDate || !auctionFields.endDate || !auctionFields.endTime) {
        throw new CustomErrorHandler(400, "Missing required fields: itemName, startPrice, startDate, endDate, endTime");
      }

      // Validate dates
      const startDate = new Date(auctionFields.startDate);
      const endDate = new Date(auctionFields.endDate);

      console.log("startDate: ", startDate);
      console.log("endDate before setTime: ", endDate);

      const endTimeString = typeof auctionFields.endTime === "string" ? auctionFields.endTime : auctionFields.endTime.toTimeString().split(" ")[0];
      const endTime = new Date(auctionFields.endDate);
      endTime.setHours(Number(endTimeString.split(":")[0]), Number(endTimeString.split(":")[1]));

      // set time with given endTime like so: HH:mm
      // const endTime = new Date(auctionFields.endTime);
      // endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
      // console.log('endTime: ', endTime);
      // console.log("endTime test: ", new Date(endDate).setTime());

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

      console.log("endTime to locale string: ", endTime.toLocaleTimeString("id-ID", { hour12: false }));

      // Prepare auction data for database
      const auctionToCreate = {
        itemName: auctionFields.itemName,
        note: auctionFields.note || "",
        startPrice: Number(auctionFields.startPrice),
        priceMultiplication: auctionFields.priceMultiplication ? Number(auctionFields.priceMultiplication) : 1,
        startDate,
        endDate,
        endTime,
        extraTime: auctionFields.extraTime ? Number(auctionFields.extraTime) : 5,
        highestBid: auctionFields.highestBid ? Number(auctionFields.highestBid) : 0,
        media: processedMedia.map((file) => ({ fileUrl: file.fileUrl })),
      };

      console.log("auctionToCreate:", auctionToCreate);

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

      const highestBid = await AuctionActivityModel.getHighestBidForAuction(new Types.ObjectId(auction?._id as string));
      console.log("HIGHEST BID: ", highestBid);

      if (highestBid) {
        await auctionRepository.update(auction?._id as string, { highestBid: highestBid.bidAmount });
      }

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

  /**
   * Update an auction by ID
   * @param auctionId - Auction ID
   * @param updatedData - Data to update
   * @returns The updated auction
   */
  async updateAuction(auctionId: string, updatedData: Partial<CreateAuctionData>): Promise<GeneralResponse<any>> {
    try {
      const auction = await auctionRepository.findById(auctionId);

      if (!auction) {
        throw new CustomErrorHandler(404, "Auction not found");
      }

      // Update fields
      if (updatedData.itemName !== undefined) auction.itemName = updatedData.itemName;
      if (updatedData.note !== undefined) auction.note = updatedData.note;
      if (updatedData.startPrice !== undefined) auction.startPrice = updatedData.startPrice;
      if (updatedData.priceMultiplication !== undefined) auction.priceMultiplication = updatedData.priceMultiplication;
      if (updatedData.startDate !== undefined) auction.startDate = new Date(updatedData.startDate);
      if (updatedData.endDate !== undefined) {
        const endTimeString = typeof updatedData.endTime === "string" ? updatedData.endTime : updatedData.endTime?.toTimeString().split(" ")[0];
        const endTime = new Date(updatedData.endDate);
        endTime.setHours(Number(endTimeString?.split(":")[0] || 0), Number(endTimeString?.split(":")[1] || 0));

        auction.endTime = endTime;
      }
      if (updatedData.endTime !== undefined) auction.endTime = new Date(updatedData.endTime);
      if (updatedData.highestBid !== undefined) auction.highestBid = updatedData.highestBid;

      // media update handling
      if (updatedData.media && updatedData.media.length > 0) {
        const validation = validateFiles(updatedData.media, 10);
        if (!validation.isValid) {
          throw new CustomErrorHandler(400, `File validation failed: ${validation.errors.join(", ")}`);
        }

        try {
          const processedMedia = await processUploadedFiles(updatedData.media, "auctions");
          auction.media = processedMedia.map((file) => ({ fileUrl: file.fileUrl }));
        } catch (error) {
          console.error("Error processing media files:", error);
          throw new CustomErrorHandler(500, "Failed to process media files");
        }
      }

      const savedAuction = await auctionRepository.update(auctionId, auction);

      return {
        status: "success",
        message: "Auction updated successfully",
        data: savedAuction,
      };
    } catch (error) {
      console.error("Error updating auction:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to update auction");
    }
  }
}

export const auctionService = new AuctionService();
