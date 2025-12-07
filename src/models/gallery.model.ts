import { Schema, model, Document } from "mongoose";

interface IGalleryMedia {
  fileUrl: string;
}

// Gallery types enum
export type GalleryType = "exclusive" | "regular";

export interface IGallery extends Document {
  galleryName: string;
  galleryType: GalleryType;
  owner: string;
  // For exclusive product type
  fishCode?: string;
  fishType?: string;
  // For regular type
  handling?: string;
  folderName: string;
  isActive: boolean;
  media: IGalleryMedia[];
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    galleryName: { type: String, required: true },
    galleryType: {
      type: String,
      enum: ["exclusive", "regular"],
      required: true,
      default: "regular",
    },
    owner: { type: String, required: true },
    // Fields for exclusive product type
    fishCode: { type: String, required: false },
    fishType: { type: String, required: false },
    // Field for regular type
    handling: { type: String, required: false },
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

// Text index for search
gallerySchema.index({
  galleryName: "text",
  owner: "text",
  handling: "text",
  fishCode: "text",
  fishType: "text",
  folderName: "text",
});

// Index for galleryType filter
gallerySchema.index({ galleryType: 1 });

export const GalleryModel = model<IGallery>("Gallery", gallerySchema);
