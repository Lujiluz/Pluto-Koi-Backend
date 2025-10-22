import { Document, model, Schema, Types } from "mongoose";

export enum WishlistItemType {
  PRODUCT = "product",
  AUCTION = "auction",
}

// Embedded item data for quick access
export interface IWishlistItemData {
  itemName: string;
  price: number;
  imageUrl?: string;
}

export interface IWishlistItem {
  itemId: Types.ObjectId;
  itemType: WishlistItemType;
  itemData: IWishlistItemData;
  addedAt: Date;
}

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemDataSchema = new Schema<IWishlistItemData>(
  {
    itemName: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    itemId: { type: Schema.Types.ObjectId, required: true, refPath: "items.itemType" },
    itemType: { type: String, enum: Object.values(WishlistItemType), required: true },
    itemData: { type: wishlistItemDataSchema, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [wishlistItemSchema],
  },
  { timestamps: true }
);

// Indexes for performance
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ "items.itemId": 1 });
wishlistSchema.index({ "items.itemType": 1 });

export const WishlistModel = model<IWishlist>("Wishlist", wishlistSchema);
