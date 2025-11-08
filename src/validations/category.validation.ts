import { z } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Zod schema for creating a category
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Category name cannot exceed 100 characters").trim(),

  description: z.string().max(500, "Description cannot exceed 500 characters").trim().optional(),

  isActive: z
    .union([z.string(), z.boolean()])
    .transform((val) => {
      if (typeof val === "string") {
        return val === "true";
      }
      return val;
    })
    .optional()
    .default(true),
});

/**
 * Zod schema for updating a category
 */
export const updateCategorySchema = z
  .object({
    name: z.string().min(1, "Category name is required").max(100, "Category name cannot exceed 100 characters").trim().optional(),

    description: z.string().max(500, "Description cannot exceed 500 characters").trim().optional(),

    isActive: z
      .union([z.string(), z.boolean()])
      .transform((val) => {
        if (typeof val === "string") {
          return val === "true";
        }
        return val;
      })
      .optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided for update
      return Object.keys(data).some((key) => data[key as keyof typeof data] !== undefined);
    },
    {
      message: "At least one field must be provided for update",
    }
  );

/**
 * Zod schema for category ID parameter validation
 */
export const categoryIdParamSchema = z.object({
  id: z
    .string()
    .min(1, "Category ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Category ID must be a valid ObjectId"),
});

/**
 * Zod schema for pagination and filtering query parameters for categories
 */
export const categoryQuerySchema = z.object({
  page: z.string().transform(Number).optional().default(1),

  limit: z.string().transform(Number).optional().default(10),

  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  search: z.string().max(100, "Search term cannot exceed 100 characters").trim().default("").optional(),
});

// Type inference from schemas
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;

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
 * Generic middleware for validating request parameters
 */
export const validateRequestParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
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
      schema.parse(req.query);
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
 * Specific validation middlewares for category endpoints
 */
export const validateCreateCategory = validateRequestBody(createCategorySchema);
export const validateUpdateCategory = validateRequestBody(updateCategorySchema);
export const validateCategoryId = validateRequestParams(categoryIdParamSchema);
export const validateCategoryQuery = validateRequestQuery(categoryQuerySchema);
