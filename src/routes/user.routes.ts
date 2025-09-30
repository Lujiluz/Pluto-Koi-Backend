import { userController } from "#controllers/user.controller.js";
import { authenticateToken } from "#middleware/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.use(authenticateToken);

/**
 * @route   GET /api/user
 * @desc    Get all users (paginated)
 * @access  Private (Admin only)
 */
router.get("", userController.getAllUsers.bind(userController));

export default router;
