import { transactionRepository, TransactionFilter, PaginationOptions } from "../repository/transaction.repository.js";
import { productRepository } from "../repository/product.repository.js";
import { userRepository } from "../repository/user.repository.js";
import { ITransaction, TransactionStatus, PaymentStatus, IBuyerInfo } from "../models/transaction.model.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { GuestPurchaseInput, UserPurchaseInput, UpdateTransactionStatusInput } from "../validations/transaction.validation.js";

export class TransactionService {
  /**
   * Create a transaction for a guest user
   */
  async createGuestTransaction(
    purchaseData: GuestPurchaseInput,
    paymentProofUrl: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: ITransaction;
  }> {
    try {
      // Validate product exists and is active
      const product = await productRepository.findById(purchaseData.productId);
      if (!product) {
        throw new CustomErrorHandler(404, "Product not found");
      }

      if (!product.isActive) {
        throw new CustomErrorHandler(400, "Product is not available for purchase");
      }

      // Calculate total amount
      const totalAmount = product.productPrice * purchaseData.quantity;

      // Prepare buyer info
      const buyerInfo: IBuyerInfo = {
        name: purchaseData.name,
        email: purchaseData.email,
        phoneNumber: purchaseData.phoneNumber,
        address: purchaseData.address,
      };

      // Create transaction
      const transaction = await transactionRepository.create({
        userId: undefined, // Guest user - no userId
        productId: product._id as any,
        productName: product.productName,
        productPrice: product.productPrice,
        quantity: purchaseData.quantity,
        totalAmount,
        buyerInfo,
        paymentProof: paymentProofUrl,
        paymentStatus: PaymentStatus.PENDING,
        status: TransactionStatus.PENDING,
      });

      return {
        success: true,
        message: "Transaction created successfully. Your purchase is pending confirmation.",
        data: transaction,
      };
    } catch (error) {
      console.error("Error creating guest transaction:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to create transaction");
    }
  }

  /**
   * Create a transaction for a logged-in user
   */
  async createUserTransaction(
    userId: string,
    purchaseData: UserPurchaseInput,
    paymentProofUrl: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: ITransaction;
  }> {
    try {
      // Validate user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new CustomErrorHandler(404, "User not found");
      }

      if (user.status === "banned") {
        throw new CustomErrorHandler(403, "Your account has been blocked. Please contact support.");
      }

      // Check if user has address information
      if (!user.address || !user.address.street || !user.address.city) {
        throw new CustomErrorHandler(400, "Please update your profile with complete address information before making a purchase");
      }

      // Validate product exists and is active
      const product = await productRepository.findById(purchaseData.productId);
      if (!product) {
        throw new CustomErrorHandler(404, "Product not found");
      }

      if (!product.isActive) {
        throw new CustomErrorHandler(400, "Product is not available for purchase");
      }

      // Calculate total amount
      const totalAmount = product.productPrice * purchaseData.quantity;

      // Prepare buyer info from user data
      const buyerInfo: IBuyerInfo = {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
      };

      // Create transaction
      const transaction = await transactionRepository.create({
        userId: user._id as any,
        productId: product._id as any,
        productName: product.productName,
        productPrice: product.productPrice,
        quantity: purchaseData.quantity,
        totalAmount,
        buyerInfo,
        paymentProof: paymentProofUrl,
        paymentStatus: PaymentStatus.PENDING,
        status: TransactionStatus.PENDING,
      });

      return {
        success: true,
        message: "Transaction created successfully. Your purchase is pending confirmation.",
        data: transaction,
      };
    } catch (error) {
      console.error("Error creating user transaction:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to create transaction");
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<ITransaction> {
    try {
      const transaction = await transactionRepository.findById(id);
      if (!transaction) {
        throw new CustomErrorHandler(404, "Transaction not found");
      }
      return transaction;
    } catch (error) {
      console.error("Error getting transaction:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to get transaction");
    }
  }

  /**
   * Get all transactions with filters (admin only)
   */
  async getAllTransactions(
    filters: TransactionFilter,
    pagination: PaginationOptions
  ): Promise<{
    transactions: ITransaction[];
    metadata: any
  }> {
    try {
      return await transactionRepository.findAll(filters, pagination);
    } catch (error) {
      console.error("Error getting all transactions:", error);
      throw new CustomErrorHandler(500, "Failed to get transactions");
    }
  }

  /**
   * Get user's transactions
   */
  async getUserTransactions(
    userId: string,
    pagination: PaginationOptions
  ): Promise<{
    transactions: ITransaction[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      return await transactionRepository.findByUserId(userId, pagination);
    } catch (error) {
      console.error("Error getting user transactions:", error);
      throw new CustomErrorHandler(500, "Failed to get user transactions");
    }
  }

  /**
   * Get transactions by email (for guest users to track orders)
   */
  async getTransactionsByEmail(
    email: string,
    pagination: PaginationOptions
  ): Promise<{
    transactions: ITransaction[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      return await transactionRepository.findByEmail(email, pagination);
    } catch (error) {
      console.error("Error getting transactions by email:", error);
      throw new CustomErrorHandler(500, "Failed to get transactions");
    }
  }

  /**
   * Update transaction status (admin only)
   */
  async updateTransactionStatus(
    id: string,
    updates: UpdateTransactionStatusInput
  ): Promise<{
    success: boolean;
    message: string;
    data?: ITransaction;
  }> {
    try {
      // Validate transaction exists
      const existingTransaction = await transactionRepository.findById(id);
      if (!existingTransaction) {
        throw new CustomErrorHandler(404, "Transaction not found");
      }

      // Update transaction
      const updatedTransaction = await transactionRepository.updateStatus(id, updates);

      if (!updatedTransaction) {
        throw new CustomErrorHandler(500, "Failed to update transaction");
      }

      return {
        success: true,
        message: "Transaction updated successfully",
        data: updatedTransaction,
      };
    } catch (error) {
      console.error("Error updating transaction status:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to update transaction status");
    }
  }

  /**
   * Delete transaction (admin only)
   */
  async deleteTransaction(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const transaction = await transactionRepository.findById(id);
      if (!transaction) {
        throw new CustomErrorHandler(404, "Transaction not found");
      }

      await transactionRepository.delete(id);

      return {
        success: true,
        message: "Transaction deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting transaction:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to delete transaction");
    }
  }

  /**
   * Get transaction statistics (admin only)
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPaymentStatus: Record<string, number>;
    totalRevenue: number;
  }> {
    try {
      return await transactionRepository.getStatistics();
    } catch (error) {
      console.error("Error getting transaction statistics:", error);
      throw new CustomErrorHandler(500, "Failed to get transaction statistics");
    }
  }
}

export const transactionService = new TransactionService();
