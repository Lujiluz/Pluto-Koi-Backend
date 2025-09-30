import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "#interfaces/auth.interface.js";
import { auctionService } from "#services/auction.service.js";

class AuctionController {
  async getAllAuctions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await auctionService.getAllAuctions();
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving auctions:", error);
      next(error);
    }
  }

  async createAuction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await auctionService.createAuction(req.body);
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
}

export const auctionController = new AuctionController();
