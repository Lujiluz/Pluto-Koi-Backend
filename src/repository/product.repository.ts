import { CustomErrorHandler } from "#middleware/errorHandler.js";
import { ProductModel, IProduct } from "#models/product.model.js";
import { paginationMetadata } from "#utils/pagination.js";

export interface CreateProductData {
  productName: string;
  productPrice: number;
  isActive?: boolean;
  media?: { fileUrl: string }[];
}

export interface UpdateProductData {
  productName?: string;
  productPrice?: number;
  isActive?: boolean;
  media?: { fileUrl: string }[];
}

export class ProductRepository {
  /**
   * Create a new product
   */
  async create(productData: CreateProductData): Promise<IProduct> {
    try {
      const product = new ProductModel(productData);
      return await product.save();
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to create product");
    }
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<IProduct | null> {
    try {
      return await ProductModel.findById(id);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find product by ID");
    }
  }

  /**
   * Update product by ID
   */
  async updateById(id: string, updateData: UpdateProductData): Promise<IProduct | null> {
    try {
      return await ProductModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to update product");
    }
  }

  /**
   * Delete product by ID (soft delete)
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await ProductModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
      return result !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to delete product");
    }
  }

  /**
   * Hard delete product by ID
   */
  async hardDeleteById(id: string): Promise<boolean> {
    try {
      const result = await ProductModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to permanently delete product");
    }
  }

  /**
   * Get all products with pagination and filtering
   */
  async findAll(page: number = 1, limit: number = 10, filters: { isActive?: boolean; search?: string } = {}): Promise<{ products: IProduct[]; metadata: any }> {
    try {
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};

      // Filter by active status
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      // Search by product name
      if (filters.search) {
        query.productName = { $regex: filters.search, $options: "i" };
      }

      const [products, total] = await Promise.all([ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit), ProductModel.countDocuments(query)]);

      const metadata = paginationMetadata(page, limit, total);

      return { products, metadata };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to fetch products");
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
  }> {
    try {
      const [stats, priceStats] = await Promise.all([
        ProductModel.aggregate([
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              activeProducts: {
                $sum: { $cond: ["$isActive", 1, 0] },
              },
              inactiveProducts: {
                $sum: { $cond: ["$isActive", 0, 1] },
              },
            },
          },
        ]),
        ProductModel.aggregate([
          {
            $group: {
              _id: null,
              avgPrice: { $avg: "$productPrice" },
              minPrice: { $min: "$productPrice" },
              maxPrice: { $max: "$productPrice" },
            },
          },
        ]),
      ]);

      const productStats = stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
      };

      const priceData = priceStats[0] || {
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
      };

      return {
        totalProducts: productStats.totalProducts,
        activeProducts: productStats.activeProducts,
        inactiveProducts: productStats.inactiveProducts,
        averagePrice: Math.round(priceData.avgPrice || 0),
        priceRange: {
          min: priceData.minPrice || 0,
          max: priceData.maxPrice || 0,
        },
      };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get product statistics");
    }
  }

  /**
   * Check if product exists by name
   */
  async existsByName(productName: string, excludeId?: string): Promise<boolean> {
    try {
      const query: any = {
        productName: { $regex: new RegExp(`^${productName}$`, "i") },
      };

      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const product = await ProductModel.findOne(query);
      return product !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to check product existence");
    }
  }

  /**
   * Get products by price range
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<IProduct[]> {
    try {
      return await ProductModel.find({
        productPrice: { $gte: minPrice, $lte: maxPrice },
        isActive: true,
      }).sort({ productPrice: 1 });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find products by price range");
    }
  }

  /**
   * Get featured/active products
   */
  async getFeaturedProducts(limit: number = 10): Promise<IProduct[]> {
    try {
      return await ProductModel.find({ isActive: true }).sort({ createdAt: -1 }).limit(limit);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get featured products");
    }
  }
}

export const productRepository = new ProductRepository();
