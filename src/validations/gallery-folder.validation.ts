import { z } from "zod";

// Base gallery folder schema for validation
export const galleryFolderSchema = z.object({
  folderName: z
    .string()
    .min(2, "Folder name must be at least 2 characters")
    .max(50, "Folder name must not exceed 50 characters")
    .trim()
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Folder name can only contain letters, numbers, spaces, hyphens, and underscores"),

  description: z.string().max(255, "Description must not exceed 255 characters").trim().optional(),

  isActive: z.boolean().optional(),
});

// Create gallery folder validation schema
export const createGalleryFolderSchema = galleryFolderSchema.omit({ isActive: true }).extend({
  isActive: z.boolean().default(true).optional(),
});

// Update gallery folder validation schema (all fields optional except specific constraints)
export const updateGalleryFolderSchema = z
  .object({
    folderName: z
      .string()
      .min(2, "Folder name must be at least 2 characters")
      .max(50, "Folder name must not exceed 50 characters")
      .trim()
      .regex(/^[a-zA-Z0-9\s\-_]+$/, "Folder name can only contain letters, numbers, spaces, hyphens, and underscores")
      .optional(),

    description: z.string().max(255, "Description must not exceed 255 characters").trim().optional(),

    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Prevent deactivation of General folder
      if (data.folderName === "General" && data.isActive === false) {
        return false;
      }
      return true;
    },
    {
      message: "General folder cannot be deactivated",
    }
  );

// Query parameters validation for getting gallery folders
export const getGalleryFoldersQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive number")
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, "Page must be greater than 0")
    .optional(),

  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive number")
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .optional(),

  isActive: z
    .string()
    .transform((val) => val.toLowerCase() === "true")
    .optional(),

  search: z.string().max(100, "Search term must not exceed 100 characters").trim().optional(),
});

// Search gallery folders validation schema
export const searchGalleryFoldersSchema = z.object({
  q: z.string().min(2, "Search query must be at least 2 characters").max(100, "Search query must not exceed 100 characters").trim(),
});

// Gallery folder ID parameter validation
export const galleryFolderIdSchema = z.object({
  folderId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid folder ID format"),
});

// Folder name parameter validation
export const galleryFolderNameSchema = z.object({
  folderName: z.string().min(2, "Folder name must be at least 2 characters").max(50, "Folder name must not exceed 50 characters").trim(),
});

// Gallery folder assignment validation
export const galleryFolderAssignmentSchema = z.object({
  galleryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid gallery ID format"),
  folderName: z.string().min(2, "Folder name must be at least 2 characters").max(50, "Folder name must not exceed 50 characters").trim(),
});

// Bulk folder operations validation
export const bulkFolderOperationSchema = z.object({
  galleryIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid gallery ID format")).min(1, "At least one gallery ID is required"),
  folderName: z.string().min(2, "Folder name must be at least 2 characters").max(50, "Folder name must not exceed 50 characters").trim(),
});

// Delete folder validation (prevent General folder deletion)
export const deleteFolderValidationSchema = z
  .object({
    folderId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid folder ID format"),
  })
  .refine(
    async (data) => {
      // This would need to be checked against the database
      // For now, we'll handle this in the controller/service layer
      return true;
    },
    {
      message: "General folder cannot be deleted",
    }
  );

// Combined validation schemas for different endpoints
export const validateCreateGalleryFolder = createGalleryFolderSchema;
export const validateUpdateGalleryFolder = updateGalleryFolderSchema;
export const validateGetGalleryFoldersQuery = getGalleryFoldersQuerySchema;
export const validateSearchGalleryFolders = searchGalleryFoldersSchema;
export const validateGalleryFolderId = galleryFolderIdSchema;
export const validateGalleryFolderName = galleryFolderNameSchema;
export const validateGalleryFolderAssignment = galleryFolderAssignmentSchema;
export const validateBulkFolderOperation = bulkFolderOperationSchema;

// Type exports for TypeScript
export type CreateGalleryFolderInput = z.infer<typeof createGalleryFolderSchema>;
export type UpdateGalleryFolderInput = z.infer<typeof updateGalleryFolderSchema>;
export type GetGalleryFoldersQuery = z.infer<typeof getGalleryFoldersQuerySchema>;
export type SearchGalleryFoldersQuery = z.infer<typeof searchGalleryFoldersSchema>;
export type GalleryFolderIdParams = z.infer<typeof galleryFolderIdSchema>;
export type GalleryFolderNameParams = z.infer<typeof galleryFolderNameSchema>;
export type GalleryFolderAssignmentInput = z.infer<typeof galleryFolderAssignmentSchema>;
export type BulkFolderOperationInput = z.infer<typeof bulkFolderOperationSchema>;
