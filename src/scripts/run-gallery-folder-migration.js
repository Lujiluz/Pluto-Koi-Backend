System.register(["../config/database.js", "./gallery-folder-seeder.js"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
        return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var database_js_1, gallery_folder_seeder_js_1;
    var __moduleName = context_1 && context_1.id;
    /**
     * Standalone migration script for gallery folders
     * This script can be run independently to migrate existing data
     */
    function runGalleryFolderMigration() {
        return __awaiter(this, void 0, void 0, function () {
            var database, status_1, migrationResult, validation, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        database = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 10]);
                        console.log("🚀 Starting Gallery Folder Migration Script");
                        console.log("==========================================");
                        // Connect to database
                        console.log("📡 Connecting to database...");
                        database = database_js_1.default.getInstance();
                        return [4 /*yield*/, database.connect()];
                    case 2:
                        _a.sent();
                        console.log("✅ Database connected successfully");
                        // Get migration status first
                        console.log("\n📋 Checking migration status...");
                        return [4 /*yield*/, gallery_folder_seeder_js_1.galleryFolderSeeder.getMigrationStatus()];
                    case 3:
                        status_1 = _a.sent();
                        console.log("\uD83D\uDCCA Migration Status:");
                        console.log("   - General folder exists: ".concat(status_1.generalFolderExists ? "✅" : "❌"));
                        console.log("   - Total galleries: ".concat(status_1.totalGalleries));
                        console.log("   - Galleries needing migration: ".concat(status_1.galleriesNeedingMigration));
                        console.log("   - Migration needed: ".concat(status_1.migrationNeeded ? "YES" : "NO"));
                        if (!status_1.migrationNeeded) {
                            console.log("\n🎉 No migration needed! Everything is already up to date.");
                            process.exit(0);
                        }
                        // Run migration
                        console.log("\n🔄 Running migration...");
                        return [4 /*yield*/, gallery_folder_seeder_js_1.galleryFolderSeeder.runMigration()];
                    case 4:
                        migrationResult = _a.sent();
                        console.log("\n📊 Migration Results:");
                        console.log("   - General folder created: ".concat(migrationResult.generalFolderCreated ? "✅" : "❌"));
                        console.log("   - Total galleries: ".concat(migrationResult.totalGalleries));
                        console.log("   - Migrated galleries: ".concat(migrationResult.migratedCount));
                        // Validate migration
                        console.log("\n🔍 Validating migration...");
                        return [4 /*yield*/, gallery_folder_seeder_js_1.galleryFolderSeeder.validateMigration()];
                    case 5:
                        validation = _a.sent();
                        if (validation.isValid) {
                            console.log("✅ Migration validation passed!");
                        }
                        else {
                            console.log("❌ Migration validation failed!");
                            console.log("   - Galleries still without folder: ".concat(validation.galleriesWithoutFolder));
                            if (validation.invalidGalleries.length > 0) {
                                console.log("   - Invalid galleries:");
                                validation.invalidGalleries.forEach(function (gallery, index) {
                                    console.log("     ".concat(index + 1, ". ").concat(gallery.galleryName, " (ID: ").concat(gallery._id, ")"));
                                });
                            }
                        }
                        console.log("\n🎉 Migration script completed successfully!");
                        return [3 /*break*/, 10];
                    case 6:
                        error_1 = _a.sent();
                        console.error("\n❌ Migration script failed:");
                        console.error(error_1);
                        process.exit(1);
                        return [3 /*break*/, 10];
                    case 7:
                        if (!(database && database.isConnected())) return [3 /*break*/, 9];
                        console.log("\n📡 Closing database connection...");
                        return [4 /*yield*/, database.disconnect()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        process.exit(0);
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    }
    exports_1("runGalleryFolderMigration", runGalleryFolderMigration);
    return {
        setters: [
            function (database_js_1_1) {
                database_js_1 = database_js_1_1;
            },
            function (gallery_folder_seeder_js_1_1) {
                gallery_folder_seeder_js_1 = gallery_folder_seeder_js_1_1;
            }
        ],
        execute: function () {
            // Check if this script is being run directly
            if (context_1.meta.url === "file://".concat(process.argv[1])) {
                runGalleryFolderMigration().catch(function (error) {
                    console.error("❌ Unhandled error in migration script:", error);
                    process.exit(1);
                });
            }
        }
    };
});
