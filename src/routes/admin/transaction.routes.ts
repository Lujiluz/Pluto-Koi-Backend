import { Router } from "express";
import { transactionController } from "../../controllers/transaction.controller.js";
import { uploadPaymentProof } from "../../middleware/uploadMiddleware.js";
import { validateUpdateTransactionStatus, validateTransactionQuery } from "../../validations/transaction.validation.js";

const router = Router();

/**
 * Admin Transaction Routes
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

/**
 * @route   GET /api/admin/transaction
 * @desc    Get all transactions with filters
 * @access  Private (Admin only)
 */
router.get("/", validateTransactionQuery, transactionController.getAllTransactions.bind(transactionController));

/**
 * @route   GET /api/admin/transaction/statistics/all
 * @desc    Get transaction statistics
 * @access  Private (Admin only)
 */
router.get("/statistics/all", transactionController.getStatistics.bind(transactionController));

/**
 * @route   GET /api/admin/transaction/:id
 * @desc    Get transaction by ID
 * @access  Private (Admin only)
 */
router.get("/:id", transactionController.getTransactionById.bind(transactionController));

/**
 * @route   PATCH /api/admin/transaction/:id
 * @desc    Update transaction status
 * @access  Private (Admin only)
 */
router.patch("/:id", validateUpdateTransactionStatus, transactionController.updateTransactionStatus.bind(transactionController));

/**
 * @route   DELETE /api/admin/transaction/:id
 * @desc    Delete transaction
 * @access  Private (Admin only)
 */
router.delete("/:id", transactionController.deleteTransaction.bind(transactionController));

export default router;
