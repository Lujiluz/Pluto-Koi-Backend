import { Document, model, Schema, Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      index: { expires: 0 }, // TTL index - document will be deleted when expiresAt is reached
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
sessionSchema.index({ userId: 1, token: 1 });

const Session = model<ISession>("Session", sessionSchema);

export default Session;
