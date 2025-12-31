import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticateToken, authenticateAdminToken } from "../middleware/auth.middleware.js";
import { authLoggingMiddleware } from "../middleware/logging.middleware.js";
import { validateRegister, validateLogin } from "../validations/auth.validation.js";

const router = Router();

// Apply auth logging middleware to all routes
router.use(authLoggingMiddleware);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (status will be pending for end users)
 * @access  Public
 */
router.post("/register", validateRegister, authController.register.bind(authController));

/**
 * @route   POST /api/auth/login
 * @desc    Login user (only approved end users can login)
 * @access  Public
 */
router.post("/login", validateLogin, authController.login.bind(authController));

/**
 * @route   POST /api/auth/admin/login
 * @desc    Login admin (only admin users can login)
 * @access  Public
 */
router.post("/admin/login", validateLogin, authController.loginAdmin.bind(authController));

/**
 * @route   GET /api/auth/verify-approval/:token
 * @desc    Verify approval token from email link (webhook endpoint)
 * @access  Public
 */
router.get("/verify-approval/:token", authController.verifyApproval.bind(authController));

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticateToken, authController.getProfile.bind(authController));

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get("/verify", authenticateToken, authController.verifyToken.bind(authController));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate session in database)
 * @access  Private
 */
router.post("/logout", authenticateToken, authController.logout.bind(authController));

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all sessions for current user
 * @access  Private
 */
router.post("/logout-all", authenticateToken, authController.logoutAll.bind(authController));

/**
 * @route   POST /api/auth/admin/logout
 * @desc    Logout admin (invalidate session in database)
 * @access  Private (Admin only)
 */
router.post("/admin/logout", authenticateAdminToken, authController.logoutAdmin.bind(authController));

/**
 * @route   POST /api/auth/admin/logout-all
 * @desc    Logout from all sessions for current admin
 * @access  Private (Admin only)
 */
router.post("/admin/logout-all", authenticateAdminToken, authController.logoutAllAdmin.bind(authController));

export default router;
