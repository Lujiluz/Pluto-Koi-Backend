import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { WishlistModel, IWishlist, IWishlistItem, WishlistItemType } from "../models/wishlist.model.js";
import { Types } from "mongoose";

export interface AddWishlistItemData {
  userId: string;
  itemId: string;
  itemType: WishlistItemType;
  itemData: {
    itemName: string;
    price: number;
    imageUrl?: string;
  };
}

export class WishlistRepository {
  /**
   * Find or create wishlist for a user
   */
  async findOrCreateByUserId(userId: string): Promise<IWishlist> {
    try {
      let wishlist = await WishlistModel.findOne({ userId: new Types.ObjectId(userId) });

      if (!wishlist) {
        wishlist = new WishlistModel({
          userId: new Types.ObjectId(userId),
          items: [],
        });
        await wishlist.save();
      }

      return wishlist;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find or create wishlist");
    }
  }

  /**
   * Get wishlist by user ID
   */
  async findByUserId(userId: string): Promise<IWishlist | null> {
    try {
      return await WishlistModel.findOne({ userId: new Types.ObjectId(userId) });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find wishlist");
    }
  }

  /**
   * Add item to wishlist
   */
  async addItem(data: AddWishlistItemData): Promise<IWishlist> {
    try {
      const wishlist = await this.findOrCreateByUserId(data.userId);

      // Check if item already exists in wishlist
      const existingItem = wishlist.items.find((item) => item.itemId.toString() === data.itemId && item.itemType === data.itemType);

      if (existingItem) {
        throw new CustomErrorHandler(409, "Item already exists in wishlist");
      }

      // Add new item
      const newItem: IWishlistItem = {
        itemId: new Types.ObjectId(data.itemId),
        itemType: data.itemType,
        itemData: data.itemData,
        addedAt: new Date(),
      };

      wishlist.items.push(newItem);
      await wishlist.save();

      return wishlist;
    } catch (error) {
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to add item to wishlist");
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeItem(userId: string, itemId: string, itemType: WishlistItemType): Promise<IWishlist | null> {
    try {
      const wishlist = await WishlistModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $pull: {
            items: {
              itemId: new Types.ObjectId(itemId),
              itemType: itemType,
            },
          },
        },
        { new: true }
      );

      return wishlist;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to remove item from wishlist");
    }
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(userId: string): Promise<IWishlist | null> {
    try {
      const wishlist = await WishlistModel.findOneAndUpdate({ userId: new Types.ObjectId(userId) }, { $set: { items: [] } }, { new: true });

      return wishlist;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to clear wishlist");
    }
  }

  /**
   * Check if item exists in wishlist
   */
  async itemExists(userId: string, itemId: string, itemType: WishlistItemType): Promise<boolean> {
    try {
      const wishlist = await WishlistModel.findOne({
        userId: new Types.ObjectId(userId),
        items: {
          $elemMatch: {
            itemId: new Types.ObjectId(itemId),
            itemType: itemType,
          },
        },
      });

      return wishlist !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to check item existence");
    }
  }

  /**
   * Get wishlist item count
   */
  async getItemCount(userId: string): Promise<number> {
    try {
      const wishlist = await WishlistModel.findOne({ userId: new Types.ObjectId(userId) });
      return wishlist ? wishlist.items.length : 0;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get wishlist item count");
    }
  }

  /**
   * Get items by type
   */
  async getItemsByType(userId: string, itemType: WishlistItemType): Promise<IWishlistItem[]> {
    try {
      const wishlist = await WishlistModel.findOne({ userId: new Types.ObjectId(userId) });

      if (!wishlist) {
        return [];
      }

      return wishlist.items.filter((item) => item.itemType === itemType);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get items by type");
    }
  }

  /**
   * Update embedded item data
   */
  async updateItemData(
    userId: string,
    itemId: string,
    itemType: WishlistItemType,
    itemData: {
      itemName?: string;
      price?: number;
      imageUrl?: string;
    }
  ): Promise<IWishlist | null> {
    try {
      const updateFields: any = {};

      if (itemData.itemName !== undefined) {
        updateFields["items.$.itemData.itemName"] = itemData.itemName;
      }
      if (itemData.price !== undefined) {
        updateFields["items.$.itemData.price"] = itemData.price;
      }
      if (itemData.imageUrl !== undefined) {
        updateFields["items.$.itemData.imageUrl"] = itemData.imageUrl;
      }

      const wishlist = await WishlistModel.findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          "items.itemId": new Types.ObjectId(itemId),
          "items.itemType": itemType,
        },
        { $set: updateFields },
        { new: true }
      );

      return wishlist;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to update item data");
    }
  }
}

export const wishlistRepository = new WishlistRepository();
