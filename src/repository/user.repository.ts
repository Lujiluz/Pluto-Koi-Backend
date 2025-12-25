import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { UserModel, IUser, UserRole, ApprovalStatus } from "../models/user.model.js";
import { paginationMetadata } from "../utils/pagination.js";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role?: UserRole;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  approvalStatus?: ApprovalStatus;
  status?: "active" | "inactive" | "banned";
}

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
}

export class UserRepository {
  /**
   * Create a new user
   */
  async create(userData: CreateUserData): Promise<IUser> {
    try {
      const user = new UserModel(userData);
      return await user.save();
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to create user");
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await UserModel.findOne({ email: email.toLowerCase(), deletedAt: { $eq: null } });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find user by email");
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find user by ID");
    }
  }

  /**
   * Update user by ID
   */
  async updateById(id: string, updateData: UpdateUserData): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to update user");
    }
  }

  /**
   * Delete user by ID
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      // const result = await UserModel.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
      const result = await UserModel.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to delete user");
    }
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      return user !== null;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to check user existence by email");
    }
  }

  /**
   * Get all users (with pagination, filtering, and search)
   */
  async findAll(page: number = 1, limit: number = 10, status?: string, search?: string, approvalStatus?: string, role?: string): Promise<{ users: IUser[]; metadata: any }> {
    try {
      const skip = (page - 1) * limit;

      // Build filter query
      const filter: any = { deleted: false };

      // Add role filter if provided, otherwise exclude admins by default
      if (role && ["admin", "endUser"].includes(role)) {
        filter.role = role;
      } else {
        filter.role = { $ne: "admin" };
      }

      // Add status filter if provided
      if (status && ["active", "inactive", "banned"].includes(status)) {
        filter.status = status;
      }

      // Add approvalStatus filter if provided
      if (approvalStatus && ["pending", "approved", "rejected"].includes(approvalStatus)) {
        filter.approvalStatus = approvalStatus;
      }

      // Add search filter if provided
      if (search) {
        const searchRegex = new RegExp(search, "i");
        filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }];
      }

      const [users, total] = await Promise.all([
        UserModel.find(filter, {
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          approvalStatus: 1,
          phoneNumber: 1,
          address: 1,
          createdAt: 1,
        })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        UserModel.countDocuments(filter),
      ]);

      const metadata = paginationMetadata(page, limit, total);

      return { users, metadata };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to fetch users");
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{ totalUsers: number; totalUsersTrend: number; totalDeletedUsers: number; totalDeletedUsersTrend: number; totalBlockedUsers: number; totalBlockedUsersTrend: number }> {
    try {
      const [totalUsers, totalDeletedUsers, totalBlockedUsers, totalUsersYesterday, totalDeletedUsersYesterday, totalBlockedUsersYesterday] = await Promise.all([
        UserModel.countDocuments({ deleted: false, role: { $ne: "admin" } }),
        UserModel.countDocuments({ deleted: true, role: { $ne: "admin" } }),
        await UserModel.countDocuments({ status: "banned", deleted: false, role: { $ne: "admin" } }),
        UserModel.countDocuments({ deleted: false, role: { $ne: "admin" }, createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        UserModel.countDocuments({ deleted: true, role: { $ne: "admin" }, createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        UserModel.countDocuments({ status: "banned", deleted: false, role: { $ne: "admin" }, createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      ]);

      const totalUsersTrend = this.countTrends(totalUsers, totalUsersYesterday);
      const totalDeletedUsersTrend = this.countTrends(totalDeletedUsers, totalDeletedUsersYesterday);
      const totalBlockedUsersTrend = this.countTrends(totalBlockedUsers, totalBlockedUsersYesterday);
      console.log("TOTAL BLCOKED USERS: ", totalBlockedUsers);
      console.log("TOTAL BLCOKED USERS TREND: ", totalBlockedUsersTrend);
      console.log("TESTING: ", await UserModel.countDocuments({ status: "banned", deleted: false, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }));

      return {
        totalUsers,
        totalUsersTrend,
        totalDeletedUsers,
        totalDeletedUsersTrend,
        totalBlockedUsers,
        totalBlockedUsersTrend,
      };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get user statistics");
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<IUser[]> {
    try {
      return await UserModel.find({ role });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find users by role");
    }
  }

  /**
   * Update user status (for blocking/unblocking)
   */
  async updateUserStatus(id: string, status: "active" | "inactive" | "banned"): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to update user status");
    }
  }

  /**
   * Find user by approval token
   */
  async findByApprovalToken(token: string): Promise<IUser | null> {
    try {
      return await UserModel.findOne({
        approvalToken: token,
        approvalTokenExpiry: { $gt: new Date() },
      });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find user by approval token");
    }
  }

  /**
   * Update user approval status
   */
  async updateApprovalStatus(
    id: string,
    approvalStatus: ApprovalStatus,
    additionalData?: {
      approvalToken?: string | null;
      approvalTokenExpiry?: Date | null;
      approvedAt?: Date | null;
      approvedBy?: string | null;
      rejectedAt?: Date | null;
      rejectedBy?: string | null;
      rejectionReason?: string | null;
    }
  ): Promise<IUser | null> {
    try {
      const updateData: any = { approvalStatus, ...additionalData };
      return await UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to update approval status");
    }
  }

  /**
   * Find all pending users (users waiting for approval)
   */
  async findPendingUsers(page: number = 1, limit: number = 10, search?: string): Promise<{ users: IUser[]; metadata: any }> {
    try {
      const skip = (page - 1) * limit;

      const filter: any = {
        role: { $ne: "admin" },
        deleted: false,
        approvalStatus: ApprovalStatus.PENDING,
      };

      if (search) {
        const searchRegex = new RegExp(search, "i");
        filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }];
      }

      const [users, total] = await Promise.all([
        UserModel.find(filter, {
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          phoneNumber: 1,
          approvalStatus: 1,
          address: 1,
          createdAt: 1,
        })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        UserModel.countDocuments(filter),
      ]);

      const metadata = paginationMetadata(page, limit, total);

      return { users, metadata };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to fetch pending users");
    }
  }

  /**
   * Get pending users count
   */
  async getPendingUsersCount(): Promise<number> {
    try {
      return await UserModel.countDocuments({
        role: { $ne: "admin" },
        deleted: false,
        approvalStatus: ApprovalStatus.PENDING,
      });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get pending users count");
    }
  }

  /**
   * Set approval token for user
   */
  async setApprovalToken(id: string, token: string, expiry: Date): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndUpdate(
        id,
        {
          approvalToken: token,
          approvalTokenExpiry: expiry,
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to set approval token");
    }
  }

  /**
   * Clear approval token after successful verification
   */
  async clearApprovalToken(id: string): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndUpdate(
        id,
        {
          approvalToken: null,
          approvalTokenExpiry: null,
          approvalStatus: ApprovalStatus.APPROVED,
          status: "active",
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to clear approval token");
    }
  }

  private countTrends(totalToday: number, totalYesterday: number): number {
    return totalYesterday > 0 ? parseFloat((((totalToday - totalYesterday) / totalYesterday) * 100).toFixed(2)) : 0;
  }

  // ==================== ADMIN MANAGEMENT METHODS ====================

  /**
   * Create a new admin user (simplified - no address, phone number, or approval required)
   */
  async createAdmin(adminData: CreateAdminData): Promise<IUser> {
    try {
      const user = new UserModel({
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        role: UserRole.ADMIN,
        phoneNumber: "0800000000", // Not required for admin
        approvalStatus: ApprovalStatus.APPROVED, // Auto-approved
        status: "active",
      });
      return await user.save();
    } catch (error) {
      throw new CustomErrorHandler(500, error instanceof Error ? error.message : "Failed to create admin user");
    }
  }

  /**
   * Get all admin users (with pagination and search)
   */
  async findAllAdmins(page: number = 1, limit: number = 10, search?: string): Promise<{ admins: IUser[]; metadata: any }> {
    try {
      const skip = (page - 1) * limit;

      const filter: any = { role: UserRole.ADMIN, deleted: false };

      if (search) {
        const searchRegex = new RegExp(search, "i");
        filter.$or = [{ name: searchRegex }, { email: searchRegex }];
      }

      const [admins, total] = await Promise.all([
        UserModel.find(filter, {
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        UserModel.countDocuments(filter),
      ]);

      const metadata = paginationMetadata(page, limit, total);

      return { admins, metadata };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to fetch admin users");
    }
  }

  /**
   * Get admin user by ID
   */
  async findAdminById(id: string): Promise<IUser | null> {
    try {
      return await UserModel.findOne({ _id: id, role: UserRole.ADMIN, deleted: false });
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to find admin by ID");
    }
  }

  /**
   * Delete admin by ID (soft delete)
   */
  async deleteAdminById(id: string): Promise<boolean> {
    try {
      const result = await UserModel.deleteOne({ _id: id, role: UserRole.ADMIN });
      return result.deletedCount > 0;
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to delete admin");
    }
  }

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<{ totalAdmins: number; activeAdmins: number }> {
    try {
      const [totalAdmins, activeAdmins] = await Promise.all([UserModel.countDocuments({ role: UserRole.ADMIN, deleted: false }), UserModel.countDocuments({ role: UserRole.ADMIN, deleted: false, status: "active" })]);

      return { totalAdmins, activeAdmins };
    } catch (error) {
      throw new CustomErrorHandler(500, "Failed to get admin statistics");
    }
  }
}

export const userRepository = new UserRepository();
