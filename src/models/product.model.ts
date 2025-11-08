import { Schema, model, Document, Types } from "mongoose";
import { ProductType } from "../utils/constants.js";

interface IProductMedia {
  fileUrl: string;
}

export interface IProduct extends Document {
  productName: string;
  productPrice: number;
  productType: ProductType;
  productCategory: Types.ObjectId;
  isActive: boolean;
  media: IProductMedia[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productType: {
      type: String,
      enum: Object.values(ProductType),
      required: true,
    },
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    media: [
      {
        fileUrl: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

productSchema.index({ productName: "text" });

export const ProductModel = model<IProduct>("Product", productSchema);
