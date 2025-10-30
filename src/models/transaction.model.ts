import { Document, model, Schema, Types } from "mongoose";

export enum TransactionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

export enum PaymentStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export interface IBuyerInfo {
  name: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface ITransaction extends Document {
  // User reference (optional - null for guest purchases)
  userId?: Types.ObjectId;

  // Product information
  productId: Types.ObjectId;
  productName: string;
  productPrice: number;
  quantity: number;
  totalAmount: number;

  // Buyer information (for both guest and logged-in users)
  buyerInfo: IBuyerInfo;

  // Payment information
  paymentProof: string; // URL to the payment proof image
  paymentStatus: PaymentStatus;

  // Transaction status
  status: TransactionStatus;

  // Admin notes (optional)
  adminNotes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productPrice: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price must be positive"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount must be positive"],
    },
    buyerInfo: {
      name: {
        type: String,
        required: [true, "Buyer name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Buyer email is required"],
        lowercase: true,
        trim: true,
      },
      phoneNumber: {
        type: String,
        required: [true, "Buyer phone number is required"],
        trim: true,
      },
      address: {
        street: {
          type: String,
          required: [true, "Street address is required"],
          trim: true,
        },
        city: {
          type: String,
          required: [true, "City is required"],
          trim: true,
        },
        state: {
          type: String,
          required: [true, "State is required"],
          trim: true,
        },
        zipCode: {
          type: String,
          required: [true, "Zip code is required"],
          trim: true,
        },
        country: {
          type: String,
          required: [true, "Country is required"],
          trim: true,
        },
      },
    },
    paymentProof: {
      type: String,
      required: [true, "Payment proof is required"],
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
transactionSchema.index({ userId: 1 });
transactionSchema.index({ productId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentStatus: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ "buyerInfo.email": 1 });

export const TransactionModel = model<ITransaction>("Transaction", transactionSchema);
