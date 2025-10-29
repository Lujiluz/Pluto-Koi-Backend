import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { AuctionModel, IAuction } from "../models/auction.model.js";
import { paginationMetadata } from "../utils/pagination.js";

class AuctionRepository {
  /**
   * Create a new auction
   * @param auctionData - Auction data to create
   * @returns The created auction
   */
  async create(auctionData: IAuction) {
    const auction = new AuctionModel(auctionData);
    return await auction.save();
  }

  /**
   * Find an auction by ID
   * @param id - Auction ID
   * @returns The found auction or null if not found
   */
  async findById(id: string): Promise<IAuction | null> {
    try {
      return await AuctionModel.findById(id);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find auction by ID");
    }
  }

  /**
   * Find all auctions with pagination
   * @param page - Page number
   * @param limit - Number of auctions per page
   * @returns A list of auctions and metadata
   */
  async findAll(page: number = 1, limit: number = 10, search: string = ""): Promise<{ auctions: IAuction[]; metadata: any }> {
    try {
      const skip = (page - 1) * limit;
      let query = {};

      if (search) {
        query = { $text: { $search: search } };
      }

      // console.log("updatedAuctions", updatedAuctions);
      const auctions = await AuctionModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec();
      const total = await AuctionModel.countDocuments(query).exec();
      const metadata = paginationMetadata(page, limit, total);
      return { auctions, metadata };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to retrieve auctions");
    }
  }

  /**
   * Get auction statistics
   * @returns Auction statistics
   */
  async getStats(): Promise<any> {
    try {
      const totalAuctions = await AuctionModel.countDocuments().exec();
      const activeAuctions = await AuctionModel.countDocuments({ endDate: { $gt: new Date() } }).exec();
      const completedAuctions = await AuctionModel.countDocuments({ endDate: { $lte: new Date() } }).exec();
      return {
        totalAuctions,
        activeAuctions,
        completedAuctions,
      };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to retrieve auction statistics");
    }
  }

  /**
   * Delete an auction by ID
   * @param id - Auction ID
   * @returns True if the auction was deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await AuctionModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to delete auction");
    }
  }

  /**
   * Update an auction by ID
   * @param id - Auction ID
   * @param updateData - Data to update
   * @returns The updated auction or null if not found
   */
  async update(id: string, updateData: Partial<IAuction>): Promise<IAuction | null> {
    try {
      return await AuctionModel.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to update auction");
    }
  }
}

export const auctionRepository = new AuctionRepository();
