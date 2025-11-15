import DatabaseConfig from "../config/database.js";
import { galleryFolderSeeder } from "./gallery-folder-seeder.js";

/**
 * Standalone migration script for gallery folders
 * This script can be run independently to migrate existing data
 */
async function runGalleryFolderMigration() {
  let database: DatabaseConfig | null = null;

  try {
    console.log("🚀 Starting Gallery Folder Migration Script");
    console.log("==========================================");

    // Connect to database
    console.log("📡 Connecting to database...");
    database = DatabaseConfig.getInstance();
    await database.connect();
    console.log("✅ Database connected successfully");

    // Get migration status first
    console.log("\n📋 Checking migration status...");
    const status = await galleryFolderSeeder.getMigrationStatus();

    console.log(`📊 Migration Status:`);
    console.log(`   - General folder exists: ${status.generalFolderExists ? "✅" : "❌"}`);
    console.log(`   - Total galleries: ${status.totalGalleries}`);
    console.log(`   - Galleries needing migration: ${status.galleriesNeedingMigration}`);
    console.log(`   - Migration needed: ${status.migrationNeeded ? "YES" : "NO"}`);

    if (!status.migrationNeeded) {
      console.log("\n🎉 No migration needed! Everything is already up to date.");
      process.exit(0);
    }

    // Run migration
    console.log("\n🔄 Running migration...");
    const migrationResult = await galleryFolderSeeder.runMigration();

    console.log("\n📊 Migration Results:");
    console.log(`   - General folder created: ${migrationResult.generalFolderCreated ? "✅" : "❌"}`);
    console.log(`   - Total galleries: ${migrationResult.totalGalleries}`);
    console.log(`   - Migrated galleries: ${migrationResult.migratedCount}`);

    // Validate migration
    console.log("\n🔍 Validating migration...");
    const validation = await galleryFolderSeeder.validateMigration();

    if (validation.isValid) {
      console.log("✅ Migration validation passed!");
    } else {
      console.log("❌ Migration validation failed!");
      console.log(`   - Galleries still without folder: ${validation.galleriesWithoutFolder}`);
      if (validation.invalidGalleries.length > 0) {
        console.log("   - Invalid galleries:");
        validation.invalidGalleries.forEach((gallery, index) => {
          console.log(`     ${index + 1}. ${gallery.galleryName} (ID: ${gallery._id})`);
        });
      }
    }

    console.log("\n🎉 Migration script completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration script failed:");
    console.error(error);
    process.exit(1);
  } finally {
    if (database && database.isConnected()) {
      console.log("\n📡 Closing database connection...");
      await database.disconnect();
    }
    process.exit(0);
  }
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runGalleryFolderMigration().catch((error) => {
    console.error("❌ Unhandled error in migration script:", error);
    process.exit(1);
  });
}

export { runGalleryFolderMigration };
