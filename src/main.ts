import express from "express";
import { DatabaseConfig } from "#config/database.js";

const app = express();
const port = process.env.PORT ?? "3000";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Pluto Koi Backend API",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Database status route
app.get("/api/health", (req, res) => {
  const dbConfig = DatabaseConfig.getInstance();
  const dbStatus = dbConfig.getStatus();

  res.json({
    api: "healthy",
    database: {
      connected: dbStatus.isConnected,
      readyState: dbStatus.readyState,
      host: dbStatus.host,
      name: dbStatus.name,
    },
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  try {
    // Initialize database connection
    console.log("🚀 Starting Pluto Koi Backend...");

    const dbConfig = DatabaseConfig.getInstance();
    await dbConfig.connect();

    // Start the server
    app.listen(port, () => {
      console.log(`🌟 Server running on port ${port}`);
      console.log(`📊 Health check available at http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start the application
startServer();
