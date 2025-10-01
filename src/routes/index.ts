import { Router } from "express";
import authRoutes from "./auth.routes.js";
import auctionRoutes from "./auction.routes.js";
import auctionActivityRoutes from "./auction.activity.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

// Mount auth routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/auction", auctionRoutes);
router.use("/auction-activity", auctionActivityRoutes);

// Health check for API routes
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API routes are working",
    endpoints: {
      auth: "/api/pluto-koi/v1/auth",
      auction: "/api/pluto-koi/v1/auction",
      auctionActivity: "/api/pluto-koi/v1/auction-activity",
      user: "/api/pluto-koi/v1/user",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
