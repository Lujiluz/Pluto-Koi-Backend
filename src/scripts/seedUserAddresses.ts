#!/usr/bin/env node

import mongoose from "mongoose";
import { config } from "dotenv";
import { seedUserAddresses, listUsersWithoutAddresses, seedAddressForUser } from "../utils/userAddressSeeder.js";

// Load environment variables
config();

/**
 * Connect to MongoDB
 */
async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.DB_URI || "mongodb://localhost:27017/pluto-koi";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
  }
}

/**
 * Main function to run the seeder
 */
async function main(): Promise<void> {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case "seed":
        await seedUserAddresses();
        break;

      case "list":
        await listUsersWithoutAddresses();
        break;

      case "seed-user":
        const email = args[1];
        if (!email) {
          console.error("❌ Please provide an email address: npm run seed:user-address seed-user user@example.com");
          process.exit(1);
        }
        await seedAddressForUser(email);
        break;

      default:
        console.log("📋 Available commands:");
        console.log("  seed       - Seed addresses for all users without addresses");
        console.log("  list       - List users without addresses");
        console.log("  seed-user  - Seed address for specific user by email");
        console.log("");
        console.log("📝 Usage examples:");
        console.log("  npm run seed:user-address seed");
        console.log("  npm run seed:user-address list");
        console.log("  npm run seed:user-address seed-user user@example.com");
        break;
    }
  } catch (error) {
    console.error("❌ Seeder failed:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Run the main function
main();
