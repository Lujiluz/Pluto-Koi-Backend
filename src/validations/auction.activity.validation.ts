import { z } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Zod schema for placing a bid
 */
export const placeBidSchema = z.object({
  auctionId: z.string().min(1, "Auction ID is required"),
  bidAmount: z.number().positive("Bid amount must be greater than 0"),
  bidType: z.enum(["initial", "outbid", "winning", "auto"]).optional(),
});

/**
 * Zod schema for auction ID parameter validation
 */
export const auctionIdParamSchema = z.object({
  auctionId: z.string().min(1, "Auction ID is required"),
});

/**
 * Zod schema for pagination query parameters
 */
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, "Page must be a positive number").transform(Number).optional(),
  limit: z.string().regex(/^\d+$/, "Limit must be a positive number").transform(Number).optional(),
});

// Type inference from schemas
export type PlaceBidInput = z.infer<typeof placeBidSchema>;
export type AuctionIdParam = z.infer<typeof auctionIdParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;

/**
 * Generic middleware for validating request bodies with Zod schemas
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
 * Generic middleware for validating request parameters
 */
export const validateRequestParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        });

        res.status(400).json({
          success: false,
          message: "Parameter validation failed",
          errors,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: "Invalid request parameters",
        errors: ["Parameter validation error"],
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
      const validatedData = schema.parse(req.query);
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, validatedData);
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
 * Specific validation middlewares for auction activity endpoints
 */
export const validatePlaceBid = validateRequestBody(placeBidSchema);
export const validateAuctionIdParam = validateRequestParams(auctionIdParamSchema);
export const validatePaginationQuery = validateRequestQuery(paginationSchema);
