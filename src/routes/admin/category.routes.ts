import { Router } from "express";
import { categoryController } from "../../controllers/category.controller.js";
import { validateCreateCategory, validateUpdateCategory, validateCategoryId, validateCategoryQuery } from "../../validations/category.validation.js";

const router = Router();

/**
 * Admin Category Routes
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories with pagination and filtering
 * @access  Private (Admin only)
 */
router.get("/", validateCategoryQuery, categoryController.getAllCategories.bind(categoryController));

/**
 * @route   GET /api/admin/categories/active
 * @desc    Get all active categories
 * @access  Private (Admin only)
 */
router.get("/active", categoryController.getActiveCategories.bind(categoryController));

/**
 * @route   POST /api/admin/categories
 * @desc    Create a new category
 * @access  Private (Admin only)
 */
router.post("/", validateCreateCategory, categoryController.createCategory.bind(categoryController));

/**
 * @route   GET /api/admin/categories/:id
 * @desc    Get category by ID
 * @access  Private (Admin only)
 */
router.get("/:id", validateCategoryId, categoryController.getCategoryById.bind(categoryController));

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update category by ID
 * @access  Private (Admin only)
 */
router.put("/:id", validateCategoryId, validateUpdateCategory, categoryController.updateCategory.bind(categoryController));

/**
 * @route   PATCH /api/admin/categories/:id/status
 * @desc    Toggle category active status
 * @access  Private (Admin only)
 */
router.patch("/:id/status", validateCategoryId, categoryController.toggleCategoryStatus.bind(categoryController));

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete category by ID (soft delete)
 * @access  Private (Admin only)
 */
router.delete("/:id", validateCategoryId, categoryController.deleteCategory.bind(categoryController));

/**
 * @route   DELETE /api/admin/categories/:id/permanent
 * @desc    Permanently delete category by ID
 * @access  Private (Admin only)
 */
router.delete("/:id/permanent", validateCategoryId, categoryController.permanentlyDeleteCategory.bind(categoryController));

export default router;
