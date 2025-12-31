import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
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
 * @access  Private
 */
router.post("/", authenticateToken, validateCreateCategory, categoryController.createCategory.bind(categoryController));

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get("/:id", validateCategoryId, categoryController.getCategoryById.bind(categoryController));

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category by ID
 * @access  Private
 */
router.put("/:id", authenticateToken, validateCategoryId, validateUpdateCategory, categoryController.updateCategory.bind(categoryController));

/**
 * @route   PATCH /api/categories/:id/status
 * @desc    Toggle category active status
 * @access  Private
 */
router.patch("/:id/status", authenticateToken, validateCategoryId, categoryController.toggleCategoryStatus.bind(categoryController));

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category by ID (soft delete)
 * @access  Private
 */
router.delete("/:id", authenticateToken, validateCategoryId, categoryController.deleteCategory.bind(categoryController));

/**
 * @route   DELETE /api/categories/:id/permanent
 * @desc    Permanently delete category by ID
 * @access  Private
 */
router.delete("/:id/permanent", authenticateToken, validateCategoryId, categoryController.permanentlyDeleteCategory.bind(categoryController));

export default router;
