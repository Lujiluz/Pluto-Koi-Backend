import { Router } from "express";
import authRoutes from "./auth.routes.js";
import auctionRoutes from "./auction.routes.js";
import auctionActivityRoutes from "./auction.activity.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import galleryRoutes from "./gallery.routes.js";
import userRoutes from "./user.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import generalRulesRoutes from "./general-rules.routes.js";
import transactionRoutes from "./transaction.routes.js";
import eventRoutes from "./event.routes.js";

const router = Router();

// Mount auth routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/auction", auctionRoutes);
router.use("/auction-activity", auctionActivityRoutes);
router.use("/product", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/gallery", galleryRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/general-rules", generalRulesRoutes);
router.use("/transaction", transactionRoutes);
router.use("/event", eventRoutes);

// Health check for API routes
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API routes are working",
    timestamp: new Date().toISOString(),
  });
});

export default router;
