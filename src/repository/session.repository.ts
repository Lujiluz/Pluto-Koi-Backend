import Session, { ISession } from "../models/session.model.js";
import { Types } from "mongoose";

export class SessionRepository {
  /**
   * Create a new session
   */
  async create(data: { userId: string; token: string; userAgent?: string; ipAddress?: string; expiresAt: Date }): Promise<ISession> {
    const session = new Session({
      userId: new Types.ObjectId(data.userId),
      token: data.token,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      expiresAt: data.expiresAt,
    });
    return await session.save();
  }

  /**
   * Find session by token
   */
  async findByToken(token: string): Promise<ISession | null> {
    return await Session.findOne({ token });
  }

  /**
   * Find all sessions for a user
   */
  async findByUserId(userId: string): Promise<ISession[]> {
    return await Session.find({ userId: new Types.ObjectId(userId) });
  }

  /**
   * Delete session by token
   */
  async deleteByToken(token: string): Promise<boolean> {
    const result = await Session.deleteOne({ token });
    return result.deletedCount > 0;
  }

  /**
   * Delete all sessions for a user
   */
  async deleteAllByUserId(userId: string): Promise<number> {
    const result = await Session.deleteMany({ userId: new Types.ObjectId(userId) });
    return result.deletedCount;
  }

  /**
   * Delete expired sessions (cleanup utility)
   */
  async deleteExpiredSessions(): Promise<number> {
    const result = await Session.deleteMany({ expiresAt: { $lt: new Date() } });
    return result.deletedCount;
  }

  /**
   * Check if session exists and is valid
   */
  async isValidSession(token: string): Promise<boolean> {
    const session = await Session.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });
    return !!session;
  }

  /**
   * Update session expiration (for token refresh)
   */
  async updateExpiration(token: string, newExpiresAt: Date): Promise<ISession | null> {
    return await Session.findOneAndUpdate({ token }, { expiresAt: newExpiresAt }, { new: true });
  }
}

export const sessionRepository = new SessionRepository();
