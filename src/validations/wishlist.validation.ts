import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { WishlistItemType } from "../models/wishlist.model.js";

/**
 * Zod schema for adding item to wishlist
 */
export const addToWishlistSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  itemType: z.nativeEnum(WishlistItemType, {
    message: "Item type must be either 'product' or 'auction'",
  }),
});

/**
 * Zod schema for removing item from wishlist
 */
export const removeFromWishlistSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  itemType: z.nativeEnum(WishlistItemType, {
    message: "Item type must be either 'product' or 'auction'",
  }),
});

/**
 * Zod schema for checking item in wishlist
 */
export const checkItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  itemType: z.nativeEnum(WishlistItemType, {
    message: "Item type must be either 'product' or 'auction'",
  }),
});

/**
 * Zod schema for getting items by type
 */
export const itemTypeQuerySchema = z.object({
  itemType: z.nativeEnum(WishlistItemType, {
    message: "Item type must be either 'product' or 'auction'",
  }),
});

/**
 * Zod schema for syncing wishlist item
 */
export const syncItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  itemType: z.nativeEnum(WishlistItemType, {
    message: "Item type must be either 'product' or 'auction'",
  }),
});

// Type inference from schemas
export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
export type RemoveFromWishlistInput = z.infer<typeof removeFromWishlistSchema>;
export type CheckItemInput = z.infer<typeof checkItemSchema>;
export type ItemTypeQuery = z.infer<typeof itemTypeQuerySchema>;
export type SyncItemInput = z.infer<typeof syncItemSchema>;

/**
 * Generic middleware for validating request bodies
 */
export const validateRequestBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        });

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: ["Request validation error"],
      });
    }
  };
};

/**
 * Generic middleware for validating query parameters
 */
export const validateRequestQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        });

        res.status(400).json({
          success: false,
          message: "Query validation failed",
          errors,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: ["Query validation error"],
      });
    }
  };
};

/**
 * Specific validation middlewares for wishlist endpoints
 */
export const validateAddToWishlist = validateRequestBody(addToWishlistSchema);
export const validateRemoveFromWishlist = validateRequestBody(removeFromWishlistSchema);
export const validateCheckItem = validateRequestQuery(checkItemSchema);
export const validateItemTypeQuery = validateRequestQuery(itemTypeQuerySchema);
export const validateSyncItem = validateRequestBody(syncItemSchema);
