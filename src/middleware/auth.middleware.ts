import { Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { AuthenticatedRequest } from "../interfaces/auth.interface.js";

/**
 * Middleware to verify JWT token and authenticate user
 * Also validates session exists in database
 */
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    if (!decoded) {
      res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    // Validate session exists in database
    const isValidSession = await authService.validateSession(token);
    if (!isValidSession) {
      res.status(401).json({
        success: false,
        message: "Session expired or invalid. Please login again.",
      });
      return;
    }

    // Validate user still exists
    const user = await authService.validateUser(decoded.userId);
    if (!user) {
      res.status(403).json({
        success: false,
        message: "User not found or inactive",
      });
      return;
    }

    // Check if user is rejected
    if (user.rejectedAt) {
      res.status(401).json({
        success: false,
        message: "user tidak valid, mohon lakukan pendaftaran akun terlebih dahulu",
      });
      return;
    }

    // Check if user status is not active
    if (user.status !== "active") {
      res.status(401).json({
        success: false,
        message: "Akun Anda ditangguhkan, mohon hubungi Admin komunitas untuk mendapatkan informasi lanjutan.",
      });
      return;
    }

    // Check if user is deleted
    if (user.deleted) {
      res.status(403).json({
        success: false,
        message: "This account has been deleted",
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const adminRouteAuthentication = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(["admin"]);

/**
 * Optional authentication middleware - doesn't fail if no token
 * Also validates session if token is provided
 */
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = authService.verifyToken(token);
      if (decoded) {
        // Validate session exists in database
        const isValidSession = await authService.validateSession(token);
        if (isValidSession) {
          const user = await authService.validateUser(decoded.userId);
          if (user && !user.rejectedAt && user.status === "active" && !user.deleted) {
            req.user = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
      }
    }

    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
};
