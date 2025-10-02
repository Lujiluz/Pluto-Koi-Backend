import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "#interfaces/auth.interface.js";
import { productService, CreateProductServiceData, UpdateProductServiceData } from "#services/product.service.js";
import { UploadedFile } from "#utils/fileUpload.js";

export class ProductController {
  /**
   * Create a new product with media upload support
   */
  async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract form data
      const { productName, productPrice, isActive } = req.body;

      // Validate required fields
      if (!productName || !productPrice) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: productName, productPrice",
        });
        return;
      }

      // Handle uploaded files
      let mediaFiles: UploadedFile[] = [];

      if (req.files) {
        if (Array.isArray(req.files)) {
          // If using upload.array()
          mediaFiles = req.files.map((file) => ({
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            buffer: file.buffer,
          }));
        } else if (typeof req.files === "object") {
          // If using upload.fields() - assuming 'media' field
          const mediaField = (req.files as any)["media"];
          if (mediaField && Array.isArray(mediaField)) {
            mediaFiles = mediaField.map((file) => ({
              originalname: file.originalname,
              filename: file.filename,
              path: file.path,
              size: file.size,
              mimetype: file.mimetype,
              buffer: file.buffer,
            }));
          }
        }
      }

      // Prepare product data
      const productData: CreateProductServiceData = {
        productName: productName.trim(),
        productPrice: parseFloat(productPrice),
        isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
      };

      // Create product
      const response = await productService.createProduct(productData);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating product:", error);
      next(error);
    }
  }

  /**
   * Get all products with pagination and filtering
   */
  async getAllProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      // Handle isActive filter
      let isActive: boolean | undefined = undefined;
      if (req.query.isActive !== undefined) {
        isActive = req.query.isActive === "true";
      }

      const response = await productService.getAllProducts(page, limit, isActive, search);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving products:", error);
      next(error);
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      const response = await productService.getProductById(id);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving product:", error);
      next(error);
    }
  }

  /**
   * Update product by ID with media upload support
   */
  async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { productName, productPrice, isActive, keepExistingMedia } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      // Handle uploaded files
      let mediaFiles: UploadedFile[] = [];

      if (req.files) {
        if (Array.isArray(req.files)) {
          mediaFiles = req.files.map((file) => ({
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            buffer: file.buffer,
          }));
        } else if (typeof req.files === "object") {
          const mediaField = (req.files as any)["media"];
          if (mediaField && Array.isArray(mediaField)) {
            mediaFiles = mediaField.map((file) => ({
              originalname: file.originalname,
              filename: file.filename,
              path: file.path,
              size: file.size,
              mimetype: file.mimetype,
              buffer: file.buffer,
            }));
          }
        }
      }

      // Prepare update data
      const updateData: UpdateProductServiceData = {};

      if (productName !== undefined) {
        updateData.productName = productName.trim();
      }

      if (productPrice !== undefined) {
        updateData.productPrice = parseFloat(productPrice);
      }

      if (isActive !== undefined) {
        updateData.isActive = isActive === "true" || isActive === true;
      }

      if (mediaFiles.length > 0) {
        updateData.media = mediaFiles;
        updateData.keepExistingMedia = keepExistingMedia === "true" || keepExistingMedia === true;
      }

      // Update product
      const response = await productService.updateProduct(id, updateData);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating product:", error);
      next(error);
    }
  }

  /**
   * Delete product by ID (soft delete)
   */
  async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      const response = await productService.deleteProduct(id);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error deleting product:", error);
      next(error);
    }
  }

  /**
   * Permanently delete product by ID (admin only)
   */
  async permanentlyDeleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "Admin access required for permanent deletion",
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      const response = await productService.permanentlyDeleteProduct(id);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error permanently deleting product:", error);
      next(error);
    }
  }

  /**
   * Get products by price range
   */
  async getProductsByPriceRange(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const minPrice = parseFloat(req.query.minPrice as string);
      const maxPrice = parseFloat(req.query.maxPrice as string);

      if (isNaN(minPrice) || isNaN(maxPrice)) {
        res.status(400).json({
          success: false,
          message: "Valid minPrice and maxPrice are required",
        });
        return;
      }

      const response = await productService.getProductsByPriceRange(minPrice, maxPrice);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error getting products by price range:", error);
      next(error);
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const response = await productService.getFeaturedProducts(limit);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error getting featured products:", error);
      next(error);
    }
  }

  /**
   * Toggle product active status
   */
  async toggleProductStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      const response = await productService.toggleProductStatus(id);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error toggling product status:", error);
      next(error);
    }
  }
}

export const productController = new ProductController();
