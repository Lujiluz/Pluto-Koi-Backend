import { Router } from "express";
import { productController } from "#controllers/product.controller.js";
import { authenticateToken, requireAdmin } from "#middleware/auth.middleware.js";
import { uploadProductMedia, handleMulterError } from "#middleware/uploadMiddleware.js";
import { validateCreateProduct, validateUpdateProduct, validateProductId, validatePriceRange, validateProductQuery, validateFeaturedProductsQuery } from "#validations/product.validation.js";

const router = Router();

// All routes require authentication
// router.use(authenticateToken);

/**
 * @route   GET /api/product
 * @desc    Get all products with pagination and filtering
 * @access  Private
 * @query   page, limit, isActive, search
 */
router.get("/", validateProductQuery, productController.getAllProducts.bind(productController));

/**
 * @route   GET /api/product/featured
 * @desc    Get featured/active products
 * @access  Private
 * @query   limit
 */
router.get("/featured", validateFeaturedProductsQuery, productController.getFeaturedProducts.bind(productController));

/**
 * @route   GET /api/product/price-range
 * @desc    Get products by price range
 * @access  Private
 * @query   minPrice, maxPrice
 */
router.get("/price-range", validatePriceRange, productController.getProductsByPriceRange.bind(productController));

/**
 * @route   POST /api/product
 * @desc    Create a new product with media upload
 * @access  Private
 */
router.post(
  "/",
  uploadProductMedia, // Handle multipart/form-data and file uploads
  handleMulterError, // Handle multer-specific errors
  validateCreateProduct, // Validate form data
  productController.createProduct.bind(productController)
);

/**
 * @route   GET /api/product/:id
 * @desc    Get product by ID
 * @access  Private
 */
router.get("/:id", validateProductId, productController.getProductById.bind(productController));

/**
 * @route   PUT /api/product/:id
 * @desc    Update product by ID with media upload
 * @access  Private
 */
router.put(
  "/:id",
  uploadProductMedia, // Handle multipart/form-data and file uploads
  handleMulterError, // Handle multer-specific errors
  validateProductId, // Validate product ID
  validateUpdateProduct, // Validate form data
  productController.updateProduct.bind(productController)
);

/**
 * @route   PATCH /api/product/:id/status
 * @desc    Toggle product active status
 * @access  Private
 */
router.patch("/:id/status", validateProductId, productController.toggleProductStatus.bind(productController));

/**
 * @route   DELETE /api/product/:id
 * @desc    Delete product by ID (soft delete)
 * @access  Private
 */
router.delete("/:id", validateProductId, productController.deleteProduct.bind(productController));

/**
 * @route   DELETE /api/product/:id/permanent
 * @desc    Permanently delete product by ID (admin only)
 * @access  Private (Admin only)
 */
router.delete("/:id/permanent", authenticateToken, validateProductId, requireAdmin, productController.permanentlyDeleteProduct.bind(productController));

export default router;
