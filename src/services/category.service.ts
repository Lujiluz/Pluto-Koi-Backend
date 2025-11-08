import { GeneralResponse } from "../interfaces/global.interface.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { ICategory } from "../models/category.model.js";
import { categoryRepository, CreateCategoryData, UpdateCategoryData } from "../repository/category.repository.js";

export interface CreateCategoryServiceData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryServiceData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(categoryData: CreateCategoryServiceData): Promise<GeneralResponse<ICategory>> {
    try {
      // Validate required fields
      if (!categoryData.name || categoryData.name.trim().length === 0) {
        throw new CustomErrorHandler(400, "Category name is required");
      }

      // Check if category name already exists
      const existingCategory = await categoryRepository.existsByName(categoryData.name.trim());
      if (existingCategory) {
        throw new CustomErrorHandler(409, "Category with this name already exists");
      }

      // Prepare category data for database
      const categoryToCreate: CreateCategoryData = {
        name: categoryData.name.trim(),
        description: categoryData.description?.trim(),
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
      };

      // Create category in database
      const createdCategory = await categoryRepository.create(categoryToCreate);

      return {
        status: "success",
        message: "Category created successfully",
        data: createdCategory,
      };
    } catch (error) {
      console.error("Error creating category:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to create category");
    }
  }

  /**
   * Get all categories with pagination and filtering
   */
  async getAllCategories(page: number = 1, limit: number = 10, isActive?: boolean, search?: string): Promise<GeneralResponse<{ categories: ICategory[]; metadata: any; statistics: any }>> {
    try {
      const filters: { isActive?: boolean; search?: string } = {};

      if (isActive !== undefined) {
        filters.isActive = isActive;
      }

      if (search) {
        filters.search = search.trim();
      }

      const { categories, metadata } = await categoryRepository.findAll(page, limit, filters);
      const statistics = await categoryRepository.getCategoryStats();

      return {
        status: "success",
        message: "Categories retrieved successfully",
        data: { categories, metadata, statistics },
      };
    } catch (error) {
      console.error("Error retrieving categories:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve categories");
    }
  }

  /**
   * Get all active categories (for dropdown/select purposes)
   */
  async getActiveCategories(): Promise<GeneralResponse<ICategory[]>> {
    try {
      const categories = await categoryRepository.findAllActive();

      return {
        status: "success",
        message: "Active categories retrieved successfully",
        data: categories,
      };
    } catch (error) {
      console.error("Error retrieving active categories:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve active categories");
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string): Promise<GeneralResponse<ICategory | null>> {
    try {
      const category = await categoryRepository.findById(categoryId);

      if (!category) {
        throw new CustomErrorHandler(404, "Category not found");
      }

      return {
        status: "success",
        message: "Category retrieved successfully",
        data: category,
      };
    } catch (error) {
      console.error("Error retrieving category:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to retrieve category");
    }
  }

  /**
   * Update category by ID
   */
  async updateCategory(categoryId: string, updateData: UpdateCategoryServiceData): Promise<GeneralResponse<ICategory | null>> {
    try {
      // Check if category exists
      const existingCategory = await categoryRepository.findById(categoryId);
      if (!existingCategory) {
        throw new CustomErrorHandler(404, "Category not found");
      }

      // Validate category name uniqueness if being updated
      if (updateData.name) {
        const nameExists = await categoryRepository.existsByName(updateData.name.trim(), categoryId);
        if (nameExists) {
          throw new CustomErrorHandler(409, "Category with this name already exists");
        }
      }

      // Prepare update data
      const updatePayload: UpdateCategoryData = {};

      if (updateData.name !== undefined) {
        updatePayload.name = updateData.name.trim();
      }

      if (updateData.description !== undefined) {
        updatePayload.description = updateData.description?.trim();
      }

      if (updateData.isActive !== undefined) {
        updatePayload.isActive = updateData.isActive;
      }

      // Remove undefined values
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key as keyof UpdateCategoryData] === undefined) {
          delete updatePayload[key as keyof UpdateCategoryData];
        }
      });

      // Update category
      const updatedCategory = await categoryRepository.updateById(categoryId, updatePayload);

      return {
        status: "success",
        message: "Category updated successfully",
        data: updatedCategory,
      };
    } catch (error) {
      console.error("Error updating category:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to update category");
    }
  }

  /**
   * Delete category by ID (soft delete)
   */
  async deleteCategory(categoryId: string): Promise<GeneralResponse<null>> {
    try {
      const success = await categoryRepository.deleteById(categoryId);

      if (!success) {
        throw new CustomErrorHandler(404, "Category not found");
      }

      return {
        status: "success",
        message: "Category deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error deleting category:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to delete category");
    }
  }

  /**
   * Permanently delete category by ID
   */
  async permanentlyDeleteCategory(categoryId: string): Promise<GeneralResponse<null>> {
    try {
      const success = await categoryRepository.hardDeleteById(categoryId);

      if (!success) {
        throw new CustomErrorHandler(404, "Category not found");
      }

      return {
        status: "success",
        message: "Category permanently deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error permanently deleting category:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to permanently delete category");
    }
  }

  /**
   * Toggle category active status
   */
  async toggleCategoryStatus(categoryId: string): Promise<GeneralResponse<ICategory | null>> {
    try {
      const category = await categoryRepository.findById(categoryId);
      if (!category) {
        throw new CustomErrorHandler(404, "Category not found");
      }

      const updatedCategory = await categoryRepository.updateById(categoryId, {
        isActive: !category.isActive,
      });

      return {
        status: "success",
        message: `Category ${updatedCategory?.isActive ? "activated" : "deactivated"} successfully`,
        data: updatedCategory,
      };
    } catch (error) {
      console.error("Error toggling category status:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to toggle category status");
    }
  }
}

export const categoryService = new CategoryService();
