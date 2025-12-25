import jwt from "jsonwebtoken";
import { userRepository } from "../repository/user.repository.js";
import { sessionRepository } from "../repository/session.repository.js";
import { AuthResponse, JwtPayload, TokenResponse, LoginType } from "../interfaces/auth.interface.js";
import { RegisterInput, LoginInput } from "../validations/auth.validation.js";
import { ApprovalStatus, IUser, UserRole } from "../models/user.model.js";
import { CustomErrorHandler, ResponseError } from "../middleware/errorHandler.js";
import { emailService } from "./email.service.js";
import { v4 as uuidv4 } from "uuid";

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
   * End users will have pending approval status
   * Admin users will be auto-approved
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

      // Determine approval status and user status based on role
      const isAdmin = registerData.role === UserRole.ADMIN;
      const approvalStatus = isAdmin ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING;
      const userStatus = isAdmin ? "active" : "inactive";

      // Create new user with appropriate approval status
      // Admin users are immediately active and approved (no email verification needed)
      const user = await userRepository.create({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phoneNumber: registerData.phoneNumber,
        role: registerData.role,
        address: registerData.address,
        approvalStatus: approvalStatus,
        status: userStatus,
      });

      // If end user, send pending approval notification email
      if (!isAdmin) {
        await emailService.sendPendingApprovalEmail(user.name, user.email);

        return {
          status: "success",
          message: "Registration successful! Your account is pending approval. You will receive an email once approved.",
          data: {
            user: user.toJSON() as Omit<IUser, "password">,
          },
        };
      }

      // For admin users, generate JWT token immediately
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
   * @param loginData - Login credentials
   * @param loginType - Type of login: "user" for end users, "admin" for admin users
   * @param requestInfo - Optional request info for session tracking
   */
  async login(loginData: LoginInput, loginType: LoginType = "user", requestInfo?: { userAgent?: string; ipAddress?: string }): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await userRepository.findByEmail(loginData.email);
      if (!user) {
        throw ResponseError.unauthorized("Invalid email or password");
      }

      // Validate role matches login type
      if (loginType === "admin" && user.role !== UserRole.ADMIN) {
        throw ResponseError.unauthorized("Akun tidak valid, mohon login dengan Akun yang benar.");
      }
      if (loginType === "user" && user.role === UserRole.ADMIN) {
        throw ResponseError.unauthorized("Akun tidak valid, mohon login dengan Akun yang benar.");
      }

      // Check if user is rejected (rejectedAt is not null)
      if (user.rejectedAt) {
        throw ResponseError.unauthorized("user tidak valid, mohon lakukan pendaftaran akun terlebih dahulu");
      }

      // Check if user status is not active
      if (user.status !== "active") {
        throw ResponseError.unauthorized("Akun Anda ditangguhkan, mohon hubungi Admin komunitas untuk mendapatkan informasi lanjutan.");
      }

      // Check if user is deleted
      if (user.deleted) {
        throw ResponseError.forbidden("This account has been deleted");
      }

      // Check approval status for non-admin users
      if (user.role !== UserRole.ADMIN) {
        if (user.approvalStatus === ApprovalStatus.PENDING) {
          throw ResponseError.forbidden("Your account is pending approval. Please wait for admin approval.");
        }
        if (user.approvalStatus === ApprovalStatus.REJECTED) {
          throw ResponseError.forbidden("Your registration has been rejected. Please contact support for more information.");
        }
      }

      // Check password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        throw ResponseError.unauthorized("Invalid email or password");
      }

      // Generate JWT token with session
      const tokenData = await this.generateTokenWithSession(user, requestInfo);

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
   * Generate JWT token (legacy - without session)
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
   * Generate JWT token with session stored in database
   */
  private async generateTokenWithSession(user: IUser, requestInfo?: { userAgent?: string; ipAddress?: string }): Promise<TokenResponse> {
    // Calculate expiration date based on jwtExpiresIn
    const expiresAt = this.calculateExpirationDate();

    // Generate unique session ID
    const sessionId = uuidv4();

    const payload: JwtPayload = {
      userId: user.id as string,
      email: user.email,
      role: user.role,
      sessionId,
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    // Store session in database
    await sessionRepository.create({
      userId: user.id as string,
      token,
      userAgent: requestInfo?.userAgent,
      ipAddress: requestInfo?.ipAddress,
      expiresAt,
    });

    return {
      token,
      expiresIn: this.jwtExpiresIn,
    };
  }

  /**
   * Calculate expiration date from JWT_EXPIRES_IN string
   */
  private calculateExpirationDate(): Date {
    const now = new Date();
    const expiresIn = this.jwtExpiresIn;

    // Parse the expiration string (e.g., "7d", "24h", "60m", "3600s")
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) {
      // Default to 7 days if parsing fails
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    let milliseconds: number;
    switch (unit) {
      case "d":
        milliseconds = value * 24 * 60 * 60 * 1000;
        break;
      case "h":
        milliseconds = value * 60 * 60 * 1000;
        break;
      case "m":
        milliseconds = value * 60 * 1000;
        break;
      case "s":
        milliseconds = value * 1000;
        break;
      default:
        milliseconds = 7 * 24 * 60 * 60 * 1000;
    }

    return new Date(now.getTime() + milliseconds);
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

  /**
   * Validate session exists in database
   */
  async validateSession(token: string): Promise<boolean> {
    try {
      return await sessionRepository.isValidSession(token);
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  }

  /**
   * Logout user - invalidate session in database
   */
  async logout(token: string): Promise<boolean> {
    try {
      return await sessionRepository.deleteByToken(token);
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }

  /**
   * Logout all sessions for a user
   */
  async logoutAllSessions(userId: string): Promise<number> {
    try {
      return await sessionRepository.deleteAllByUserId(userId);
    } catch (error) {
      console.error("Logout all sessions error:", error);
      return 0;
    }
  }

  /**
   * Verify approval token from email link
   * This is called when user clicks the verification link in their email
   */
  async verifyApprovalToken(token: string): Promise<{ success: boolean; message: string; redirectUrl: string }> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successRedirectPath = process.env.APPROVAL_SUCCESS_REDIRECT_PATH || "/login";
    const errorRedirectPath = process.env.APPROVAL_ERROR_REDIRECT_PATH || "/approval-error";

    try {
      // Find user by approval token
      const user = await userRepository.findByApprovalToken(token);

      if (!user) {
        return {
          success: false,
          message: "Invalid or expired approval token",
          redirectUrl: `${frontendUrl}${errorRedirectPath}?error=invalid_token`,
        };
      }

      // Clear the approval token and set status to approved
      await userRepository.clearApprovalToken(user.id as string);

      return {
        success: true,
        message: "Account activated successfully! You can now login.",
        redirectUrl: `${frontendUrl}${successRedirectPath}?verified=true`,
      };
    } catch (error) {
      console.error("Verify approval token error:", error);
      return {
        success: false,
        message: "Failed to verify approval token",
        redirectUrl: `${frontendUrl}${errorRedirectPath}?error=verification_failed`,
      };
    }
  }
}

export const authService = new AuthService();
