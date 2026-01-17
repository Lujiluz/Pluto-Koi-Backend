import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../interfaces/auth.interface.js";
import { categoryService, CreateCategoryServiceData, UpdateCategoryServiceData } from "../services/category.service.js";

export class CategoryController {
  /**
   * Create a new category (Admin only)
   */
  async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, isActive } = req.body;

      // Validate required fields
      if (!name) {
        res.status(400).json({
          success: false,
          message: "Missing required field: name",
        });
        return;
      }

      // Prepare category data
      const categoryData: CreateCategoryServiceData = {
        name: name.trim(),
        description: description?.trim(),
        isActive: isActive !== undefined ? isActive : true,
      };

      // Create category
      const response = await categoryService.createCategory(categoryData);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating category:", error);
      next(error);
    }
  }

  /**
   * Get all categories with pagination and filtering
   */
  async getAllCategories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      // Handle isActive filter
      let isActive: boolean | undefined = undefined;
      if (req.query.isActive !== undefined) {
        isActive = req.query.isActive === "true";
      }

      const response = await categoryService.getAllCategories(page, limit, isActive, search);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving categories:", error);
      next(error);
    }
  }

  /**
   * Get all active categories (for dropdown/select purposes)
   */
  async getActiveCategories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await categoryService.getActiveCategories();
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving active categories:", error);
      next(error);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Category ID is required",
        });
        return;
      }

      const response = await categoryService.getCategoryById(id as string);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving category:", error);
      next(error);
    }
  }

  /**
   * Update category by ID (Admin only)
   */
  async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Category ID is required",
        });
        return;
      }

      // Prepare update data
      const updateData: UpdateCategoryServiceData = {};

      if (name !== undefined) {
        updateData.name = name.trim();
      }

      if (description !== undefined) {
        updateData.description = description?.trim();
      }

      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }

      // Update category
      const response = await categoryService.updateCategory(id as string, updateData);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating category:", error);
      next(error);
    }
  }

  /**
   * Delete category by ID (soft delete) (Admin only)
   */
  async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Category ID is required",
        });
        return;
      }

      const response = await categoryService.deleteCategory(id as string);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error deleting category:", error);
      next(error);
    }
  }

  /**
   * Permanently delete category by ID (Admin only)
   */
  async permanentlyDeleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          message: "Category ID is required",
        });
        return;
      }

      const response = await categoryService.permanentlyDeleteCategory(id as string);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error permanently deleting category:", error);
      next(error);
    }
  }

  /**
   * Toggle category active status (Admin only)
   */
  async toggleCategoryStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Category ID is required",
        });
        return;
      }

      const response = await categoryService.toggleCategoryStatus(id as string);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error toggling category status:", error);
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
