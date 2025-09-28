import express from "express";
import { DatabaseConfig } from "#config/database.js";
import apiRoutes from "#routes/index.js";

const app = express();
const port = process.env.PORT ?? "3000";

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS middleware (if needed)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Pluto Koi Backend API",
    status: "running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      health: "/api/health",
    },
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use(`${process.env.API_PREFIX}`, apiRoutes);

// Database status route
app.get("/health", (req, res) => {
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
      console.log(`📊 Health check available at http://localhost:${port}${process.env.API_PREFIX}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${port}${process.env.API_PREFIX}/auth`);
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
