import { Request } from "express";
import { IUser, UserRole } from "#models/user.model.js";

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: Omit<IUser, "password">;
    token: string;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface TokenResponse {
  token: string;
  expiresIn: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
