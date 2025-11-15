import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// File upload interface
export interface UploadedFile {
  originalname: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  buffer?: Buffer;
}

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

// File validation function
export const validateFile = (file: UploadedFile): { isValid: boolean; error?: string } => {
  // Allowed file types
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/mpeg", "video/quicktime"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`,
    };
  }

  // Check file size (10MB limit)
  const maxSizeInBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: "File size exceeds 10MB limit",
    };
  }

  return { isValid: true };
};

// Generate unique filename
export const generateUniqueFilename = (originalName: string): string => {
  const extension = path.extname(originalName);
  return `${uuidv4()}-${Date.now()}${extension}`;
};

// Save file to disk
export const saveFile = (file: UploadedFile, category: "auctions" | "products" | "gallery" | "transactions" = "auctions"): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const uploadPath = `public/media/${category}`;
      const filename = generateUniqueFilename(file.originalname);
      const fullPath = path.join(uploadPath, filename);

      if (file.buffer) {
        fs.writeFileSync(fullPath, file.buffer);
      } else if (file.path) {
        // If file is already saved by multer, move it
        fs.renameSync(file.path, fullPath);
      } else {
        throw new Error("No file data provided");
      }

      resolve(filename);
    } catch (error) {
      reject(error);
    }
  });
};

// Utility function to get file URL
export const getFileUrl = (filename: string, category: "auctions" | "products" | "gallery" | "transactions" = "auctions"): string => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  return `${baseUrl}/media/${category}/${filename}`;
};

// Utility function to delete file
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

// Utility function to validate multiple files
export const validateFiles = (files: UploadedFile[], maxFiles: number = 10): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (files.length > maxFiles) {
    errors.push(`Too many files. Maximum allowed: ${maxFiles}`);
  }

  files.forEach((file, index) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      errors.push(`File ${index + 1}: ${validation.error}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Process uploaded files and return file info
export const processUploadedFiles = async (files: UploadedFile[], category: "auctions" | "products" | "gallery" | "transactions" = "auctions") => {
  const processedFiles = [];

  for (const file of files) {
    try {
      const filename = await saveFile(file, category);
      processedFiles.push({
        fileUrl: getFileUrl(filename, category),
        originalName: file.originalname,
        filename,
        size: file.size,
        mimetype: file.mimetype,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      throw new Error(`Failed to process file: ${file.originalname}`);
    }
  }

  return processedFiles;
};

// Process single payment proof file
export const processPaymentProof = async (file: UploadedFile): Promise<{ fileUrl: string; filename: string }> => {
  try {
    // Validate the payment proof file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(`Payment proof validation failed: ${validation.error}`);
    }

    // Save the file
    const filename = await saveFile(file, "transactions");

    // Generate the full URL
    const fileUrl = getFileUrl(filename, "transactions");

    return {
      fileUrl,
      filename,
    };
  } catch (error) {
    console.error("Error processing payment proof:", error);
    throw new Error(`Failed to process payment proof: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
