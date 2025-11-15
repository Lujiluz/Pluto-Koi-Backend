import { AuthenticatedRequest } from "../interfaces/auth.interface.js";
import { userService } from "../services/user.service.js";
import { NextFunction, Response } from "express";

class UserController {
  async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", limit = "10", status, search } = req.query;

      const result = await userService.getAllUsers(Number(page), Number(limit), status as string | undefined, search as string | undefined);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error retrieving users:", error);
      next(error);
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await userService.getUserById(id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error retrieving user:", error);
      next(error);
    }
  }

  async deleteUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await userService.deleteUserById(id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting user:", error);
      next(error);
    }
  }

  async blockUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await userService.blockUser(id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error blocking user:", error);
      next(error);
    }
  }

  async unblockUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await userService.unblockUser(id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error unblocking user:", error);
      next(error);
    }
  }
}

export const userController = new UserController();
