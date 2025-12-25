import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { RegisterInput, LoginInput } from "../validations/auth.validation.js";
import { AuthenticatedRequest, LoginType, AUTH_COOKIE_NAME, getCookieOptions } from "../interfaces/auth.interface.js";
import { ResponseError } from "../middleware/errorHandler.js";

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
   * Login user (end user only)
   * Note: Validation is handled by middleware, req.body is already validated and sanitized
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // At this point, req.body is already validated and sanitized by Zod middleware
      const loginData = req.body as LoginInput;

      // Get request info for session tracking
      const requestInfo = {
        userAgent: req.headers["user-agent"],
        ipAddress: this.getUserIp(req),
      };

      // Login user with type "user" (end user only)
      const result = await authService.login(loginData, "user", requestInfo);

      if (result.status === "success" && result.data?.token) {
        // Set HTTP-only cookie with the token
        const tokenData = await authService.getTokenData(result.data.token);
        res.cookie(AUTH_COOKIE_NAME, result.data.token, getCookieOptions(tokenData?.maxAge || 7 * 24 * 60 * 60 * 1000));

        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  private getUserIp(req: Request): string | "N/A" {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return forwardedStr.split(",")[0].trim();
    }
    const realIp = req.headers["x-real-ip"];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }
    const cfIp = req.headers["cf-connecting-ip"];
    if (cfIp) {
      return Array.isArray(cfIp) ? cfIp[0] : cfIp;
    }
    return req.socket.remoteAddress || req.connection.remoteAddress || "N/A";
  }

  /**
   * Login admin
   * Note: Validation is handled by middleware, req.body is already validated and sanitized
   */
  async loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // At this point, req.body is already validated and sanitized by Zod middleware
      const loginData = req.body as LoginInput;

      // Get request info for session tracking
      const requestInfo = {
        userAgent: req.headers["user-agent"],
        ipAddress: this.getUserIp(req),
      };

      // Login with type "admin" (admin only)
      const result = await authService.login(loginData, "admin", requestInfo);

      if (result.status === "success" && result.data?.token) {
        // Set HTTP-only cookie with the token
        const tokenData = await authService.getTokenData(result.data.token);
        res.cookie(AUTH_COOKIE_NAME, result.data.token, getCookieOptions(tokenData?.maxAge || 7 * 24 * 60 * 60 * 1000));

        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      next(error);
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
   * Logout user - invalidate session in database and clear cookie
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract token from cookie or header
      const token = req.cookies?.[AUTH_COOKIE_NAME] || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

      if (token) {
        // Invalidate session in database
        await authService.logout(token);
      }

      // Clear the auth cookie
      res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
      });

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

  /**
   * Logout all sessions for current user and clear cookie
   */
  async logoutAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Invalidate all sessions for user
      const deletedCount = await authService.logoutAllSessions(req.user.id);

      // Clear the auth cookie
      res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
      });

      res.status(200).json({
        success: true,
        message: `Successfully logged out from all ${deletedCount} session(s)`,
      });
    } catch (error) {
      console.error("Logout all controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during logout",
      });
    }
  }

  /**
   * Verify approval token from email link
   * This is the webhook endpoint that handles when user clicks the verification link
   */
  async verifyApproval(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const errorPath = process.env.APPROVAL_ERROR_REDIRECT_PATH || "/approval-error";
        res.redirect(`${frontendUrl}${errorPath}?error=missing_token`);
        return;
      }

      const result = await authService.verifyApprovalToken(token);

      // Redirect to frontend URL based on result
      res.redirect(result.redirectUrl);
    } catch (error) {
      console.error("Verify approval controller error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const errorPath = process.env.APPROVAL_ERROR_REDIRECT_PATH || "/approval-error";
      res.redirect(`${frontendUrl}${errorPath}?error=verification_failed`);
    }
  }
}

export const authController = new AuthController();
