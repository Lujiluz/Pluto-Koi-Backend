import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { UserModel, IUser, UserRole } from "../models/user.model.js";
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
      return await UserModel.findOne({ email: email.toLowerCase() });
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
      const result = await UserModel.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
      return result.modifiedCount > 0;
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
  async findAll(page: number = 1, limit: number = 10, status?: string, search?: string): Promise<{ users: IUser[]; metadata: any }> {
    try {
      const skip = (page - 1) * limit;

      // Build filter query
      const filter: any = { role: { $ne: "admin" }, deleted: false };

      // Add status filter if provided
      if (status && ["active", "inactive", "banned"].includes(status)) {
        filter.status = status;
      }

      // Add search filter if provided
      if (search) {
        const searchRegex = new RegExp(search, "i");
        filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }];
      }

      const [users, total] = await Promise.all([UserModel.find(filter, { name: 1, email: 1, role: 1, status: 1, phoneNumber: 1, createdAt: 1 }).skip(skip).limit(limit).sort({ createdAt: -1 }), UserModel.countDocuments(filter)]);

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
        UserModel.countDocuments({ deleted: false, role: {$ne: "admin"} }),
        UserModel.countDocuments({ deleted: true, role: {$ne: "admin"} }),
        await UserModel.countDocuments({ status: "banned", deleted: false, role: {$ne: "admin"} }),
        UserModel.countDocuments({ deleted: false, role: {$ne: "admin"}, createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        UserModel.countDocuments({ deleted: true, role: {$ne: "admin"}, createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        UserModel.countDocuments({ status: "banned", deleted: false, role: {$ne: "admin"}, createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
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

  private countTrends(totalToday: number, totalYesterday: number): number {
    return totalYesterday > 0 ? parseFloat((((totalToday - totalYesterday) / totalYesterday) * 100).toFixed(2)) : 0;
  }
}

export const userRepository = new UserRepository();
