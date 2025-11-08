import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ProductType } from "../utils/constants.js";

/**
 * Zod schema for creating a product
 */
export const createProductSchema = z.object({
  productName: z.string().min(1, "Product name is required").max(200, "Product name cannot exceed 200 characters").trim(),

  productPrice: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      if (isNaN(num)) throw new Error("Invalid product price");
      return num;
    })
    .refine((val) => val > 0, "Product price must be greater than 0"),

  productType: z.enum([ProductType.PRODUK, ProductType.KOI_STORE]).refine((val) => Object.values(ProductType).includes(val), {
    message: "Product type must be either 'Produk' or 'Koi Store'",
  }),

  productCategory: z
    .string()
    .min(1, "Product category is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Product category must be a valid ObjectId"),

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
 * Zod schema for updating a product
 */
export const updateProductSchema = z
  .object({
    productName: z.string().min(1, "Product name is required").max(200, "Product name cannot exceed 200 characters").trim().optional(),

    productPrice: z
      .union([z.string(), z.number()])
      .transform((val) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(num)) throw new Error("Invalid product price");
        return num;
      })
      .refine((val) => val > 0, "Product price must be greater than 0")
      .optional(),

    productType: z
      .enum([ProductType.PRODUK, ProductType.KOI_STORE])
      .refine((val) => Object.values(ProductType).includes(val), {
        message: "Product type must be either 'Produk' or 'Koi Store'",
      })
      .optional(),

    productCategory: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Product category must be a valid ObjectId")
      .optional(),

    isActive: z
      .union([z.string(), z.boolean()])
      .transform((val) => {
        if (typeof val === "string") {
          return val === "true";
        }
        return val;
      })
      .optional(),

    keepExistingMedia: z
      .union([z.string(), z.boolean()])
      .transform((val) => {
        if (typeof val === "string") {
          return val === "true";
        }
        return val;
      })
      .optional()
      .default(false),
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
 * Zod schema for product ID parameter validation
 */
export const productIdParamSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

/**
 * Zod schema for price range query parameters
 */
export const priceRangeSchema = z
  .object({
    minPrice: z
      .string()
      .regex(/^\d*\.?\d+$/, "Invalid minimum price format")
      .transform(Number)
      .refine((val) => val >= 0, "Minimum price must be 0 or greater"),

    maxPrice: z
      .string()
      .regex(/^\d*\.?\d+$/, "Invalid maximum price format")
      .transform(Number)
      .refine((val) => val >= 0, "Maximum price must be 0 or greater"),
  })
  .refine((data) => data.maxPrice >= data.minPrice, {
    message: "Maximum price must be greater than or equal to minimum price",
    path: ["maxPrice"],
  });

/**
 * Zod schema for pagination and filtering query parameters
 */
export const productQuerySchema = z.object({
  page: z.string().transform(Number).optional().default(1),

  limit: z.string().transform(Number).optional().default(10),

  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  search: z.string().max(100, "Search term cannot exceed 100 characters").trim().default("").optional(),

  category: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Category must be a valid ObjectId")
    .optional(),

  type: z
    .enum([ProductType.PRODUK, ProductType.KOI_STORE])
    .refine((val) => Object.values(ProductType).includes(val), {
      message: "Product type must be either 'Produk' or 'Koi Store'",
    })
    .optional(),
});

/**
 * Zod schema for featured products query
 */
export const featuredProductsQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive number")
    .transform(Number)
    .refine((val) => val > 0 && val <= 50, "Limit must be between 1 and 50")
    .optional()
    .default(10),
});

// Type inference from schemas
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
export type PriceRangeQuery = z.infer<typeof priceRangeSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;
export type FeaturedProductsQuery = z.infer<typeof featuredProductsQuerySchema>;

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
 * Specific validation middlewares for product endpoints
 */
export const validateCreateProduct = validateRequestBody(createProductSchema);
export const validateUpdateProduct = validateRequestBody(updateProductSchema);
export const validateProductId = validateRequestParams(productIdParamSchema);
export const validatePriceRange = validateRequestQuery(priceRangeSchema);
export const validateProductQuery = validateRequestQuery(productQuerySchema);
export const validateFeaturedProductsQuery = validateRequestQuery(featuredProductsQuerySchema);
