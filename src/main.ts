import express from "express";
import { createServer } from "http";
import { DatabaseConfig } from "./config/database.js";
import apiRoutes from "./routes/index.js";
import { skipLogging, errorLoggingMiddleware, performanceLoggingMiddleware, developmentLoggingMiddleware } from "./middleware/logging.middleware.js";
import { logger } from "./utils/logger.js";
import { websocketService } from "./services/websocket.service.js";
import { seedCategories } from "./utils/seedData.js";
import { config } from "dotenv";
config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT ?? "3000";

// Trust proxy for accurate IP addresses (if behind reverse proxy)
app.set("trust proxy", true);

// Logging middleware (applied early to catch all requests)
app.use(skipLogging(["/health", "/favicon.ico", "/robots.txt"]));

// Performance monitoring (log slow requests > 1000ms)
app.use(performanceLoggingMiddleware(1000));

// Development logging (only in development mode)
app.use(developmentLoggingMiddleware);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Host");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files for media uploads
app.use("/media", express.static("public/media"));

// Root route
// app.get("/", (req, res) => {
//   res.json({
//     message: "Pluto Koi Backend API",
//     status: "running",
//     version: "1.0.0",
//     endpoints: {
//       auth: "/api/auth",
//       health: "/api/health",
//     },
//     timestamp: new Date().toISOString(),
//   });
// });

// API routes
app.use(`${process.env.API_PREFIX}`, apiRoutes);

// Database status route
// app.get(`${process.env.API_PREFIX}/health`, (req, res) => {
//   const dbConfig = DatabaseConfig.getInstance();
//   const dbStatus = dbConfig.getStatus();

//   res.json({
//     api: "healthy",
//     database: {
//       connected: dbStatus.isConnected,
//       readyState: dbStatus.readyState,
//       host: dbStatus.host,
//       name: dbStatus.name,
//     },
//     timestamp: new Date().toISOString(),
//   });
// });

// Error logging middleware
app.use(errorLoggingMiddleware);

async function startServer() {
  try {
    // Initialize database connection
    logger.info("🚀 Starting Pluto Koi Backend...");

    const dbConfig = DatabaseConfig.getInstance();
    await dbConfig.connect();

    // Seed default categories
    await seedCategories();

    // Initialize WebSocket service
    websocketService.initialize(httpServer);
    logger.info("🔌 WebSocket service ready");

    // Start the server
    httpServer.listen(port, () => {
      logger.info(`🌟 Server running on port ${port}`);
      logger.info(`🔌 WebSocket server ready for connections`);
      // logger.info(`📊 Health check available at http://localhost:${port}${process.env.API_PREFIX}/health`);
      // logger.info(`🔐 Auth endpoints: http://localhost:${port}${process.env.API_PREFIX}/auth`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server", { error: error instanceof Error ? error.message : error });
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");

  try {
    const dbConfig = DatabaseConfig.getInstance();
    await dbConfig.disconnect();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Error during graceful shutdown", { error });
  }

  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");

  try {
    const dbConfig = DatabaseConfig.getInstance();
    await dbConfig.disconnect();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Error during graceful shutdown", { error });
  }

  process.exit(0);
});

// Start the application
startServer();
