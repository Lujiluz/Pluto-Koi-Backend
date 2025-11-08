import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";
import { validateCreateCategory, validateUpdateCategory, validateCategoryId, validateCategoryQuery } from "../validations/category.validation.js";

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories with pagination and filtering
 * @access  Public
 * @query   page, limit, isActive, search
 */
router.get("/", validateCategoryQuery, categoryController.getAllCategories.bind(categoryController));

/**
 * @route   GET /api/categories/active
 * @desc    Get all active categories (for dropdown/select purposes)
 * @access  Public
 */
router.get("/active", categoryController.getActiveCategories.bind(categoryController));

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (Admin only)
 */
router.post("/", authenticateToken, requireAdmin, validateCreateCategory, categoryController.createCategory.bind(categoryController));

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get("/:id", validateCategoryId, categoryController.getCategoryById.bind(categoryController));

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category by ID
 * @access  Private (Admin only)
 */
router.put("/:id", authenticateToken, requireAdmin, validateCategoryId, validateUpdateCategory, categoryController.updateCategory.bind(categoryController));

/**
 * @route   PATCH /api/categories/:id/status
 * @desc    Toggle category active status
 * @access  Private (Admin only)
 */
router.patch("/:id/status", authenticateToken, requireAdmin, validateCategoryId, categoryController.toggleCategoryStatus.bind(categoryController));

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category by ID (soft delete)
 * @access  Private (Admin only)
 */
router.delete("/:id", authenticateToken, requireAdmin, validateCategoryId, categoryController.deleteCategory.bind(categoryController));

/**
 * @route   DELETE /api/categories/:id/permanent
 * @desc    Permanently delete category by ID (admin only)
 * @access  Private (Admin only)
 */
router.delete("/:id/permanent", authenticateToken, requireAdmin, validateCategoryId, categoryController.permanentlyDeleteCategory.bind(categoryController));

export default router;
