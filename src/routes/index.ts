import { Router } from "express";
import authRoutes from "./auth.routes.js";
import auctionRoutes from "./auction.routes.js";
import auctionActivityRoutes from "./auction.activity.routes.js";
import productRoutes from "./product.routes.js";
import galleryRoutes from "./gallery.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

// Mount auth routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/auction", auctionRoutes);
router.use("/auction-activity", auctionActivityRoutes);
router.use("/product", productRoutes);
router.use("/gallery", galleryRoutes);

// Health check for API routes
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API routes are working",
    endpoints: {
      auth: "/api/pluto-koi/v1/auth",
      auction: "/api/pluto-koi/v1/auction",
      auctionActivity: "/api/pluto-koi/v1/auction-activity",
      product: "/api/pluto-koi/v1/product",
      gallery: "/api/pluto-koi/v1/gallery",
      user: "/api/pluto-koi/v1/user",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
