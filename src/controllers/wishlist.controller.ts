import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../interfaces/auth.interface.js";
import { wishlistService, AddToWishlistData } from "../services/wishlist.service.js";
import { WishlistItemType } from "../models/wishlist.model.js";

export class WishlistController {
  /**
   * Get user's wishlist
   */
  async getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { itemType } = req.query;

      console.log("Item Type:", itemType);

      let response;
      if (itemType) {
        response = await wishlistService.getItemsByType(req.user.id, itemType as WishlistItemType);
      } else {
        response = await wishlistService.getWishlist(req.user.id);
      }

      res.status(200).json(response);
    } catch (error) {
      console.error("Error getting wishlist:", error);
      next(error);
    }
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { itemId, itemType } = req.body;

      if (!itemId || !itemType) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: itemId, itemType",
        });
        return;
      }

      const data: AddToWishlistData = {
        userId: req.user.id,
        itemId,
        itemType: itemType as WishlistItemType,
      };

      const response = await wishlistService.addToWishlist(data);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      next(error);
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { itemId, itemType } = req.body;

      if (!itemId || !itemType) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: itemId, itemType",
        });
        return;
      }

      const response = await wishlistService.removeFromWishlist(req.user.id, itemId, itemType as WishlistItemType);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      next(error);
    }
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const response = await wishlistService.clearWishlist(req.user.id);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      next(error);
    }
  }

  /**
   * Check if item exists in wishlist
   */
  async checkItemInWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { itemId, itemType } = req.query;

      if (!itemId || !itemType) {
        res.status(400).json({
          success: false,
          message: "Missing required query parameters: itemId, itemType",
        });
        return;
      }

      const response = await wishlistService.checkItemInWishlist(req.user.id, itemId as string, itemType as WishlistItemType);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error checking item in wishlist:", error);
      next(error);
    }
  }

  /**
   * Get wishlist statistics
   */
  async getWishlistStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const response = await wishlistService.getWishlistStats(req.user.id);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error getting wishlist stats:", error);
      next(error);
    }
  }

  /**
   * Get items by type (products or auctions)
   */
  async getItemsByType(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { itemType } = req.query;

      if (!itemType) {
        res.status(400).json({
          success: false,
          message: "Missing required query parameter: itemType",
        });
        return;
      }

      const response = await wishlistService.getItemsByType(req.user.id, itemType as WishlistItemType);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error getting items by type:", error);
      next(error);
    }
  }

  /**
   * Sync wishlist item data
   */
  async syncWishlistItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { itemId, itemType } = req.body;

      if (!itemId || !itemType) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: itemId, itemType",
        });
        return;
      }

      const response = await wishlistService.syncWishlistItem(req.user.id, itemId, itemType as WishlistItemType);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error syncing wishlist item:", error);
      next(error);
    }
  }
}

export const wishlistController = new WishlistController();
