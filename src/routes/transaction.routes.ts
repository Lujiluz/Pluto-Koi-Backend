import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";
import { uploadPaymentProof } from "../middleware/uploadMiddleware.js";
import { validateGuestPurchase, validateUserPurchase, validateUpdateTransactionStatus, validateTransactionQuery } from "../validations/transaction.validation.js";

const router = Router();

/**
 * @route   POST /api/transaction/guest-purchase
 * @desc    Create a transaction for a guest user (not logged in)
 * @access  Public
 * @body    { name, email, address: { street, city, state, zipCode, country }, productId, quantity }
 * @file    paymentProof (image)
 */
router.post("/guest-purchase", uploadPaymentProof, validateGuestPurchase, transactionController.createGuestTransaction.bind(transactionController));

/**
 * @route   POST /api/transaction/user-purchase
 * @desc    Create a transaction for a logged-in user
 * @access  Private (requires authentication)
 * @body    { productId, quantity }
 * @file    paymentProof (image)
 */
router.post("/user-purchase", authenticateToken, uploadPaymentProof, validateUserPurchase, transactionController.createUserTransaction.bind(transactionController));

/**
 * @route   POST /api/transaction/track
 * @desc    Track orders by email (for guest users)
 * @access  Public
 * @body    { email }
 * @query   page, limit
 */
router.post("/track", transactionController.trackOrderByEmail.bind(transactionController));

/**
 * @route   GET /api/transaction/my-transactions
 * @desc    Get current user's transactions
 * @access  Private (requires authentication)
 * @query   page, limit
 */
router.get("/my-transactions", authenticateToken, transactionController.getMyTransactions.bind(transactionController));

/**
 * @route   GET /api/transaction/:id
 * @desc    Get transaction by ID
 * @access  Private (owner or admin)
 */
router.get("/:id", authenticateToken, transactionController.getTransactionById.bind(transactionController));

/**
 * @route   GET /api/transaction
 * @desc    Get all transactions with filters (admin only)
 * @access  Private (admin only)
 * @query   status, paymentStatus, userId, productId, page, limit
 */
router.get("/", authenticateToken, requireAdmin, validateTransactionQuery, transactionController.getAllTransactions.bind(transactionController));

/**
 * @route   PATCH /api/transaction/:id
 * @desc    Update transaction status (admin only)
 * @access  Private (admin only)
 * @body    { status?, paymentStatus?, adminNotes? }
 */
router.patch("/:id", authenticateToken, requireAdmin, validateUpdateTransactionStatus, transactionController.updateTransactionStatus.bind(transactionController));

/**
 * @route   DELETE /api/transaction/:id
 * @desc    Delete transaction (admin only)
 * @access  Private (admin only)
 */
router.delete("/:id", authenticateToken, requireAdmin, transactionController.deleteTransaction.bind(transactionController));

/**
 * @route   GET /api/transaction/statistics/all
 * @desc    Get transaction statistics (admin only)
 * @access  Private (admin only)
 */
router.get("/statistics/all", authenticateToken, requireAdmin, transactionController.getStatistics.bind(transactionController));

export default router;
