import { z } from "zod";

// Gallery type enum
export const galleryTypeEnum = z.enum(["exclusive", "regular"]);

// Base gallery schema for validation
export const gallerySchema = z
  .object({
    galleryName: z.string().min(2, "Gallery name must be at least 2 characters").max(100, "Gallery name must not exceed 100 characters").trim(),

    galleryType: galleryTypeEnum.default("regular"),

    owner: z.string().min(2, "Owner name must be at least 2 characters").max(50, "Owner name must not exceed 50 characters").trim(),

    // For exclusive product type
    fishCode: z.string().min(2, "Fish code must be at least 2 characters").max(50, "Fish code must not exceed 50 characters").trim().optional(),

    fishType: z.string().min(2, "Fish type must be at least 2 characters").max(100, "Fish type must not exceed 100 characters").trim().optional(),

    // For regular type
    handling: z.string().min(2, "Handling must be at least 2 characters").max(100, "Handling must not exceed 100 characters").trim().optional(),

    folderName: z.string().min(2, "Folder name must be at least 2 characters").max(50, "Folder name must not exceed 50 characters").trim().default("General").optional(),

    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Conditional validation based on galleryType
    if (data.galleryType === "exclusive") {
      // Exclusive product requires fishCode and fishType
      if (!data.fishCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fish code is required for exclusive product galleries",
          path: ["fishCode"],
        });
      }
      if (!data.fishType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fish type is required for exclusive product galleries",
          path: ["fishType"],
        });
      }
    } else if (data.galleryType === "regular") {
      // Regular type requires handling
      if (!data.handling) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Handling is required for regular galleries",
          path: ["handling"],
        });
      }
    }
  });

// Create gallery validation schema
export const createGallerySchema = gallerySchema;

// Update gallery validation schema (all fields optional except specific constraints)
export const updateGallerySchema = z.object({
  galleryName: z.string().min(2, "Gallery name must be at least 2 characters").max(100, "Gallery name must not exceed 100 characters").trim().optional(),

  galleryType: galleryTypeEnum.optional(),

  owner: z.string().min(2, "Owner name must be at least 2 characters").max(50, "Owner name must not exceed 50 characters").trim().optional(),

  // For exclusive product type
  fishCode: z.string().min(2, "Fish code must be at least 2 characters").max(50, "Fish code must not exceed 50 characters").trim().optional().nullable(),

  fishType: z.string().min(2, "Fish type must be at least 2 characters").max(100, "Fish type must not exceed 100 characters").trim().optional().nullable(),

  // For regular type
  handling: z.string().min(2, "Handling must be at least 2 characters").max(100, "Handling must not exceed 100 characters").trim().optional().nullable(),

  folderName: z.string().min(2, "Folder name must be at least 2 characters").max(50, "Folder name must not exceed 50 characters").trim().optional(),

  isActive: z.boolean().optional(),

  keepExistingMedia: z.boolean().optional(),
});

// Query parameters validation for getting galleries
export const getGalleriesQuerySchema = z.object({
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

  owner: z.string().max(50, "Owner name must not exceed 50 characters").trim().optional(),

  folderName: z.string().max(50, "Folder name must not exceed 50 characters").trim().optional(),

  galleryType: z.enum(["exclusive", "regular"]).optional(),
});

// Search galleries validation schema
export const searchGalleriesSchema = z.object({
  q: z.string().min(2, "Search query must be at least 2 characters").max(100, "Search query must not exceed 100 characters").trim(),
});

// Get galleries by owner validation schema
export const getGalleriesByOwnerSchema = z.object({
  owner: z.string().min(2, "Owner name must be at least 2 characters").max(50, "Owner name must not exceed 50 characters").trim(),
});

// Gallery ID parameter validation
export const galleryIdSchema = z.object({
  galleryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid gallery ID format"),
});

// Featured galleries query validation
export const featuredGalleriesQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive number")
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 50, "Limit must be between 1 and 50")
    .optional(),
});

// Combined validation schemas for different endpoints
export const validateCreateGallery = createGallerySchema;
export const validateUpdateGallery = updateGallerySchema;
export const validateGetGalleriesQuery = getGalleriesQuerySchema;
export const validateSearchGalleries = searchGalleriesSchema;
export const validateGalleriesByOwner = getGalleriesByOwnerSchema;
export const validateGalleryId = galleryIdSchema;
export const validateFeaturedGalleriesQuery = featuredGalleriesQuerySchema;

// Type exports for TypeScript
export type GalleryType = z.infer<typeof galleryTypeEnum>;
export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;
export type GetGalleriesQuery = z.infer<typeof getGalleriesQuerySchema>;
export type SearchGalleriesQuery = z.infer<typeof searchGalleriesSchema>;
export type GalleriesByOwnerParams = z.infer<typeof getGalleriesByOwnerSchema>;
export type GalleryIdParams = z.infer<typeof galleryIdSchema>;
export type FeaturedGalleriesQuery = z.infer<typeof featuredGalleriesQuerySchema>;
