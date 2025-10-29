import { z } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Zod schema for creating an auction
 */
export const createAuctionSchema = z
  .object({
    itemName: z.string().min(1, "Item name is required").max(200, "Item name cannot exceed 200 characters").trim(),

    startPrice: z
      .union([z.string(), z.number()])
      .transform((val) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(num)) throw new Error("Invalid start price");
        return num;
      })
      .refine((val) => val > 0, "Start price must be greater than 0"),

    endPrice: z
      .union([z.string(), z.number()])
      .transform((val) => {
        if (val === "" || val === undefined || val === null) return 0;
        const num = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(num)) throw new Error("Invalid end price");
        return num;
      })
      .refine((val) => val >= 0, "End price must be 0 or greater")
      .optional()
      .default(0),

    startDate: z
      .union([z.string(), z.date()])
      .transform((val) => {
        const date = typeof val === "string" ? new Date(val) : val;
        console.log("val: ", new Date(val));

        console.log("date: ", date);
        if (isNaN(date.getTime())) throw new Error("Invalid start date");
        return date;
      })
      .refine((val) => val > new Date(), "Start date must be in the future"),

    endDate: z.union([z.string(), z.date()]).transform((val) => {
      const date = typeof val === "string" ? new Date(val) : val;
      if (isNaN(date.getTime())) throw new Error("Invalid end date");
      return date;
    }),

    endTime: z.string().optional().nullable(),
    extraTime: z
      .union([z.string(), z.number()])
      .transform((val) => {
        if (val === "" || val === undefined || val === null) return 0;
        const num = typeof val === "string" ? parseInt(val) : val;
        if (isNaN(num)) throw new Error("Invalid extra time type");
        return num;
      })
      .optional()
      .default(5),

    highestBid: z
      .union([z.string(), z.number()])
      .transform((val) => {
        if (val === "" || val === undefined || val === null) return 0;
        const num = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(num)) throw new Error("Invalid highest bid");
        return num;
      })
      .refine((val) => val >= 0, "Highest bid must be 0 or greater")
      .optional()
      .default(0),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

/**
 * Zod schema for auction ID parameter validation
 */
export const auctionIdParamSchema = z.object({
  id: z.string().min(1, "Auction ID is required"),
});

/**
 * Zod schema for pagination query parameters
 */
export const auctionPaginationSchema = z.object({
  page: z.string().regex(/^\d+$/, "Page must be a positive number").transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/, "Limit must be a positive number").transform(Number).optional().default(10),
});

// Type inference from schemas
export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
export type AuctionIdParam = z.infer<typeof auctionIdParamSchema>;
export type AuctionPaginationQuery = z.infer<typeof auctionPaginationSchema>;

/**
 * Middleware for validating auction creation form data
 */
export const validateCreateAuction = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Parse and validate form data
    const validatedData = createAuctionSchema.parse(req.body);

    // Replace req.body with validated and sanitized data
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
      message: "Invalid auction data",
      errors: ["Auction validation error"],
    });
  }
};

/**
 * Middleware for validating auction ID parameter
 */
export const validateAuctionId = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validatedParams = auctionIdParamSchema.parse(req.params);
    req.params = validatedParams as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });

      res.status(400).json({
        success: false,
        message: "Invalid auction ID",
        errors,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Invalid auction ID format",
      errors: ["Auction ID validation error"],
    });
  }
};

/**
 * Middleware for validating pagination query parameters
 */
export const validateAuctionPagination = (req: Request, res: Response, next: NextFunction): void => {
  try {
    auctionPaginationSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });

      res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        errors,
      });
      return;
    }

    console.error("Pagination validation error:", error);

    res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: ["Pagination validation error"],
    });
  }
};
