import jwt from "jsonwebtoken";
import { userRepository } from "../repository/user.repository.js";
import { AuthResponse, JwtPayload, TokenResponse } from "../interfaces/auth.interface.js";
import { RegisterInput, LoginInput } from "../validations/auth.validation.js";
import { IUser } from "../models/user.model.js";
import { CustomErrorHandler, ResponseError } from "../middleware/errorHandler.js";
import { success } from "zod";

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

    if (!process.env.JWT_SECRET) {
      console.warn("⚠️ JWT_SECRET not set in environment variables. Using default (NOT recommended for production)");
    }
  }

  /**
   * Register a new user
   */
  async register(registerData: RegisterInput): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await userRepository.existsByEmail(registerData.email);
      if (existingUser) {
        return {
          status: "error",
          message: "User with this email already exists",
        };
      }

      // Create new user
      const user = await userRepository.create({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phoneNumber: registerData.phoneNumber,
        role: registerData.role,
        address: registerData.address,
      });

      // Generate JWT token
      const tokenData = this.generateToken(user);

      return {
        status: "success",
        message: "User registered successfully",
        data: {
          user: user.toJSON() as Omit<IUser, "password">,
          token: tokenData.token,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        status: "error",
        message: "Registration failed. Please try again.",
      };
    }
  }

  /**
   * Login user
   */
  async login(loginData: LoginInput): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await userRepository.findByEmail(loginData.email);
      if (!user) {
        throw ResponseError.unauthorized("Invalid email or password");
      }

      // Check if user is banned
      if (user.status === "banned") {
        throw ResponseError.forbidden("Your account has been blocked. Please contact support.");
      }

      // Check if user is deleted
      if (user.deleted) {
        throw ResponseError.forbidden("This account has been deleted");
      }

      // Check password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        throw ResponseError.unauthorized("Invalid email or password");
      }

      // Generate JWT token
      const tokenData = this.generateToken(user);

      return {
        status: "success",
        message: "Login successful",
        data: {
          user: user.toJSON() as Omit<IUser, "password">,
          token: tokenData.token,
        },
      };
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Login failed. Please try again.");
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: IUser): TokenResponse {
    const payload: JwtPayload = {
      userId: user.id as string,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    return {
      token,
      expiresIn: this.jwtExpiresIn,
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  }

  /**
   * Get user by ID (for token verification)
   */
  async getUserById(userId: string): Promise<IUser | null> {
    try {
      return await userRepository.findById(userId);
    } catch (error) {
      console.error("Get user by ID error:", error);
      return null;
    }
  }

  /**
   * Validate user credentials (for protected routes)
   */
  async validateUser(userId: string): Promise<IUser | null> {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      console.error("User validation error:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
