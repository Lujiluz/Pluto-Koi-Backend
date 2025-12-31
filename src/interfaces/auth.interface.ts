import { Request, CookieOptions } from "express";
import { IUser, UserRole } from "../models/user.model.js";

export interface AuthResponse {
  status: string;
  message: string;
  data?: {
    user: Omit<IUser, "password">;
    token?: string;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export type LoginType = "user" | "admin";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Extended request interface that includes file upload support
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  files?: any; // For multer file uploads
  file?: any; // For single file uploads
}

export interface TokenResponse {
  token: string;
  expiresIn: string;
  maxAge: number; // Cookie maxAge in milliseconds
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Cookie configuration
export const AUTH_COOKIE_NAME = "auth_token"; // For regular users
export const ADMIN_AUTH_COOKIE_NAME = "auth_admin_token"; // For admin users

export const getCookieOptions = (maxAge: number): CookieOptions => ({
  httpOnly: true, // Prevents XSS attacks - cookie cannot be accessed via JavaScript
  secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // CSRF protection
  maxAge, // Cookie expiration in milliseconds
  path: "/", // Cookie available for all routes
});
