import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { NextFunction, Request, Response } from "express";

// Ensure upload directories exist
const createUploadDirectories = () => {
  const dirs = ["public/media", "public/media/auctions", "public/media/products", "public/media/gallery", "public/media/transactions"];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize directories
createUploadDirectories();

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    let uploadPath = "public/media/auctions";

    if (req.originalUrl.includes("/product")) {
      uploadPath = "public/media/products";
    } else if (req.originalUrl.includes("/gallery")) {
      uploadPath = "public/media/gallery";
    } else if (req.originalUrl.includes("/transaction")) {
      uploadPath = "public/media/transactions";
    }

    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/mpeg", "video/quicktime"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`));
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
});

// Export different upload configurations
export const uploadAuctionMedia = upload.array("media", 10);
export const uploadSingleFile = upload.single("file");
export const uploadMultipleFiles = upload.array("files", 10);
export const uploadProductMedia = upload.array("media", 10);
export const uploadGalleryMedia = upload.array("media", 20); // Allow up to 20 files for galleries
export const uploadPaymentProof = upload.single("paymentProof"); // Single payment proof image for transactions

export const handleMulterError = (error: any, req: any, res: any, next: any) => {
  next(error);
};
