import { Schema, model, Document } from "mongoose";

interface IProductMedia {
  fileUrl: string;
}

export interface IProduct extends Document {
  productName: string;
  productPrice: number;
  isActive: boolean;
  media: IProductMedia[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    media: [
      {
        fileUrl: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const ProductModel = model<IProduct>("Product", productSchema);
