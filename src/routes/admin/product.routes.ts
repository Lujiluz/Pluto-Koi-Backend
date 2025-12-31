import { Router } from "express";
import { productController } from "../../controllers/product.controller.js";
import { uploadProductMedia, handleMulterError } from "../../middleware/uploadMiddleware.js";
import { validateCreateProduct, validateUpdateProduct, validateProductId, validatePriceRange, validateProductQuery, validateFeaturedProductsQuery } from "../../validations/product.validation.js";

const router = Router();

/**
 * Admin Product Routes
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

/**
 * @route   GET /api/admin/product
 * @desc    Get all products with pagination and filtering
 * @access  Private (Admin only)
 */
router.get("/", validateProductQuery, productController.getAllProducts.bind(productController));

/**
 * @route   GET /api/admin/product/featured
 * @desc    Get featured/active products
 * @access  Private (Admin only)
 */
router.get("/featured", validateFeaturedProductsQuery, productController.getFeaturedProducts.bind(productController));

/**
 * @route   GET /api/admin/product/price-range
 * @desc    Get products by price range
 * @access  Private (Admin only)
 */
router.get("/price-range", validatePriceRange, productController.getProductsByPriceRange.bind(productController));

/**
 * @route   POST /api/admin/product
 * @desc    Create a new product with media upload
 * @access  Private (Admin only)
 */
router.post("/", uploadProductMedia, handleMulterError, validateCreateProduct, productController.createProduct.bind(productController));

/**
 * @route   GET /api/admin/product/:id
 * @desc    Get product by ID
 * @access  Private (Admin only)
 */
router.get("/:id", validateProductId, productController.getProductById.bind(productController));

/**
 * @route   PUT /api/admin/product/:id
 * @desc    Update product by ID with media upload
 * @access  Private (Admin only)
 */
router.put("/:id", uploadProductMedia, handleMulterError, validateProductId, validateUpdateProduct, productController.updateProduct.bind(productController));

/**
 * @route   PATCH /api/admin/product/:id/status
 * @desc    Toggle product active status
 * @access  Private (Admin only)
 */
router.patch("/:id/status", validateProductId, productController.toggleProductStatus.bind(productController));

/**
 * @route   DELETE /api/admin/product/:id
 * @desc    Delete product by ID (soft delete)
 * @access  Private (Admin only)
 */
router.delete("/:id", validateProductId, productController.deleteProduct.bind(productController));

/**
 * @route   DELETE /api/admin/product/:id/permanent
 * @desc    Permanently delete product by ID
 * @access  Private (Admin only)
 */
router.delete("/:id/permanent", validateProductId, productController.permanentlyDeleteProduct.bind(productController));

export default router;
