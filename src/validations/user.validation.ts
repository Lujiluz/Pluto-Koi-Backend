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
  approvalStatus: z
    .enum(["pending", "approved", "rejected"])
    .optional()
    .refine((val) => val === undefined || ["pending", "approved", "rejected"].includes(val), {
      message: "Approval status must be either 'pending', 'approved', or 'rejected'",
    }),
  role: z
    .enum(["admin", "endUser"])
    .optional()
    .refine((val) => val === undefined || ["admin", "endUser"].includes(val), {
      message: "Role must be either 'admin' or 'endUser'",
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

/**
 * Zod schema for reject user request body
 */
export const rejectUserSchema = z.object({
  reason: z.string().trim().max(500, "Reason cannot exceed 500 characters").optional(),
});

/**
 * Zod schema for creating admin user
 */
export const createAdminSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long").max(50, "Name cannot exceed 50 characters"),
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters long").max(100, "Password cannot exceed 100 characters"),
});

/**
 * Zod schema for getting all admins with filters
 */
export const getAllAdminsQuerySchema = z.object({
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
  search: z.string().trim().optional(),
});

// Type inference from schemas
export type GetAllUsersQuery = z.infer<typeof getAllUsersQuerySchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type RejectUserInput = z.infer<typeof rejectUserSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type GetAllAdminsQuery = z.infer<typeof getAllAdminsQuerySchema>;

/**
 * Generic middleware for validating request query parameters with Zod schemas
 */
export const validateRequestQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      console.log("Validated query data:", validatedData);

      // Store validated data in req.query by updating its properties
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, validatedData);
      next();
    } catch (error) {
      console.log("USER VALIDATION ERROR:", error);
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

      // Store validated data in req.params by updating its properties
      Object.keys(req.params).forEach((key) => delete req.params[key]);
      Object.assign(req.params, validatedData);
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
 * Generic middleware for validating request body with Zod schemas
 */
export const validateRequestBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      console.log("Validated body data:", validatedData);
      req.body = validatedData;
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
export const validateRejectUser = validateRequestBody(rejectUserSchema);
export const validateCreateAdmin = validateRequestBody(createAdminSchema);
export const validateGetAllAdminsQuery = validateRequestQuery(getAllAdminsQuerySchema);
