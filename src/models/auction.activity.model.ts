import { Document, model, Model } from "mongoose";
import { Schema, Types } from "mongoose";

export interface IAuctionActivity extends Document {
  auctionId: Types.ObjectId;
  userId: Types.ObjectId;
  bidAmount: number;
  bidType: "initial" | "outbid" | "winning" | "auto";
  isActive: boolean;
  bidTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const auctionActivitySchema = new Schema<IAuctionActivity>(
  {
    auctionId: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bidAmount: { type: Number, required: true, min: 0 },
    bidType: {
      type: String,
      enum: ["initial", "outbid", "winning", "auto"],
      default: "initial",
    },
    isActive: { type: Boolean, default: true },
    bidTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound indexes for efficient querying
auctionActivitySchema.index({ auctionId: 1, userId: 1 }); // Find user's bids for specific auction
auctionActivitySchema.index({ auctionId: 1, bidAmount: -1 }); // Find highest bids for auction
auctionActivitySchema.index({ auctionId: 1, isActive: 1, bidAmount: -1 }); // Find active highest bid
auctionActivitySchema.index({ userId: 1, createdAt: -1 }); // User's bid history

// Static methods for common queries
auctionActivitySchema.statics.getAuctionParticipants = function (auctionId: Types.ObjectId) {
  return this.find({ auctionId }).populate("userId", "name email role").sort({ bidAmount: -1, createdAt: -1 });
};

auctionActivitySchema.statics.getHighestBidForAuction = function (auctionId: Types.ObjectId) {
  return this.findOne({ auctionId, isActive: true }).sort({ bidAmount: -1 }).populate("userId", "name email role");
};

auctionActivitySchema.statics.getUserBidsForAuction = function (auctionId: Types.ObjectId, userId: Types.ObjectId) {
  return this.find({ auctionId, userId }).sort({ createdAt: -1 });
};

auctionActivitySchema.statics.getUniqueParticipantsCount = function (auctionId: Types.ObjectId) {
  return this.distinct("userId", { auctionId }).then((users: Types.ObjectId[]) => users.length);
};

// Interface for static methods
interface IAuctionActivityModel extends Model<IAuctionActivity> {
  getAuctionParticipants(auctionId: Types.ObjectId): Promise<IAuctionActivity[]>;
  getHighestBidForAuction(auctionId: Types.ObjectId): Promise<IAuctionActivity | null>;
  getUserBidsForAuction(auctionId: Types.ObjectId, userId: Types.ObjectId): Promise<IAuctionActivity[]>;
  getUniqueParticipantsCount(auctionId: Types.ObjectId): Promise<number>;
}

export const AuctionActivityModel = model<IAuctionActivity, IAuctionActivityModel>("AuctionActivity", auctionActivitySchema);
