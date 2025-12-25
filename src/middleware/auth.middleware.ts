import { Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { AuthenticatedRequest, AUTH_COOKIE_NAME } from "../interfaces/auth.interface.js";

/**
 * Extract token from request (cookie or Authorization header)
 */
const extractToken = (req: AuthenticatedRequest): string | null => {
  // First, try to get token from HTTP-only cookie
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to Authorization header (for backward compatibility)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

/**
 * Middleware to verify JWT token and authenticate user
 * Supports both cookie-based and header-based authentication
 * Also validates session exists in database
 */
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);

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
 * Supports both cookie-based and header-based authentication
 * Also validates session if token is provided
 */
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);

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
