import { Document, Schema, model } from "mongoose";

export interface IEvent extends Document {
  isActive: boolean;
  totalBidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    isActive: { type: Boolean, required: true, default: false },
    totalBidAmount: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const EventModel = model<IEvent>("Event", eventSchema);
