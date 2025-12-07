import { GeneralResponse } from "../interfaces/global.interface.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { IProduct } from "../models/product.model.js";
import { productRepository, CreateProductData, UpdateProductData } from "../repository/product.repository.js";
import { processUploadedFiles, UploadedFile, validateFiles, deleteFile } from "../utils/fileUpload.js";
import { ProductType } from "../utils/constants.js";
import { categoryRepository } from "../repository/category.repository.js";

export interface CreateProductServiceData {
  productName: string;
  productPrice: number;
  productType: ProductType;
  productCategory: string;
  stock: number;
  isActive?: boolean;
  media?: UploadedFile[];
}

export interface UpdateProductServiceData {
  productName?: string;
  productPrice?: number;
  productType?: ProductType;
  productCategory?: string;
  stock?: number;
  isActive?: boolean;
  media?: UploadedFile[];
  keepExistingMedia?: boolean;
}

export class ProductService {
  /**
   * Create a new product with media upload support
   */
  async createProduct(productData: CreateProductServiceData): Promise<GeneralResponse<IProduct>> {
    try {
      const { media, ...productFields } = productData;

      // Validate required fields
      if (!productFields.productName || !productFields.productPrice || !productFields.productType || !productFields.productCategory || productFields.stock === undefined) {
        throw new CustomErrorHandler(400, "Missing required fields: productName, productPrice, productType, productCategory, stock");
      }

      // Check if product name already exists
      const existingProduct = await productRepository.existsByName(productFields.productName);
      if (existingProduct) {
        throw new CustomErrorHandler(409, "Product with this name already exists");
      }

      // Validate category exists
      const categoryExists = await categoryRepository.findById(productFields.productCategory);
      if (!categoryExists) {
        throw new CustomErrorHandler(400, "Invalid product category");
      }

      // Validate product type
      if (!Object.values(ProductType).includes(productFields.productType)) {
        throw new CustomErrorHandler(400, "Invalid product type");
      }

      // Validate price
      if (productFields.productPrice <= 0) {
        throw new CustomErrorHandler(400, "Product price must be greater than 0");
      }

      // Validate stock
      if (productFields.stock < 0) {
        throw new CustomErrorHandler(400, "Stock cannot be negative");
      }

      // Validate and process media files if provided
      let processedMedia: any[] = [];
      if (media && media.length > 0) {
        // Validate files
        const validation = validateFiles(media, 10);
        if (!validation.isValid) {
          throw new CustomErrorHandler(400, `File validation failed: ${validation.errors.join(", ")}`);
        }

        try {
          // Process and save files
          processedMedia = await processUploadedFiles(media, "products");
        } catch (error) {
          console.error("Error processing media files:", error);
          throw new CustomErrorHandler(500, "Failed to process media files");
        }
      }

      // Prepare product data for database
      const productToCreate: CreateProductData = {
        productName: productFields.productName.trim(),
        productPrice: Number(productFields.productPrice),
        productType: productFields.productType,
        productCategory: productFields.productCategory,
        stock: Number(productFields.stock),
        isActive: productFields.isActive !== undefined ? productFields.isActive : true,
        media: processedMedia.map((file) => ({ fileUrl: file.fileUrl })),
      };

      // Create product in database
      const createdProduct = await productRepository.create(productToCreate);

      return {
        status: "success",
        message: "Product created successfully",
        data: createdProduct,
      };
    } catch (error) {
      console.error("Error creating product:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to create product");
    }
  }

  /**
   * Get all products with pagination and filtering
   */
  async getAllProducts(page: number = 1, limit: number = 10, isActive?: boolean, search?: string, category?: string, type?: ProductType): Promise<GeneralResponse<{ products: IProduct[]; metadata: any; statistics: any }>> {
    try {
      const filters: { isActive?: boolean; search?: string; category?: string; type?: ProductType } = {};

      if (isActive !== undefined) {
        filters.isActive = isActive;
      }

      if (search) {
        filters.search = search.trim();
      }

      if (category) {
        filters.category = category;
      }

      if (type) {
        filters.type = type;
      }

      const { products, metadata } = await productRepository.findAll(page, limit, filters);
      const statistics = await productRepository.getProductStats();

      return {
        status: "success",
        message: "Products retrieved successfully",
        data: { products, metadata, statistics },
      };
    } catch (error) {
      console.error("Error retrieving products:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve products");
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<GeneralResponse<IProduct | null>> {
    try {
      const product = await productRepository.findById(productId);

      if (!product) {
        throw new CustomErrorHandler(404, "Product not found");
      }

      return {
        status: "success",
        message: "Product retrieved successfully",
        data: product,
      };
    } catch (error) {
      console.error("Error retrieving product:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to retrieve product");
    }
  }

  /**
   * Update product by ID with media upload support
   */
  async updateProduct(productId: string, updateData: UpdateProductServiceData): Promise<GeneralResponse<IProduct | null>> {
    try {
      // Check if product exists
      const existingProduct = await productRepository.findById(productId);
      if (!existingProduct) {
        throw new CustomErrorHandler(404, "Product not found");
      }

      const { media, keepExistingMedia = false, ...productFields } = updateData;

      // Validate product name uniqueness if being updated
      if (productFields.productName) {
        const nameExists = await productRepository.existsByName(productFields.productName, productId);
        if (nameExists) {
          throw new CustomErrorHandler(409, "Product with this name already exists");
        }
      }

      // Validate category if being updated
      if (productFields.productCategory) {
        const categoryExists = await categoryRepository.findById(productFields.productCategory);
        if (!categoryExists) {
          throw new CustomErrorHandler(400, "Invalid product category");
        }
      }

      // Validate product type if being updated
      if (productFields.productType && !Object.values(ProductType).includes(productFields.productType)) {
        throw new CustomErrorHandler(400, "Invalid product type");
      }

      // Validate price if being updated
      if (productFields.productPrice !== undefined && productFields.productPrice <= 0) {
        throw new CustomErrorHandler(400, "Product price must be greater than 0");
      }

      // Validate stock if being updated
      if (productFields.stock !== undefined && productFields.stock < 0) {
        throw new CustomErrorHandler(400, "Stock cannot be negative");
      }

      // Handle media update
      let finalMedia = existingProduct.media;

      if (media && media.length > 0) {
        // Validate files
        const validation = validateFiles(media, 10);
        if (!validation.isValid) {
          throw new CustomErrorHandler(400, `File validation failed: ${validation.errors.join(", ")}`);
        }

        try {
          // Process new files
          const processedMedia = await processUploadedFiles(media, "products");

          if (keepExistingMedia) {
            // Append new media to existing
            finalMedia = [...existingProduct.media, ...processedMedia.map((file) => ({ fileUrl: file.fileUrl }))];
          } else {
            // Replace all media with new files
            // Note: In production, you might want to delete old files
            finalMedia = processedMedia.map((file) => ({ fileUrl: file.fileUrl }));
          }
        } catch (error) {
          console.error("Error processing media files:", error);
          throw new CustomErrorHandler(500, "Failed to process media files");
        }
      }

      // Prepare update data
      const updatePayload: UpdateProductData = {
        ...productFields,
        media: finalMedia,
      };

      // Remove undefined values
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key as keyof UpdateProductData] === undefined) {
          delete updatePayload[key as keyof UpdateProductData];
        }
      });

      // Update product
      const updatedProduct = await productRepository.updateById(productId, updatePayload);

      return {
        status: "success",
        message: "Product updated successfully",
        data: updatedProduct,
      };
    } catch (error) {
      console.error("Error updating product:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to update product");
    }
  }

  /**
   * Delete product by ID (soft delete)
   */
  async deleteProduct(productId: string): Promise<GeneralResponse<null>> {
    try {
      const success = await productRepository.deleteById(productId);

      if (!success) {
        throw new CustomErrorHandler(404, "Product not found");
      }

      return {
        status: "success",
        message: "Product deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error deleting product:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to delete product");
    }
  }

  /**
   * Permanently delete product by ID
   */
  async permanentlyDeleteProduct(productId: string): Promise<GeneralResponse<null>> {
    try {
      // Get product first to handle file cleanup
      const product = await productRepository.findById(productId);
      if (!product) {
        throw new CustomErrorHandler(404, "Product not found");
      }

      // Delete associated files (optional - implement based on your needs)
      // product.media.forEach(media => {
      //   const filePath = media.fileUrl.replace(process.env.BASE_URL || '', 'public');
      //   deleteFile(filePath);
      // });

      const success = await productRepository.hardDeleteById(productId);

      if (!success) {
        throw new CustomErrorHandler(404, "Product not found");
      }

      return {
        status: "success",
        message: "Product permanently deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error permanently deleting product:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to permanently delete product");
    }
  }

  /**
   * Get products by price range
   */
  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<GeneralResponse<IProduct[]>> {
    try {
      if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
        throw new CustomErrorHandler(400, "Invalid price range");
      }

      const products = await productRepository.findByPriceRange(minPrice, maxPrice);

      return {
        status: "success",
        message: "Products retrieved successfully",
        data: products,
      };
    } catch (error) {
      console.error("Error getting products by price range:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to get products by price range");
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 10): Promise<GeneralResponse<IProduct[]>> {
    try {
      const products = await productRepository.getFeaturedProducts(limit);

      return {
        status: "success",
        message: "Featured products retrieved successfully",
        data: products,
      };
    } catch (error) {
      console.error("Error getting featured products:", error);
      throw new CustomErrorHandler(500, "Failed to get featured products");
    }
  }

  /**
   * Toggle product active status
   */
  async toggleProductStatus(productId: string): Promise<GeneralResponse<IProduct | null>> {
    try {
      const product = await productRepository.findById(productId);
      if (!product) {
        throw new CustomErrorHandler(404, "Product not found");
      }

      const updatedProduct = await productRepository.updateById(productId, {
        isActive: !product.isActive,
      });

      return {
        status: "success",
        message: `Product ${updatedProduct?.isActive ? "activated" : "deactivated"} successfully`,
        data: updatedProduct,
      };
    } catch (error) {
      console.error("Error toggling product status:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to toggle product status");
    }
  }
}

export const productService = new ProductService();
