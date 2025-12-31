import { userController } from "../controllers/user.controller.js";
import { authenticateAdminToken } from "../middleware/auth.middleware.js";
import { validateUserIdParam, validateCreateAdmin, validateGetAllAdminsQuery } from "../validations/user.validation.js";
import { Router } from "express";

const router = Router();

// All routes require admin authentication using admin-specific cookie
router.use(authenticateAdminToken);

/**
 * @route   GET /api/admin
 * @desc    Get all admin users (paginated, with search)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   search - Search by name or email
 * @access  Private (Admin only)
 */
router.get("", validateGetAllAdminsQuery, userController.getAllAdmins.bind(userController));

/**
 * @route   POST /api/admin
 * @desc    Create a new admin user
 * @body    name - Admin name (required)
 * @body    email - Admin email (required)
 * @body    password - Admin password (required)
 * @access  Private (Admin only)
 */
router.post("", validateCreateAdmin, userController.createAdmin.bind(userController));

/**
 * @route   GET /api/admin/:id
 * @desc    Get admin user by ID
 * @access  Private (Admin only)
 */
router.get("/:id", validateUserIdParam, userController.getAdminById.bind(userController));

/**
 * @route   DELETE /api/admin/:id
 * @desc    Delete admin user by ID (soft delete)
 * @access  Private (Admin only)
 */
router.delete("/:id", validateUserIdParam, userController.deleteAdmin.bind(userController));

/**
 * @route   PATCH /api/admin/:id/block
 * @desc    Block an admin user
 * @access  Private (Admin only)
 */
router.patch("/:id/block", validateUserIdParam, userController.blockAdmin.bind(userController));

/**
 * @route   PATCH /api/admin/:id/unblock
 * @desc    Unblock an admin user
 * @access  Private (Admin only)
 */
router.patch("/:id/unblock", validateUserIdParam, userController.unblockAdmin.bind(userController));

export default router;
