import { galleryFolderRepository } from "../repository/gallery-folder.repository.js";
import { GalleryModel } from "../models/gallery.model.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";

export class GalleryFolderSeeder {
  /**
   * Ensure General folder exists in the database
   */
  async ensureGeneralFolderExists(): Promise<void> {
    try {
      console.log("🔍 Checking if General folder exists...");

      await galleryFolderRepository.ensureGeneralFolderExists();

      console.log("✅ General folder ensured successfully");
    } catch (error) {
      console.error("❌ Error ensuring General folder exists:", error);
      throw new CustomErrorHandler(500, "Failed to ensure General folder exists");
    }
  }

  /**
   * Migrate existing gallery documents to include folderName field
   * Sets folderName to 'General' for galleries that don't have this field
   */
  async migrateExistingGalleries(): Promise<{ migratedCount: number; totalGalleries: number }> {
    try {
      console.log("🔍 Starting gallery migration...");

      // Count total galleries
      const totalGalleries = await GalleryModel.countDocuments();
      console.log(`📊 Total galleries in database: ${totalGalleries}`);

      // Find galleries without folderName field or with null/undefined folderName
      const galleriesWithoutFolder = await GalleryModel.find({
        $or: [{ folderName: { $exists: false } }, { folderName: null }, { folderName: undefined }, { folderName: "" }],
      });

      console.log(`📊 Galleries needing migration: ${galleriesWithoutFolder.length}`);

      if (galleriesWithoutFolder.length === 0) {
        console.log("✅ No galleries need migration");
        return { migratedCount: 0, totalGalleries };
      }

      // Update galleries to have General folder
      const updateResult = await GalleryModel.updateMany(
        {
          $or: [{ folderName: { $exists: false } }, { folderName: null }, { folderName: undefined }, { folderName: "" }],
        },
        {
          $set: { folderName: "General" },
        }
      );

      console.log(`✅ Migration completed successfully`);
      console.log(`📊 Galleries migrated: ${updateResult.modifiedCount}`);

      return {
        migratedCount: updateResult.modifiedCount,
        totalGalleries,
      };
    } catch (error) {
      console.error("❌ Error migrating existing galleries:", error);
      throw new CustomErrorHandler(500, "Failed to migrate existing galleries");
    }
  }

  /**
   * Run complete migration process
   * 1. Ensure General folder exists
   * 2. Migrate existing galleries
   */
  async runMigration(): Promise<{
    generalFolderCreated: boolean;
    migratedCount: number;
    totalGalleries: number;
  }> {
    try {
      console.log("🚀 Starting complete gallery folder migration...");

      // Step 1: Ensure General folder exists
      await this.ensureGeneralFolderExists();

      // Step 2: Migrate existing galleries
      const migrationResult = await this.migrateExistingGalleries();

      console.log("🎉 Complete migration finished successfully");
      console.log(`📊 Summary:`);
      console.log(`   - Total galleries: ${migrationResult.totalGalleries}`);
      console.log(`   - Migrated galleries: ${migrationResult.migratedCount}`);

      return {
        generalFolderCreated: true,
        migratedCount: migrationResult.migratedCount,
        totalGalleries: migrationResult.totalGalleries,
      };
    } catch (error) {
      console.error("❌ Error running complete migration:", error);
      throw error;
    }
  }

  /**
   * Validate migration (check that all galleries have a valid folderName)
   */
  async validateMigration(): Promise<{
    isValid: boolean;
    totalGalleries: number;
    galleriesWithFolder: number;
    galleriesWithoutFolder: number;
    invalidGalleries: any[];
  }> {
    try {
      console.log("🔍 Validating migration...");

      const totalGalleries = await GalleryModel.countDocuments();

      const galleriesWithFolder = await GalleryModel.countDocuments({
        folderName: { $exists: true, $nin: [null, "", undefined] },
      });

      const galleriesWithoutFolder = await GalleryModel.find({
        $or: [{ folderName: { $exists: false } }, { folderName: null }, { folderName: undefined }, { folderName: "" }],
      }).select("_id galleryName owner folderName");

      const isValid = galleriesWithoutFolder.length === 0;

      console.log(`📊 Migration validation results:`);
      console.log(`   - Total galleries: ${totalGalleries}`);
      console.log(`   - Galleries with folder: ${galleriesWithFolder}`);
      console.log(`   - Galleries without folder: ${galleriesWithoutFolder.length}`);
      console.log(`   - Migration valid: ${isValid ? "✅" : "❌"}`);

      return {
        isValid,
        totalGalleries,
        galleriesWithFolder,
        galleriesWithoutFolder: galleriesWithoutFolder.length,
        invalidGalleries: galleriesWithoutFolder,
      };
    } catch (error) {
      console.error("❌ Error validating migration:", error);
      throw new CustomErrorHandler(500, "Failed to validate migration");
    }
  }

  /**
   * Get migration status without running migration
   */
  async getMigrationStatus(): Promise<{
    generalFolderExists: boolean;
    totalGalleries: number;
    galleriesNeedingMigration: number;
    migrationNeeded: boolean;
  }> {
    try {
      // Check if General folder exists
      const generalFolder = await galleryFolderRepository.findByName("General");
      const generalFolderExists = generalFolder !== null;

      // Count galleries
      const totalGalleries = await GalleryModel.countDocuments();

      const galleriesNeedingMigration = await GalleryModel.countDocuments({
        $or: [{ folderName: { $exists: false } }, { folderName: null }, { folderName: undefined }, { folderName: "" }],
      });

      const migrationNeeded = !generalFolderExists || galleriesNeedingMigration > 0;

      return {
        generalFolderExists,
        totalGalleries,
        galleriesNeedingMigration,
        migrationNeeded,
      };
    } catch (error) {
      console.error("❌ Error getting migration status:", error);
      throw new CustomErrorHandler(500, "Failed to get migration status");
    }
  }
}

export const galleryFolderSeeder = new GalleryFolderSeeder();
