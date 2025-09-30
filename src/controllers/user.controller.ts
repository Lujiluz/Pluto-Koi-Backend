import { AuthenticatedRequest } from "#interfaces/auth.interface.js";
import { userService } from "#services/user.service.js";
import { NextFunction, Response } from "express";

class UserController {
  async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", limit = "10" } = req.query;

      const result = await userService.getAllUsers(Number(page), Number(limit));
      res.status(200).json(result);
    } catch (error) {
      console.error("Error retrieving users:", error);
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
}

export const userController = new UserController();
