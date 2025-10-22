import { GeneralResponse } from "../interfaces/global.interface.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { IWishlist, IWishlistItem, WishlistItemType } from "../models/wishlist.model.js";
import { wishlistRepository, AddWishlistItemData } from "../repository/wishlist.repository.js";
import { ProductModel } from "../models/product.model.js";
import { AuctionModel } from "../models/auction.model.js";

export interface AddToWishlistData {
  userId: string;
  itemId: string;
  itemType: WishlistItemType;
}

export class WishlistService {
  /**
   * Get user's wishlist
   */
  async getWishlist(userId: string): Promise<GeneralResponse<IWishlist>> {
    try {
      const wishlist = await wishlistRepository.findOrCreateByUserId(userId);

      return {
        status: "success",
        message: "Wishlist retrieved successfully",
        data: wishlist,
      };
    } catch (error) {
      console.error("Error retrieving wishlist:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to retrieve wishlist");
    }
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(data: AddToWishlistData): Promise<GeneralResponse<IWishlist>> {
    try {
      const { userId, itemId, itemType } = data;

      // Check if item already exists in wishlist
      const exists = await wishlistRepository.itemExists(userId, itemId, itemType);
      if (exists) {
        throw new CustomErrorHandler(409, "Item already exists in wishlist");
      }

      // Fetch item data based on type
      let itemData: { itemName: string; price: number; imageUrl?: string };

      if (itemType === WishlistItemType.PRODUCT) {
        const product = await ProductModel.findById(itemId);
        if (!product) {
          throw new CustomErrorHandler(404, "Product not found");
        }

        if (!product.isActive) {
          throw new CustomErrorHandler(400, "Cannot add inactive product to wishlist");
        }

        itemData = {
          itemName: product.productName,
          price: product.productPrice,
          imageUrl: product.media && product.media.length > 0 ? product.media[0].fileUrl : undefined,
        };
      } else if (itemType === WishlistItemType.AUCTION) {
        const auction = await AuctionModel.findById(itemId);
        if (!auction) {
          throw new CustomErrorHandler(404, "Auction not found");
        }

        // Check if auction is still active
        const now = new Date();
        if (now < auction.startDate) {
          throw new CustomErrorHandler(400, "Auction has not started yet");
        }
        if (now > auction.endDate) {
          throw new CustomErrorHandler(400, "Cannot add expired auction to wishlist");
        }

        itemData = {
          itemName: auction.itemName,
          price: auction.highestBid > 0 ? auction.highestBid : auction.startPrice,
          imageUrl: auction.media && auction.media.length > 0 ? auction.media[0].fileUrl : undefined,
        };
      } else {
        throw new CustomErrorHandler(400, "Invalid item type");
      }

      // Add item to wishlist
      const addData: AddWishlistItemData = {
        userId,
        itemId,
        itemType,
        itemData,
      };

      const wishlist = await wishlistRepository.addItem(addData);

      return {
        status: "success",
        message: "Item added to wishlist successfully",
        data: wishlist,
      };
    } catch (error) {
      console.error("Error adding to wishlist:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to add item to wishlist");
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(userId: string, itemId: string, itemType: WishlistItemType): Promise<GeneralResponse<IWishlist | null>> {
    try {
      const wishlist = await wishlistRepository.removeItem(userId, itemId, itemType);

      if (!wishlist) {
        throw new CustomErrorHandler(404, "Wishlist not found or item doesn't exist");
      }

      return {
        status: "success",
        message: "Item removed from wishlist successfully",
        data: wishlist,
      };
    } catch (error) {
      console.error("Error removing from wishlist:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to remove item from wishlist");
    }
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(userId: string): Promise<GeneralResponse<IWishlist | null>> {
    try {
      const wishlist = await wishlistRepository.clearWishlist(userId);

      if (!wishlist) {
        throw new CustomErrorHandler(404, "Wishlist not found");
      }

      return {
        status: "success",
        message: "Wishlist cleared successfully",
        data: wishlist,
      };
    } catch (error) {
      console.error("Error clearing wishlist:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to clear wishlist");
    }
  }

  /**
   * Check if item exists in wishlist
   */
  async checkItemInWishlist(userId: string, itemId: string, itemType: WishlistItemType): Promise<GeneralResponse<{ exists: boolean }>> {
    try {
      const exists = await wishlistRepository.itemExists(userId, itemId, itemType);

      return {
        status: "success",
        message: exists ? "Item is in wishlist" : "Item is not in wishlist",
        data: { exists },
      };
    } catch (error) {
      console.error("Error checking item in wishlist:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to check item in wishlist");
    }
  }

  /**
   * Get wishlist statistics
   */
  async getWishlistStats(userId: string): Promise<
    GeneralResponse<{
      totalItems: number;
      productCount: number;
      auctionCount: number;
    }>
  > {
    try {
      const wishlist = await wishlistRepository.findByUserId(userId);

      if (!wishlist) {
        return {
          status: "success",
          message: "Wishlist statistics retrieved successfully",
          data: {
            totalItems: 0,
            productCount: 0,
            auctionCount: 0,
          },
        };
      }

      const productCount = wishlist.items.filter((item) => item.itemType === WishlistItemType.PRODUCT).length;
      const auctionCount = wishlist.items.filter((item) => item.itemType === WishlistItemType.AUCTION).length;

      return {
        status: "success",
        message: "Wishlist statistics retrieved successfully",
        data: {
          totalItems: wishlist.items.length,
          productCount,
          auctionCount,
        },
      };
    } catch (error) {
      console.error("Error getting wishlist stats:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to get wishlist statistics");
    }
  }

  /**
   * Get items by type
   */
  async getItemsByType(userId: string, itemType: WishlistItemType): Promise<GeneralResponse<IWishlistItem[]>> {
    try {
      const items = await wishlistRepository.getItemsByType(userId, itemType);

      return {
        status: "success",
        message: `${itemType} items retrieved successfully`,
        data: items,
      };
    } catch (error) {
      console.error("Error getting items by type:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to get items by type");
    }
  }

  /**
   * Sync wishlist item data (update embedded data from source)
   */
  async syncWishlistItem(userId: string, itemId: string, itemType: WishlistItemType): Promise<GeneralResponse<IWishlist | null>> {
    try {
      // Fetch fresh item data
      let itemData: { itemName?: string; price?: number; imageUrl?: string };

      if (itemType === WishlistItemType.PRODUCT) {
        const product = await ProductModel.findById(itemId);
        if (!product) {
          // If product no longer exists, remove from wishlist
          await wishlistRepository.removeItem(userId, itemId, itemType);
          throw new CustomErrorHandler(404, "Product not found and removed from wishlist");
        }

        itemData = {
          itemName: product.productName,
          price: product.productPrice,
          imageUrl: product.media && product.media.length > 0 ? product.media[0].fileUrl : undefined,
        };
      } else if (itemType === WishlistItemType.AUCTION) {
        const auction = await AuctionModel.findById(itemId);
        if (!auction) {
          // If auction no longer exists, remove from wishlist
          await wishlistRepository.removeItem(userId, itemId, itemType);
          throw new CustomErrorHandler(404, "Auction not found and removed from wishlist");
        }

        itemData = {
          itemName: auction.itemName,
          price: auction.highestBid > 0 ? auction.highestBid : auction.startPrice,
          imageUrl: auction.media && auction.media.length > 0 ? auction.media[0].fileUrl : undefined,
        };
      } else {
        throw new CustomErrorHandler(400, "Invalid item type");
      }

      // Update wishlist item data
      const wishlist = await wishlistRepository.updateItemData(userId, itemId, itemType, itemData);

      return {
        status: "success",
        message: "Wishlist item synced successfully",
        data: wishlist,
      };
    } catch (error) {
      console.error("Error syncing wishlist item:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to sync wishlist item");
    }
  }
}

export const wishlistService = new WishlistService();
