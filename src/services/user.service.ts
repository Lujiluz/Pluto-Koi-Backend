import { GeneralResponse } from "../interfaces/global.interface.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { IUser } from "../models/user.model.js";
import { CreateUserData, userRepository } from "../repository/user.repository.js";

class UserService {
  async getUserById(userId: string): Promise<GeneralResponse<IUser | null>> {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new CustomErrorHandler(404, "User not found");
      }

      return {
        status: "success",
        message: "User retrieved successfully",
        data: user,
      };
    } catch (error) {
      console.error("Error retrieving user:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve user");
    }
  }

  async getAllUsers(page: number = 1, limit: number = 10, status?: string, search?: string): Promise<GeneralResponse<{ users: IUser[]; metadata: any; statistics: any }>> {
    try {
      const { users, metadata } = await userRepository.findAll(page, limit, status, search);

      const userStats = await userRepository.getUserStats();

      return {
        status: "success",
        message: "Users retrieved successfully",
        data: { statistics: userStats, users, metadata },
      };
    } catch (error) {
      console.error("Error retrieving users:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve users");
    }
  }

  async deleteUserById(userId: string): Promise<GeneralResponse<null>> {
    try {
      const success = await userRepository.deleteById(userId);

      if (!success) {
        throw new CustomErrorHandler(404, "User not found or already deleted");
      }

      return {
        status: "success",
        message: "User deleted successfully",
        data: null,
      };
    } catch (error) {
      console.log("Error deleting user:", error);
      throw new CustomErrorHandler(500, "Failed to delete user");
    }
  }

  async blockUser(userId: string): Promise<GeneralResponse<IUser>> {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new CustomErrorHandler(404, "User not found");
      }

      if (user.status === "banned") {
        throw new CustomErrorHandler(400, "User is already blocked");
      }

      const updatedUser = await userRepository.updateUserStatus(userId, "banned");

      if (!updatedUser) {
        throw new CustomErrorHandler(500, "Failed to block user");
      }

      return {
        status: "success",
        message: "User blocked successfully",
        data: updatedUser,
      };
    } catch (error) {
      console.error("Error blocking user:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to block user");
    }
  }

  async unblockUser(userId: string): Promise<GeneralResponse<IUser>> {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new CustomErrorHandler(404, "User not found");
      }

      if (user.status !== "banned") {
        throw new CustomErrorHandler(400, "User is not blocked");
      }

      const updatedUser = await userRepository.updateUserStatus(userId, "active");

      if (!updatedUser) {
        throw new CustomErrorHandler(500, "Failed to unblock user");
      }

      return {
        status: "success",
        message: "User unblocked successfully",
        data: updatedUser,
      };
    } catch (error) {
      console.error("Error unblocking user:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to unblock user");
    }
  }
}

export const userService = new UserService();
