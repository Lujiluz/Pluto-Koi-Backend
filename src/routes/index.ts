import { Router } from "express";
import authRoutes from "./auth.routes.js";
import exampleRoutes from "./example.routes.js";
import { readdirSync } from "fs";
import userRoutes from "./user.routes.js";

const router = Router();

// Mount auth routes
router.use("/auth", authRoutes);
router.use('/user', userRoutes)

// Mount example routes (for testing authentication)
router.use("/example", exampleRoutes);

// Health check for API routes
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API routes are working",
    endpoints: {
      auth: "/api/pluto-koi/v1/auth",
      example: "/api/pluto-koi/v1/example",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
