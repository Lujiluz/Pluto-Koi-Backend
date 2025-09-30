import { userController } from "#controllers/user.controller.js";
import { adminRouteAuthentication, authenticateToken } from "#middleware/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.use([authenticateToken, adminRouteAuthentication]);

/**
 * @route   GET /api/user
 * @desc    Get all users (paginated)
 * @access  Private (Admin only)
 */
router.get("", userController.getAllUsers.bind(userController));

/**
 * @route   DELETE /api/user/:id
 * @desc    Delete user by ID (soft delete)
 * @access  Private (Admin only)
 */
router.delete("/:id", userController.deleteUserById.bind(userController));

export default router;
