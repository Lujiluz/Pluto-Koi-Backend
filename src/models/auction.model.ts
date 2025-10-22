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
  endTime: Date;
  extraTime: number
  highestBid: number;
  media: IAuctionMedia[];
  createdAt: Date;
  updatedAt: Date;
}

const auctionSchema = new Schema<IAuction>(
  {
    itemName: { type: String, required: true },
    startPrice: { type: Number, required: true },
    endPrice: { type: Number, required: true, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    endTime: { type: Date, required: true },
    extraTime: { type: Number, required: true, default: 0 },
    highestBid: { type: Number, required: true, default: 0 },
    media: [
      {
        fileUrl: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

auctionSchema.index({'itemName': 'text'})

export const AuctionModel = model<IAuction>("Auction", auctionSchema);
