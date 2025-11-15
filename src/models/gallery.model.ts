import { Schema, model, Document } from "mongoose";

interface IGalleryMedia {
  fileUrl: string;
}

export interface IGallery extends Document {
  galleryName: string;
  owner: string;
  handling: string;
  folderName: string;
  isActive: boolean;
  media: IGalleryMedia[];
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    galleryName: { type: String, required: true },
    owner: { type: String, required: true },
    handling: { type: String, required: true },
    folderName: { type: String, default: "General", index: true },
    isActive: { type: Boolean, default: true },
    media: [
      {
        fileUrl: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

gallerySchema.index({ galleryName: "text", owner: "text", handling: "text", folderName: "text" });

export const GalleryModel = model<IGallery>("Gallery", gallerySchema);
