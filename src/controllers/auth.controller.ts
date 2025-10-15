import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { RegisterInput, LoginInput } from "../validations/auth.validation.js";
import { AuthenticatedRequest } from "../interfaces/auth.interface.js";

export class AuthController {
  /**
   * Register a new user
   * Note: Validation is handled by middleware, req.body is already validated and sanitized
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registerData = req.body as RegisterInput;

      // Register user
      const result = await authService.register(registerData);

      if (result.status === "success") {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Registration controller error:", error);
      next(error);
    }
  }

  /**
   * Login user
   * Note: Validation is handled by middleware, req.body is already validated and sanitized
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // At this point, req.body is already validated and sanitized by Zod middleware
      const loginData = req.body as LoginInput;

      // Login user
      const result = await authService.login(loginData);

      if (result.status === "success") {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error("Login controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during login",
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Get full user details
      const user = await authService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: {
          user: user.toJSON(),
        },
      });
    } catch (error) {
      console.error("Get profile controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while retrieving profile",
      });
    }
  }

  /**
   * Verify token endpoint
   */
  async verifyToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Invalid token",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Token is valid",
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      console.error("Verify token controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during token verification",
      });
    }
  }

  /**
   * Logout user (client-side token deletion)
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Since JWT is stateless, logout is handled client-side
      // This endpoint can be used for logging purposes
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during logout",
      });
    }
  }
}

export const authController = new AuthController();
