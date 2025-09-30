import { CustomErrorHandler } from "#middleware/errorHandler.js";
import { UserModel, IUser, UserRole } from "#models/user.model.js";
import { paginationMetadata } from "#utils/pagination.js";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
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
   * Get all users (with pagination)
   */
  async findAll(page: number = 1, limit: number = 10): Promise<{ users: IUser[]; metadata: any }> {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        UserModel.find({ role: { $ne: "admin" }, deleted: false }, { name: 1, email: 1, role: 1, createdAt: 1 })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        UserModel.countDocuments({ role: { $ne: "admin" }, deleted: false }),
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
  async getUserStats(): Promise<{ totalUsers: number; totalUsersTrend: number; totalDeletedUsers: number; totalDeletedUsersTrend: number }> {
    try {
      const [totalUsers, totalDeletedUsers] = await Promise.all([UserModel.countDocuments({ deleted: false }), UserModel.countDocuments({ deleted: true })]);

      const totalUsersTrend = totalUsers - (await UserModel.countDocuments({ deleted: false, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }));
      const totalDeletedUsersTrend = totalDeletedUsers - (await UserModel.countDocuments({ deleted: true, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }));

      return {
        totalUsers,
        totalUsersTrend,
        totalDeletedUsers,
        totalDeletedUsersTrend,
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
}

export const userRepository = new UserRepository();
