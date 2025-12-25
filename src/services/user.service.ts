import { GeneralResponse } from "../interfaces/global.interface.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { ApprovalStatus, IUser } from "../models/user.model.js";
import { CreateUserData, userRepository } from "../repository/user.repository.js";
import { emailService } from "./email.service.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

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

  async getAllUsers(page: number = 1, limit: number = 10, status?: string, search?: string, approvalStatus?: string, role?: string): Promise<GeneralResponse<{ users: IUser[]; metadata: any; statistics: any }>> {
    try {
      const { users, metadata } = await userRepository.findAll(page, limit, status, search, approvalStatus, role);

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

  /**
   * Approve a user registration
   * This will generate an approval token and send an email to the user
   */
  async approveUser(userId: string, adminId: string): Promise<GeneralResponse<IUser>> {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new CustomErrorHandler(404, "User not found");
      }

      if (user.approvalStatus !== ApprovalStatus.PENDING) {
        throw new CustomErrorHandler(400, `User is already ${user.approvalStatus}`);
      }

      // Generate approval token
      const approvalToken = uuidv4();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with approval token and pending status
      const updatedUser = await userRepository.updateApprovalStatus(userId, ApprovalStatus.PENDING, {
        approvalToken: approvalToken,
        approvalTokenExpiry: tokenExpiry,
        approvedBy: adminId,
        approvedAt: new Date(),
      });

      if (!updatedUser) {
        throw new CustomErrorHandler(500, "Failed to approve user");
      }

      // Send approval email with verification link
      const emailSent = await emailService.sendApprovalEmail({
        userName: user.name,
        userEmail: user.email,
        approvalToken: approvalToken,
      });

      if (!emailSent) {
        console.warn(`Warning: Failed to send approval email to ${user.email}`);
      }

      return {
        status: "success",
        message: "User approved successfully. Verification email has been sent.",
        data: updatedUser,
      };
    } catch (error) {
      console.error("Error approving user:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to approve user");
    }
  }

  /**
   * Reject a user registration
   */
  async rejectUser(userId: string, adminId: string, reason?: string): Promise<GeneralResponse<IUser>> {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new CustomErrorHandler(404, "User not found");
      }

      if (user.approvalStatus !== ApprovalStatus.PENDING) {
        throw new CustomErrorHandler(400, `User is already ${user.approvalStatus}`);
      }

      // Update user with rejected status
      const updatedUser = await userRepository.updateApprovalStatus(userId, ApprovalStatus.REJECTED, {
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: reason || null,
      });

      if (!updatedUser) {
        throw new CustomErrorHandler(500, "Failed to reject user");
      }

      // Send rejection email
      const emailSent = await emailService.sendRejectionEmail(user.name, user.email, reason);

      if (!emailSent) {
        console.warn(`Warning: Failed to send rejection email to ${user.email}`);
      }

      return {
        status: "success",
        message: "User rejected successfully. Notification email has been sent.",
        data: updatedUser,
      };
    } catch (error) {
      console.error("Error rejecting user:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to reject user");
    }
  }

  // ==================== ADMIN MANAGEMENT METHODS ====================

  /**
   * Create a new admin user
   * Only requires name, email, and password (no address, phone, or approval needed)
   */
  async createAdmin(name: string, email: string, password: string): Promise<GeneralResponse<IUser>> {
    try {
      // Check if email already exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new CustomErrorHandler(409, "Email already registered");
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);

      const admin = await userRepository.createAdmin({
        name,
        email,
        password,
      });

      return {
        status: "success",
        message: "Admin user created successfully",
        data: admin,
      };
    } catch (error) {
      console.error("Error creating admin:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to create admin user");
    }
  }

  /**
   * Get all admin users with pagination and search
   */
  async getAllAdmins(page: number = 1, limit: number = 10, search?: string): Promise<GeneralResponse<{ admins: IUser[]; metadata: any; statistics: any }>> {
    try {
      const { admins, metadata } = await userRepository.findAllAdmins(page, limit, search);
      const statistics = await userRepository.getAdminStats();

      return {
        status: "success",
        message: "Admin users retrieved successfully",
        data: { statistics, admins, metadata },
      };
    } catch (error) {
      console.error("Error retrieving admins:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve admin users");
    }
  }

  /**
   * Get admin user by ID
   */
  async getAdminById(adminId: string): Promise<GeneralResponse<IUser | null>> {
    try {
      const admin = await userRepository.findAdminById(adminId);

      if (!admin) {
        throw new CustomErrorHandler(404, "Admin user not found");
      }

      return {
        status: "success",
        message: "Admin user retrieved successfully",
        data: admin,
      };
    } catch (error) {
      console.error("Error retrieving admin:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to retrieve admin user");
    }
  }

  /**
   * Delete admin user by ID (soft delete)
   * An admin cannot delete themselves
   */
  async deleteAdmin(adminId: string, requesterId: string): Promise<GeneralResponse<null>> {
    try {
      // Prevent self-deletion
      if (adminId === requesterId) {
        throw new CustomErrorHandler(400, "You cannot delete your own admin account");
      }

      const admin = await userRepository.findAdminById(adminId);

      if (!admin) {
        throw new CustomErrorHandler(404, "Admin user not found");
      }

      const success = await userRepository.deleteAdminById(adminId);

      if (!success) {
        throw new CustomErrorHandler(500, "Failed to delete admin user");
      }

      return {
        status: "success",
        message: "Admin user deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error deleting admin:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to delete admin user");
    }
  }

  /**
   * Block an admin user
   */
  async blockAdmin(adminId: string, requesterId: string): Promise<GeneralResponse<IUser>> {
    try {
      // Prevent self-blocking
      if (adminId === requesterId) {
        throw new CustomErrorHandler(400, "You cannot block your own admin account");
      }

      const admin = await userRepository.findAdminById(adminId);

      if (!admin) {
        throw new CustomErrorHandler(404, "Admin user not found");
      }

      if (admin.status === "banned") {
        throw new CustomErrorHandler(400, "Admin is already blocked");
      }

      const updatedAdmin = await userRepository.updateUserStatus(adminId, "banned");

      if (!updatedAdmin) {
        throw new CustomErrorHandler(500, "Failed to block admin");
      }

      return {
        status: "success",
        message: "Admin user blocked successfully",
        data: updatedAdmin,
      };
    } catch (error) {
      console.error("Error blocking admin:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to block admin user");
    }
  }

  /**
   * Unblock an admin user
   */
  async unblockAdmin(adminId: string): Promise<GeneralResponse<IUser>> {
    try {
      const admin = await userRepository.findAdminById(adminId);

      if (!admin) {
        throw new CustomErrorHandler(404, "Admin user not found");
      }

      if (admin.status !== "banned") {
        throw new CustomErrorHandler(400, "Admin is not blocked");
      }

      const updatedAdmin = await userRepository.updateUserStatus(adminId, "active");

      if (!updatedAdmin) {
        throw new CustomErrorHandler(500, "Failed to unblock admin");
      }

      return {
        status: "success",
        message: "Admin user unblocked successfully",
        data: updatedAdmin,
      };
    } catch (error) {
      console.error("Error unblocking admin:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to unblock admin user");
    }
  }
}

export const userService = new UserService();
