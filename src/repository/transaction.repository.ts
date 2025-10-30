import { TransactionModel, ITransaction, TransactionStatus, PaymentStatus } from "../models/transaction.model.js";
import { Types } from "mongoose";

export interface TransactionFilter {
  status?: TransactionStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  productId?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export class TransactionRepository {
  /**
   * Create a new transaction
   */
  async create(transactionData: Partial<ITransaction>): Promise<ITransaction> {
    try {
      const transaction = new TransactionModel(transactionData);
      return await transaction.save();
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  /**
   * Find transaction by ID
   */
  async findById(id: string): Promise<ITransaction | null> {
    try {
      return await TransactionModel.findById(id).populate("userId", "name email").populate("productId", "productName productPrice media").exec();
    } catch (error) {
      console.error("Error finding transaction by ID:", error);
      throw error;
    }
  }

  /**
   * Find all transactions with filters and pagination
   */
  async findAll(filters: TransactionFilter, pagination: PaginationOptions): Promise<{ transactions: ITransaction[]; total: number; page: number; pages: number }> {
    try {
      const query: any = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }

      if (filters.userId) {
        query.userId = new Types.ObjectId(filters.userId);
      }

      if (filters.productId) {
        query.productId = new Types.ObjectId(filters.productId);
      }

      const skip = (pagination.page - 1) * pagination.limit;

      const [transactions, total] = await Promise.all([
        TransactionModel.find(query).populate("userId", "name email").populate("productId", "productName productPrice media").sort({ createdAt: -1 }).skip(skip).limit(pagination.limit).exec(),
        TransactionModel.countDocuments(query),
      ]);

      return {
        transactions,
        total,
        page: pagination.page,
        pages: Math.ceil(total / pagination.limit),
      };
    } catch (error) {
      console.error("Error finding transactions:", error);
      throw error;
    }
  }

  /**
   * Find transactions by user ID
   */
  async findByUserId(userId: string, pagination: PaginationOptions): Promise<{ transactions: ITransaction[]; total: number; page: number; pages: number }> {
    try {
      const skip = (pagination.page - 1) * pagination.limit;

      const [transactions, total] = await Promise.all([
        TransactionModel.find({ userId: new Types.ObjectId(userId) })
          .populate("productId", "productName productPrice media")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pagination.limit)
          .exec(),
        TransactionModel.countDocuments({ userId: new Types.ObjectId(userId) }),
      ]);

      return {
        transactions,
        total,
        page: pagination.page,
        pages: Math.ceil(total / pagination.limit),
      };
    } catch (error) {
      console.error("Error finding transactions by user ID:", error);
      throw error;
    }
  }

  /**
   * Find transactions by email (for guest users)
   */
  async findByEmail(email: string, pagination: PaginationOptions): Promise<{ transactions: ITransaction[]; total: number; page: number; pages: number }> {
    try {
      const skip = (pagination.page - 1) * pagination.limit;

      const [transactions, total] = await Promise.all([
        TransactionModel.find({ "buyerInfo.email": email.toLowerCase() }).populate("productId", "productName productPrice media").sort({ createdAt: -1 }).skip(skip).limit(pagination.limit).exec(),
        TransactionModel.countDocuments({ "buyerInfo.email": email.toLowerCase() }),
      ]);

      return {
        transactions,
        total,
        page: pagination.page,
        pages: Math.ceil(total / pagination.limit),
      };
    } catch (error) {
      console.error("Error finding transactions by email:", error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateStatus(
    id: string,
    updates: {
      status?: TransactionStatus;
      paymentStatus?: PaymentStatus;
      adminNotes?: string;
    }
  ): Promise<ITransaction | null> {
    try {
      return await TransactionModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).populate("userId", "name email").populate("productId", "productName productPrice media").exec();
    } catch (error) {
      console.error("Error updating transaction status:", error);
      throw error;
    }
  }

  /**
   * Delete transaction (soft delete if needed, or hard delete)
   */
  async delete(id: string): Promise<ITransaction | null> {
    try {
      return await TransactionModel.findByIdAndDelete(id).exec();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPaymentStatus: Record<string, number>;
    totalRevenue: number;
  }> {
    try {
      const [total, byStatus, byPaymentStatus, revenue] = await Promise.all([
        TransactionModel.countDocuments(),
        TransactionModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        TransactionModel.aggregate([{ $group: { _id: "$paymentStatus", count: { $sum: 1 } } }]),
        TransactionModel.aggregate([
          {
            $match: {
              status: { $in: [TransactionStatus.CONFIRMED, TransactionStatus.PROCESSING, TransactionStatus.SHIPPED, TransactionStatus.DELIVERED] },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ]);

      const statusMap: Record<string, number> = {};
      byStatus.forEach((item) => {
        statusMap[item._id] = item.count;
      });

      const paymentStatusMap: Record<string, number> = {};
      byPaymentStatus.forEach((item) => {
        paymentStatusMap[item._id] = item.count;
      });

      return {
        total,
        byStatus: statusMap,
        byPaymentStatus: paymentStatusMap,
        totalRevenue: revenue[0]?.total || 0,
      };
    } catch (error) {
      console.error("Error getting transaction statistics:", error);
      throw error;
    }
  }
}

export const transactionRepository = new TransactionRepository();
