import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { CategoryModel, ICategory } from "../models/category.model.js";
import { paginationMetadata } from "../utils/pagination.js";

export interface CreateCategoryData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class CategoryRepository {
  /**
   * Create a new category
   */
  async create(categoryData: CreateCategoryData): Promise<ICategory> {
    try {
      const category = new CategoryModel(categoryData);
      return await category.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new CustomErrorHandler(409, "Category with this name already exists");
      }
      throw new CustomErrorHandler(500, "Failed to create category");
    }
  }

  /**
   * Find category by ID
   */
  async findById(id: string): Promise<ICategory | null> {
    try {
      return await CategoryModel.findById(id);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find category by ID");
    }
  }

  /**
   * Update category by ID
   */
  async updateById(id: string, updateData: UpdateCategoryData): Promise<ICategory | null> {
    try {
      return await CategoryModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        throw new CustomErrorHandler(409, "Category with this name already exists");
      }
      throw new CustomErrorHandler(500, "Failed to update category");
    }
  }

  /**
   * Delete category by ID (soft delete)
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await CategoryModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
      return result !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to delete category");
    }
  }

  /**
   * Hard delete category by ID
   */
  async hardDeleteById(id: string): Promise<boolean> {
    try {
      const result = await CategoryModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to permanently delete category");
    }
  }

  /**
   * Get all categories with pagination and filtering
   */
  async findAll(page: number = 1, limit: number = 10, filters: { isActive?: boolean; search?: string } = {}): Promise<{ categories: ICategory[]; metadata: any }> {
    try {
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};

      // Filter by active status
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      // Search by category name
      if (filters.search) {
        query["$text"] = { $search: filters.search };
      }

      const total = await CategoryModel.countDocuments(query);
      const categories = await CategoryModel.find(query).skip(skip).limit(limit).sort({ name: 1 }).exec();

      const metadata = paginationMetadata(page, limit, total);

      return { categories, metadata };
    } catch (error) {
      console.log("[CATEGORY_REPOSITORY]", error);
      throw new CustomErrorHandler(500, "Failed to fetch categories");
    }
  }

  /**
   * Get all active categories (for dropdown/select purposes)
   */
  async findAllActive(): Promise<ICategory[]> {
    try {
      return await CategoryModel.find({ isActive: true }).sort({ name: 1 });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to fetch active categories");
    }
  }

  /**
   * Check if category exists by name
   */
  async existsByName(categoryName: string, excludeId?: string): Promise<boolean> {
    try {
      const query: any = {
        name: { $regex: new RegExp(`^${categoryName}$`, "i") },
      };

      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const category = await CategoryModel.findOne(query);
      return category !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to check category existence");
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<{
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
  }> {
    try {
      const stats = await CategoryModel.aggregate([
        {
          $group: {
            _id: null,
            totalCategories: { $sum: 1 },
            activeCategories: {
              $sum: { $cond: ["$isActive", 1, 0] },
            },
            inactiveCategories: {
              $sum: { $cond: ["$isActive", 0, 1] },
            },
          },
        },
      ]);

      const categoryStats = stats[0] || {
        totalCategories: 0,
        activeCategories: 0,
        inactiveCategories: 0,
      };

      return categoryStats;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get category statistics");
    }
  }
}

export const categoryRepository = new CategoryRepository();
