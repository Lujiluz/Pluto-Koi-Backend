// Note: You'll need to install mongoose first: npm install mongoose @types/mongoose
import mongoose from "mongoose";
import { DatabaseConnectionOptions, DatabaseStatus, DatabaseError, ConnectionManager, defaultConnectionOptions } from "../utils/database.js";

export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private connectionString: string;
  private mongoose: any = null; // Will be dynamically imported
  private isInitialized = false;

  private constructor() {
    this.connectionString = process.env.MONGO_URI || "";
    if (!this.connectionString) {
      throw new DatabaseError("MONGO_URI environment variable is not defined");
    }
  }

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  private async initializeMongoose(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamic import to handle missing mongoose dependency gracefully
      this.mongoose = mongoose;
      this.isInitialized = true;
    } catch (error) {
      throw new DatabaseError("Mongoose is not installed. Please run: npm install mongoose @types/mongoose", error as Error);
    }
  }

  public async connect(options: DatabaseConnectionOptions = {}): Promise<void> {
    await this.initializeMongoose();

    const connectionOptions = { ...defaultConnectionOptions, ...options };

    const connectFn = async () => {
      console.log("🔌 Connecting to MongoDB...");

      await this.mongoose.connect(this.connectionString, connectionOptions);

      console.log("✅ Successfully connected to MongoDB");
      this.setupConnectionEventHandlers();
    };

    await ConnectionManager.retryConnection(connectFn);
  }

  private setupConnectionEventHandlers(): void {
    if (!this.mongoose) return;

    // Handle connection events
    this.mongoose.connection.on("error", (error: Error) => {
      console.error("❌ MongoDB connection error:", error.message);
    });

    this.mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    this.mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  public async disconnect(): Promise<void> {
    if (!this.mongoose) return;

    try {
      await this.mongoose.disconnect();
      console.log("📤 Disconnected from MongoDB");
    } catch (error) {
      console.error("❌ Error disconnecting from MongoDB:", error);
      throw new DatabaseError("Failed to disconnect from MongoDB", error as Error);
    }
  }

  public getConnection(): any {
    if (!this.mongoose) {
      throw new DatabaseError("MongoDB connection not initialized");
    }
    return this.mongoose.connection;
  }

  public getStatus(): DatabaseStatus {
    if (!this.mongoose) {
      return { isConnected: false, readyState: 0 };
    }

    const connection = this.mongoose.connection;
    return {
      isConnected: connection.readyState === 1,
      readyState: connection.readyState,
      host: connection.host,
      name: connection.name,
    };
  }

  public isConnected(): boolean {
    return this.getStatus().isConnected;
  }
}

export default DatabaseConfig;
