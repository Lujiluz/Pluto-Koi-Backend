import { z } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Zod schema for getting all users with filters
 */
export const getAllUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Page must be a positive number",
    }),
  limit: z
    .string()
    .optional()
    .default("10")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100, {
      message: "Limit must be a positive number between 1 and 100",
    }),
  status: z
    .enum(["active", "inactive", "banned"])
    .optional()
    .refine((val) => val === undefined || ["active", "inactive", "banned"].includes(val), {
      message: "Status must be either 'active', 'inactive', or 'banned'",
    }),
  search: z.string().trim().optional(),
});

/**
 * Zod schema for user ID parameter
 */
export const userIdParamSchema = z.object({
  id: z
    .string()
    .min(1, "User ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

// Type inference from schemas
export type GetAllUsersQuery = z.infer<typeof getAllUsersQuerySchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;

/**
 * Generic middleware for validating request query parameters with Zod schemas
 */
export const validateRequestQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      console.log("Validated query data:", validatedData);

      // Replace req.query with validated and sanitized data
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error);
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
 * Generic middleware for validating request parameters with Zod schemas
 */
export const validateRequestParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      console.log("Validated params data:", validatedData);

      // Replace req.params with validated and sanitized data
      req.params = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error);
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
 * Specific validation middlewares for user endpoints
 */
export const validateGetAllUsersQuery = validateRequestQuery(getAllUsersQuerySchema);
export const validateUserIdParam = validateRequestParams(userIdParamSchema);
