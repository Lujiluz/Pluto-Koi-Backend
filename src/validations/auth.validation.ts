import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/user.model.js";

/**
 * Zod schema for user registration
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters")
    .trim()
    .refine((val) => val.length > 0, "Name is required"),

  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password cannot exceed 128 characters")
    .refine((val) => val.length > 0, "Password is required"),

  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),

  role: z.nativeEnum(UserRole).default(UserRole.END_USER),

  address: z.object({
    street: z.string().trim().min(1, "Street is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    zipCode: z.string().trim().min(1, "Zip code is required"),
    country: z.string().trim().min(1, "Country is required"),
  }),
});

/**
 * Zod schema for user login
 */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),

  password: z.string().min(1, "Password is required"),
});

/**
 * Zod schema for password update
 */
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long").max(128, "New password cannot exceed 128 characters"),
});

/**
 * Zod schema for profile update
 */
export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long").max(50, "Name cannot exceed 50 characters").trim().optional(),

    email: z.string().email("Please enter a valid email address").toLowerCase().trim().optional(),

    phoneNumber: z
      .string()
      .trim()
      .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number")
      .optional(),

    address: z
      .object({
        street: z.string().trim().min(1, "Street is required"),
        city: z.string().trim().min(1, "City is required"),
        state: z.string().trim().min(1, "State is required"),
        zipCode: z.string().trim().min(1, "Zip code is required"),
        country: z.string().trim().min(1, "Country is required"),
      })
      .optional(),
  })
  .refine((data) => data.name || data.email || data.phoneNumber || data.address, {
    message: "At least one field (name, email, phoneNumber, or address) must be provided",
  });

// Type inference from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Generic middleware for validating request bodies with Zod schemas
 */
export const validateRequestBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      console.log("Validated data:", validatedData);

      // Replace req.body with validated and sanitized data
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
 * Specific validation middlewares for auth endpoints
 */
export const validateRegister = validateRequestBody(registerSchema);
export const validateLogin = validateRequestBody(loginSchema);
export const validateUpdatePassword = validateRequestBody(updatePasswordSchema);
export const validateUpdateProfile = validateRequestBody(updateProfileSchema);

/**
 * Legacy AuthValidator class for backward compatibility (deprecated)
 * @deprecated Use Zod schemas instead
 */
export class AuthValidator {
  /**
   * @deprecated Use registerSchema with validateRequestBody instead
   */
  static validateRegister(data: any) {
    try {
      const validated = registerSchema.parse(data);
      console.log("Validated register data:", validated);
      return {
        isValid: true,
        errors: [],
        data: validated,
      };
    } catch (error) {
      console.error("Validation error:", error);
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.issues.map((issue) => issue.message),
          data: null,
        };
      }
      return {
        isValid: false,
        errors: ["Validation failed"],
        data: null,
      };
    }
  }

  /**
   * @deprecated Use loginSchema with validateRequestBody instead
   */
  static validateLogin(data: any) {
    try {
      const validated = loginSchema.parse(data);
      return {
        isValid: true,
        errors: [],
        data: validated,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.issues.map((issue) => issue.message),
          data: null,
        };
      }
      return {
        isValid: false,
        errors: ["Validation failed"],
        data: null,
      };
    }
  }

  /**
   * @deprecated Data is automatically sanitized by Zod schemas
   */
  static sanitizeRegisterData(data: any) {
    try {
      return registerSchema.parse(data);
    } catch {
      return {
        name: "",
        email: "",
        password: "",
      };
    }
  }

  /**
   * @deprecated Data is automatically sanitized by Zod schemas
   */
  static sanitizeLoginData(data: any) {
    try {
      return loginSchema.parse(data);
    } catch {
      return {
        email: "",
        password: "",
      };
    }
  }
}
