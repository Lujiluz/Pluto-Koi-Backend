import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authLoggingMiddleware } from "../middleware/logging.middleware.js";
import { validateRegister, validateLogin } from "../validations/auth.validation.js";

const router = Router();

// Apply auth logging middleware to all routes
router.use(authLoggingMiddleware);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateRegister, authController.register.bind(authController));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validateLogin, authController.login.bind(authController));

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
 * @desc    Logout user (client-side token deletion)
 * @access  Private
 */
router.post("/logout", authenticateToken, authController.logout.bind(authController));

export default router;
