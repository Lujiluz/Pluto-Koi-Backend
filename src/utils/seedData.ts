import { CategoryModel } from "../models/category.model.js";
import { DEFAULT_CATEGORIES } from "../utils/constants.js";
import { seedUserAddresses } from "./userAddressSeeder.js";

/**
 * Seed default categories if they don't exist
 */
export async function seedCategories(): Promise<void> {
  try {
    console.log("🌱 Seeding categories...");

    for (const categoryName of DEFAULT_CATEGORIES) {
      const existingCategory = await CategoryModel.findOne({ name: categoryName });

      if (!existingCategory) {
        await CategoryModel.create({
          name: categoryName,
          description: `Default category: ${categoryName}`,
          isActive: true,
        });
        console.log(`✅ Created category: ${categoryName}`);
      } else {
        console.log(`ℹ️  Category already exists: ${categoryName}`);
      }
    }

    console.log("✅ Categories seeding completed");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
}

/**
 * Get category ID by name (helper function)
 */
export async function getCategoryIdByName(categoryName: string): Promise<string | null> {
  try {
    const category = await CategoryModel.findOne({ name: categoryName, isActive: true });
    return category ? (category._id as any).toString() : null;
  } catch (error) {
    console.error("Error getting category by name:", error);
    return null;
  }
}

/**
 * Run all seeders
 */
export async function runAllSeeders(): Promise<void> {
  try {
    console.log("🌱 Starting all seeders...");

    await seedCategories();
    await seedUserAddresses();

    console.log("✅ All seeders completed successfully!");
  } catch (error) {
    console.error("❌ Error running seeders:", error);
    throw error;
  }
}
