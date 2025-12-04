import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../interfaces/auth.interface.js";
import { auctionService, CreateAuctionData } from "../services/auction.service.js";
import { UploadedFile } from "../utils/fileUpload.js";

class AuctionController {
  async getAllAuctions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search } = req.query as { page?: string; limit?: string; search?: string };
      const pageNumber = page ? parseInt(page, 10) : 1;
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      const response = await auctionService.getAllAuctions(pageNumber, limitNumber, search || "");
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving auctions:", error);
      next(error);
    }
  }

  /**
   * Create a new auction with media upload support
   */
  async createAuction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract form data
      const { itemName, note, startPrice, priceMultiplication, startDate, endDate, highestBid, endTime, extraTime = 5 } = req.body;

      // Validate required fields
      if (!itemName || !startPrice || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: itemName, startPrice, startDate, endDate",
        });
        return;
      }

      // Handle uploaded files
      let mediaFiles: UploadedFile[] = [];

      if (req.files) {
        if (Array.isArray(req.files)) {
          mediaFiles = req.files.map((file) => ({
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            buffer: file.buffer,
          }));
        } else if (typeof req.files === "object") {
          const mediaField = (req.files as any)["media"];
          if (mediaField && Array.isArray(mediaField)) {
            mediaFiles = mediaField.map((file) => ({
              originalname: file.originalname,
              filename: file.filename,
              path: file.path,
              size: file.size,
              mimetype: file.mimetype,
              buffer: file.buffer,
            }));
          }
        }
      }

      // Prepare auction data
      const auctionData: CreateAuctionData = {
        itemName,
        note,
        startPrice: parseFloat(startPrice),
        priceMultiplication: priceMultiplication ? parseFloat(priceMultiplication) : undefined,
        startDate,
        endDate,
        endTime,
        extraTime,
        highestBid: highestBid ? parseFloat(highestBid) : undefined,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
      };

      // Create auction
      const response = await auctionService.createAuction(auctionData);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating auction:", error);
      next(error);
    }
  }

  async getAuctionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const response = await auctionService.getAuctionById(id);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving auction:", error);
      next(error);
    }
  }

  async deleteAuctionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await auctionService.deleteAuctionById(id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting auction:", error);
      next(error);
    }
  }

  async updateAuction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      // Extract form data
      console.log("req.body:", req.body);
      const { itemName, note, startPrice, priceMultiplication, startDate, endDate, endTime, highestBid } = req.body;

      // Handle uploaded files
      let mediaFiles: UploadedFile[] = [];

      if (req.files) {
        if (Array.isArray(req.files)) {
          mediaFiles = req.files.map((file) => ({
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            buffer: file.buffer,
          }));
        } else if (typeof req.files === "object") {
          const mediaField = (req.files as any)["media"];
          if (mediaField && Array.isArray(mediaField)) {
            mediaFiles = mediaField.map((file) => ({
              originalname: file.originalname,
              filename: file.filename,
              path: file.path,
              size: file.size,
              mimetype: file.mimetype,
              buffer: file.buffer,
            }));
          }
        }
      }

      // Prepare auction data
      const auctionData: Partial<CreateAuctionData> = {
        itemName,
        note,
        startPrice: parseFloat(startPrice),
        priceMultiplication: priceMultiplication ? parseFloat(priceMultiplication) : undefined,
        startDate,
        endDate,
        endTime,
        highestBid: highestBid ? parseFloat(highestBid) : undefined,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
      };

      console.log("auctionData in controller:", auctionData);

      const response = await auctionService.updateAuction(id, auctionData);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating auction:", error);
      next(error);
    }
  }
}

export const auctionController = new AuctionController();
