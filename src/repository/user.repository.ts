import { UserModel, IUser, UserRole } from "#models/user.model.js";

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
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await UserModel.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user by ID
   */
  async updateById(id: string, updateData: UpdateUserData): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user by ID
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw error;
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
      throw error;
    }
  }

  /**
   * Get all users (with pagination)
   */
  async findAll(page: number = 1, limit: number = 10): Promise<{ users: IUser[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([UserModel.find({}).skip(skip).limit(limit).sort({ createdAt: -1 }), UserModel.countDocuments({})]);

      return { users, total };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<IUser[]> {
    try {
      return await UserModel.find({ role });
    } catch (error) {
      throw error;
    }
  }
}

export const userRepository = new UserRepository();
