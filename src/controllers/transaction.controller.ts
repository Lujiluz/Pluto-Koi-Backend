import { NextFunction, Request, Response } from "express";
import { transactionService } from "../services/transaction.service.js";
import { AuthenticatedRequest } from "../interfaces/auth.interface.js";
import { GuestPurchaseInput, UserPurchaseInput, UpdateTransactionStatusInput, TransactionQueryInput } from "../validations/transaction.validation.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";

export class TransactionController {
  /**
   * Create a transaction for a guest user (not logged in)
   * Requires: name, email, address, productId, quantity, and payment proof image
   */
  async createGuestTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseData = req.body as GuestPurchaseInput;

      // Check if payment proof image was uploaded
      if (!req.file) {
        throw new CustomErrorHandler(400, "Payment proof image is required");
      }

      // Create transaction (service will handle file processing)
      const result = await transactionService.createGuestTransaction(purchaseData, req.file);

      res.status(201).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in createGuestTransaction controller:", error);
      next(error);
    }
  }

  /**
   * Create a transaction for a logged-in user
   * Requires: productId, quantity, and payment proof image
   * Name, email, and address are retrieved from user profile
   */
  async createUserTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new CustomErrorHandler(401, "User not authenticated");
      }

      const purchaseData = req.body as UserPurchaseInput;

      // Check if payment proof image was uploaded
      if (!req.file) {
        throw new CustomErrorHandler(400, "Payment proof image is required");
      }

      // Create transaction (service will handle file processing)
      const result = await transactionService.createUserTransaction(req.user.id, purchaseData, req.file);

      res.status(201).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in createUserTransaction controller:", error);
      next(error);
    }
  }

  /**
   * Get transaction by ID
   * Accessible by the transaction owner or admin
   */
  async getTransactionById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const transaction = await transactionService.getTransactionById(id as string);

      // Check if user has permission to view this transaction
      if (req.user?.role !== "admin" && transaction.userId?.toString() !== req.user?.id) {
        throw new CustomErrorHandler(403, "You don't have permission to view this transaction");
      }

      res.status(200).json({
        success: true,
        message: "Transaction retrieved successfully",
        data: transaction,
      });
    } catch (error) {
      console.error("Error in getTransactionById controller:", error);
      next(error);
    }
  }

  /**
   * Get all transactions with filters (admin only)
   */
  async getAllTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== "admin") {
        throw new CustomErrorHandler(403, "Only admins can view all transactions");
      }

      const queryData = req.query as unknown as TransactionQueryInput;

      const filters = {
        status: queryData.status,
        paymentStatus: queryData.paymentStatus,
        userId: queryData.userId,
        productId: queryData.productId,
      };

      const pagination = {
        page: queryData.page || 1,
        limit: queryData.limit || 10,
      };

      const result = await transactionService.getAllTransactions(filters, pagination);

      res.status(200).json({
        success: true,
        message: "Transactions retrieved successfully",
        data: result.transactions,
        metadata: result.metadata,
      });
    } catch (error) {
      console.error("Error in getAllTransactions controller:", error);
      next(error);
    }
  }

  /**
   * Get current user's transactions
   */
  async getMyTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new CustomErrorHandler(401, "User not authenticated");
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await transactionService.getUserTransactions(req.user.id, { page, limit });

      res.status(200).json({
        success: true,
        message: "Your transactions retrieved successfully",
        data: result.transactions,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
          limit,
        },
      });
    } catch (error) {
      console.error("Error in getMyTransactions controller:", error);
      next(error);
    }
  }

  /**
   * Track order by email (for guest users)
   * Allows guest users to track their orders using email
   */
  async trackOrderByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new CustomErrorHandler(400, "Email is required");
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await transactionService.getTransactionsByEmail(email, { page, limit });

      res.status(200).json({
        success: true,
        message: "Transactions retrieved successfully",
        data: result.transactions,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
          limit,
        },
      });
    } catch (error) {
      console.error("Error in trackOrderByEmail controller:", error);
      next(error);
    }
  }

  /**
   * Update transaction status (admin only)
   */
  async updateTransactionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== "admin") {
        throw new CustomErrorHandler(403, "Only admins can update transaction status");
      }

      const { id } = req.params;
      const updates = req.body as UpdateTransactionStatusInput;

      const result = await transactionService.updateTransactionStatus(id as string, updates);

      res.status(200).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in updateTransactionStatus controller:", error);
      next(error);
    }
  }

  /**
   * Delete transaction (admin only)
   */
  async deleteTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== "admin") {
        throw new CustomErrorHandler(403, "Only admins can delete transactions");
      }

      const { id } = req.params;

      const result = await transactionService.deleteTransaction(id as string);

      res.status(200).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in deleteTransaction controller:", error);
      next(error);
    }
  }

  /**
   * Get transaction statistics (admin only)
   */
  async getStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== "admin") {
        throw new CustomErrorHandler(403, "Only admins can view transaction statistics");
      }

      const stats = await transactionService.getStatistics();

      res.status(200).json({
        success: true,
        message: "Transaction statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error in getStatistics controller:", error);
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
