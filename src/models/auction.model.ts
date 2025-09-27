import { Schema, model, Document } from "mongoose";

interface IAuctionMedia {
  fileUrl: string;
}

export interface IAuction extends Document {
  itemName: string;
  startPrice: number;
  endPrice: number;
  startDate: Date;
  endDate: Date;
  media: IAuctionMedia[];
  createdAt: Date;
  updatedAt: Date;
}

const auctionSchema = new Schema<IAuction>(
  {
    itemName: { type: String, required: true },
    startPrice: { type: Number, required: true },
    endPrice: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    media: [
      {
        fileUrl: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const AuctionModel = model<IAuction>("Auction", auctionSchema);
