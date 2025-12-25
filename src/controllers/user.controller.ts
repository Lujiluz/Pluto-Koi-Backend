import { AuthenticatedRequest } from "../interfaces/auth.interface.js";
import { userService } from "../services/user.service.js";
import { NextFunction, Response } from "express";

class UserController {
  async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", limit = "10", status, search, approvalStatus, role } = req.query;

      const result = await userService.getAllUsers(Number(page), Number(limit), status as string | undefined, search as string | undefined, approvalStatus as string | undefined, role as string | undefined);
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

  async approveUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      const result = await userService.approveUser(id, adminId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error approving user:", error);
      next(error);
    }
  }

  async rejectUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      const result = await userService.rejectUser(id, adminId, reason);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error rejecting user:", error);
      next(error);
    }
  }

  // ==================== ADMIN MANAGEMENT ENDPOINTS ====================

  async createAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;

      const result = await userService.createAdmin(name, email, password);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating admin:", error);
      next(error);
    }
  }

  async getAllAdmins(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", limit = "10", search } = req.query;

      const result = await userService.getAllAdmins(Number(page), Number(limit), search as string | undefined);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error retrieving admins:", error);
      next(error);
    }
  }

  async getAdminById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await userService.getAdminById(id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error retrieving admin:", error);
      next(error);
    }
  }

  async deleteAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requesterId = req.user?.id;

      if (!requesterId) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      const result = await userService.deleteAdmin(id, requesterId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting admin:", error);
      next(error);
    }
  }

  async blockAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requesterId = req.user?.id;

      if (!requesterId) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      const result = await userService.blockAdmin(id, requesterId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error blocking admin:", error);
      next(error);
    }
  }

  async unblockAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await userService.unblockAdmin(id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error unblocking admin:", error);
      next(error);
    }
  }
}

export const userController = new UserController();
