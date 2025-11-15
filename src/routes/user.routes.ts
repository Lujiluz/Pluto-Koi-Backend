import { userController } from "../controllers/user.controller.js";
import { adminRouteAuthentication, authenticateToken } from "../middleware/auth.middleware.js";
import { validateGetAllUsersQuery, validateUserIdParam } from "../validations/user.validation.js";
import { Router } from "express";

const router = Router();

router.use([authenticateToken, adminRouteAuthentication]);

/**
 * @route   GET /api/user
 * @desc    Get all users (paginated, with filtering and search)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   status - Filter by status (active, inactive, banned)
 * @query   search - Search by name, email, or phone number
 * @access  Private (Admin only)
 */
router.get("", validateGetAllUsersQuery, userController.getAllUsers.bind(userController));

/**
 * @route   GET /api/user/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get("/:id", validateUserIdParam, userController.getUserById.bind(userController));

/**
 * @route   PATCH /api/user/:id/block
 * @desc    Block a user (set status to banned)
 * @access  Private (Admin only)
 */
router.patch("/:id/block", validateUserIdParam, userController.blockUser.bind(userController));

/**
 * @route   PATCH /api/user/:id/unblock
 * @desc    Unblock a user (set status to active)
 * @access  Private (Admin only)
 */
router.patch("/:id/unblock", validateUserIdParam, userController.unblockUser.bind(userController));

/**
 * @route   DELETE /api/user/:id
 * @desc    Delete user by ID (soft delete)
 * @access  Private (Admin only)
 */
router.delete("/:id", validateUserIdParam, userController.deleteUserById.bind(userController));

export default router;
