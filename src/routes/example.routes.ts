import { Router } from "express";
import { authenticateToken, requireAdmin } from "#middleware/auth.middleware.js";
import { AuthenticatedRequest } from "#interfaces/auth.interface.js";
import { Response } from "express";

const router = Router();

/**
 * @route   GET /api/example/public
 * @desc    Public route - no authentication required
 * @access  Public
 */
router.get("/public", (req, res) => {
  res.json({
    success: true,
    message: "This is a public endpoint",
    data: {
      info: "Anyone can access this endpoint without authentication",
    },
  });
});

/**
 * @route   GET /api/example/protected
 * @desc    Protected route - requires valid JWT token
 * @access  Private
 */
router.get("/protected", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    message: "This is a protected endpoint",
    data: {
      user: req.user,
      info: "Only authenticated users can access this endpoint",
    },
  });
});

/**
 * @route   GET /api/example/admin-only
 * @desc    Admin only route - requires admin role
 * @access  Private (Admin only)
 */
router.get("/admin-only", authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    message: "This is an admin-only endpoint",
    data: {
      user: req.user,
      info: "Only admin users can access this endpoint",
    },
  });
});

export default router;
