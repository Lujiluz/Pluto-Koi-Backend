import { Router } from "express";
import { userController } from "../../controllers/user.controller.js";
import { validateGetAllUsersQuery, validateUserIdParam, validateRejectUser, validateCreateAdmin, validateGetAllAdminsQuery } from "../../validations/user.validation.js";

const router = Router();

/**
 * Admin User Management Routes
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

// ========== End User Management ==========

/**
 * @route   GET /api/admin/user
 * @desc    Get all users (paginated, with filtering and search)
 * @access  Private (Admin only)
 */
router.get("/", validateGetAllUsersQuery, userController.getAllUsers.bind(userController));

/**
 * @route   GET /api/admin/user/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get("/:id", validateUserIdParam, userController.getUserById.bind(userController));

/**
 * @route   PATCH /api/admin/user/:id/approve
 * @desc    Approve a pending user registration
 * @access  Private (Admin only)
 */
router.patch("/:id/approve", validateUserIdParam, userController.approveUser.bind(userController));

/**
 * @route   PATCH /api/admin/user/:id/reject
 * @desc    Reject a pending user registration
 * @access  Private (Admin only)
 */
router.patch("/:id/reject", validateUserIdParam, validateRejectUser, userController.rejectUser.bind(userController));

/**
 * @route   PATCH /api/admin/user/:id/block
 * @desc    Block a user
 * @access  Private (Admin only)
 */
router.patch("/:id/block", validateUserIdParam, userController.blockUser.bind(userController));

/**
 * @route   PATCH /api/admin/user/:id/unblock
 * @desc    Unblock a user
 * @access  Private (Admin only)
 */
router.patch("/:id/unblock", validateUserIdParam, userController.unblockUser.bind(userController));

/**
 * @route   DELETE /api/admin/user/:id
 * @desc    Delete user by ID (soft delete)
 * @access  Private (Admin only)
 */
router.delete("/:id", validateUserIdParam, userController.deleteUserById.bind(userController));

export default router;
