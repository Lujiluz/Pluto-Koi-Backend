import { Router } from "express";
import { userController } from "../../controllers/user.controller.js";
import { validateUserIdParam, validateCreateAdmin, validateGetAllAdminsQuery } from "../../validations/user.validation.js";

const router = Router();

/**
 * Admin Management Routes (manage other admins)
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

/**
 * @route   GET /api/admin/admins
 * @desc    Get all admin users (paginated, with search)
 * @access  Private (Admin only)
 */
router.get("/", validateGetAllAdminsQuery, userController.getAllAdmins.bind(userController));

/**
 * @route   POST /api/admin/admins
 * @desc    Create a new admin user
 * @access  Private (Admin only)
 */
router.post("/", validateCreateAdmin, userController.createAdmin.bind(userController));

/**
 * @route   GET /api/admin/admins/:id
 * @desc    Get admin user by ID
 * @access  Private (Admin only)
 */
router.get("/:id", validateUserIdParam, userController.getAdminById.bind(userController));

/**
 * @route   DELETE /api/admin/admins/:id
 * @desc    Delete admin user by ID (soft delete)
 * @access  Private (Admin only)
 */
router.delete("/:id", validateUserIdParam, userController.deleteAdmin.bind(userController));

/**
 * @route   PATCH /api/admin/admins/:id/block
 * @desc    Block an admin user
 * @access  Private (Admin only)
 */
router.patch("/:id/block", validateUserIdParam, userController.blockAdmin.bind(userController));

/**
 * @route   PATCH /api/admin/admins/:id/unblock
 * @desc    Unblock an admin user
 * @access  Private (Admin only)
 */
router.patch("/:id/unblock", validateUserIdParam, userController.unblockAdmin.bind(userController));

export default router;
