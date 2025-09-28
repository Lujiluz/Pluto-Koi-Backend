import { Request } from "express";
import { IUser } from "#models/user.model.js";

// Note: RegisterRequest and LoginRequest are now defined in validations/auth.validation.ts using Zod
// Use RegisterInput and LoginInput from there instead

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
  role: string;
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
