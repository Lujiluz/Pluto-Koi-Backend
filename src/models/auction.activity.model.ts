import { Document, model } from "mongoose";
import { Schema, Types } from "mongoose";

export interface IAuctionActivity extends Document {
  auctionId: Types.ObjectId;
  userId: Types.ObjectId;
  bidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const auctionActivitySchema = new Schema<IAuctionActivity>(
  {
    auctionId: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bidAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const AuctionActivityModel = model<IAuctionActivity>("AuctionActivity", auctionActivitySchema);
