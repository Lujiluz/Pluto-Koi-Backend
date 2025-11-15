import { Schema, model, Document } from "mongoose";

export interface IGalleryFolder extends Document {
  folderName: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const galleryFolderSchema = new Schema<IGalleryFolder>(
  {
    folderName: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      required: false,
      maxlength: 255,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text search index for folder names and descriptions
galleryFolderSchema.index({ folderName: "text", description: "text" });

// Pre-save middleware to prevent deletion/deactivation of 'General' folder
galleryFolderSchema.pre("save", function (next) {
  if (this.folderName === "General" && this.isActive === false) {
    const error = new Error("General folder cannot be deactivated");
    return next(error);
  }
  next();
});

// Pre-deleteOne middleware to prevent deletion of 'General' folder
galleryFolderSchema.pre("deleteOne", { document: true, query: false }, function (next) {
  if (this.folderName === "General") {
    const error = new Error("General folder cannot be deleted");
    return next(error);
  }
  next();
});

// Pre-findOneAndDelete middleware
galleryFolderSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc && doc.folderName === "General") {
    const error = new Error("General folder cannot be deleted");
    return next(error);
  }
  next();
});

// Pre-findOneAndUpdate middleware
galleryFolderSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;
  const doc = await this.model.findOne(this.getQuery());

  if (doc && doc.folderName === "General" && update.isActive === false) {
    const error = new Error("General folder cannot be deactivated");
    return next(error);
  }

  if (doc && doc.folderName === "General" && update.folderName && update.folderName !== "General") {
    const error = new Error("General folder name cannot be changed");
    return next(error);
  }

  next();
});

export const GalleryFolderModel = model<IGalleryFolder>("GalleryFolder", galleryFolderSchema);
