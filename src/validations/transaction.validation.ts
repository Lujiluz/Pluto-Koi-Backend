import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { TransactionStatus, PaymentStatus } from "../models/transaction.model.js";

/**
 * Address schema (reusable)
 */
const addressSchema = z.object({
  street: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  zipCode: z.string().trim().min(1, "Zip code is required"),
  country: z.string().trim().min(1, "Country is required"),
});

/**
 * Schema for guest user purchase (includes all buyer info)
 */
export const guestPurchaseSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),

  // Guest buyer information
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
  address: addressSchema,
});

/**
 * Schema for logged-in user purchase (only needs product info)
 */
export const userPurchaseSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

/**
 * Schema for updating transaction status (admin only)
 */
export const updateTransactionStatusSchema = z
  .object({
    status: z.nativeEnum(TransactionStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    adminNotes: z.string().trim().max(500, "Admin notes cannot exceed 500 characters").optional(),
  })
  .refine((data) => data.status || data.paymentStatus || data.adminNotes, {
    message: "At least one field (status, paymentStatus, or adminNotes) must be provided",
  });

/**
 * Schema for transaction query filters
 */
export const transactionQuerySchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  userId: z.string().optional(),
  productId: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

// Type inference from schemas
export type GuestPurchaseInput = z.infer<typeof guestPurchaseSchema>;
export type UserPurchaseInput = z.infer<typeof userPurchaseSchema>;
export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;

/**
 * Generic middleware for validating request bodies with Zod schemas
 */
export const validateRequestBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      console.log("Validated transaction data:", validatedData);

      // Replace req.body with validated and sanitized data
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Transaction validation error:", error);
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
 * Middleware for validating query parameters
 */
export const validateQueryParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Convert string query params to appropriate types
      const queryData: any = { ...req.query };

      if (queryData.page) queryData.page = parseInt(queryData.page);
      if (queryData.limit) queryData.limit = parseInt(queryData.limit);

      const validatedData = schema.parse(queryData);
      console.log("Validated query params:", validatedData);

      // Replace req.query with validated data
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Query validation error:", error);
        const errors = error.issues.map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        });

        res.status(400).json({
          success: false,
          message: "Invalid query parameters",
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
 * Specific validation middlewares for transaction endpoints
 */
export const validateGuestPurchase = validateRequestBody(guestPurchaseSchema);
export const validateUserPurchase = validateRequestBody(userPurchaseSchema);
export const validateUpdateTransactionStatus = validateRequestBody(updateTransactionStatusSchema);
export const validateTransactionQuery = validateQueryParams(transactionQuerySchema);
