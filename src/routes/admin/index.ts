import { Router } from "express";
import { authenticateAdminToken } from "../../middleware/auth.middleware.js";

// Import admin routes
import auctionRoutes from "./auction.routes.js";
import auctionActivityRoutes from "./auction.activity.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import galleryRoutes from "./gallery.routes.js";
import galleryFolderRoutes from "./gallery-folder.routes.js";
import userRoutes from "./user.routes.js";
import adminManagementRoutes from "./admin-management.routes.js";
import generalRulesRoutes from "./general-rules.routes.js";
import transactionRoutes from "./transaction.routes.js";
import eventRoutes from "./event.routes.js";

const router = Router();

/**
 * Admin Routes Index
 *
 * All routes under /api/admin/* are protected by authenticateAdminToken middleware
 * which reads from the admin-specific cookie (admin_auth_token)
 *
 * This allows admin and user sessions to coexist in the same browser
 *
 * Frontend Admin Panel should use base URL: /api/admin
 */

router.use("/health", (req, res) => {
  console.log(`INI ROUTE ADMIN: ${req.originalUrl}`);
  res.json({
    success: true,
    message: "Admin API routes are working",
  });
});

// Apply admin authentication middleware to ALL admin routes
router.use(authenticateAdminToken);

// Mount admin routes
router.use("/auction", auctionRoutes);
router.use("/auction-activity", auctionActivityRoutes);
router.use("/product", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/gallery", galleryRoutes);
router.use("/gallery-folders", galleryFolderRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminManagementRoutes);
router.use("/general-rules", generalRulesRoutes);
router.use("/transaction", transactionRoutes);
router.use("/event", eventRoutes);

export default router;
