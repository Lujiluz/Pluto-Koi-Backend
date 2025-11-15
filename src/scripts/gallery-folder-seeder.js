System.register(["../repository/gallery-folder.repository.js", "../models/gallery.model.js", "../middleware/errorHandler.js"], function (exports_1, context_1) {
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
    var gallery_folder_repository_js_1, gallery_model_js_1, errorHandler_js_1, GalleryFolderSeeder, galleryFolderSeeder;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (gallery_folder_repository_js_1_1) {
                gallery_folder_repository_js_1 = gallery_folder_repository_js_1_1;
            },
            function (gallery_model_js_1_1) {
                gallery_model_js_1 = gallery_model_js_1_1;
            },
            function (errorHandler_js_1_1) {
                errorHandler_js_1 = errorHandler_js_1_1;
            }
        ],
        execute: function () {
            GalleryFolderSeeder = /** @class */ (function () {
                function GalleryFolderSeeder() {
                }
                /**
                 * Ensure General folder exists in the database
                 */
                GalleryFolderSeeder.prototype.ensureGeneralFolderExists = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    console.log("🔍 Checking if General folder exists...");
                                    return [4 /*yield*/, gallery_folder_repository_js_1.galleryFolderRepository.ensureGeneralFolderExists()];
                                case 1:
                                    _a.sent();
                                    console.log("✅ General folder ensured successfully");
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_1 = _a.sent();
                                    console.error("❌ Error ensuring General folder exists:", error_1);
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to ensure General folder exists");
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Migrate existing gallery documents to include folderName field
                 * Sets folderName to 'General' for galleries that don't have this field
                 */
                GalleryFolderSeeder.prototype.migrateExistingGalleries = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var totalGalleries, galleriesWithoutFolder, updateResult, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    console.log("🔍 Starting gallery migration...");
                                    return [4 /*yield*/, gallery_model_js_1.GalleryModel.countDocuments()];
                                case 1:
                                    totalGalleries = _a.sent();
                                    console.log("\uD83D\uDCCA Total galleries in database: ".concat(totalGalleries));
                                    return [4 /*yield*/, gallery_model_js_1.GalleryModel.find({
                                            $or: [{ folderName: { $exists: false } }, { folderName: null }, { folderName: undefined }, { folderName: "" }],
                                        })];
                                case 2:
                                    galleriesWithoutFolder = _a.sent();
                                    console.log("\uD83D\uDCCA Galleries needing migration: ".concat(galleriesWithoutFolder.length));
                                    if (galleriesWithoutFolder.length === 0) {
                                        console.log("✅ No galleries need migration");
                                        return [2 /*return*/, { migratedCount: 0, totalGalleries: totalGalleries }];
                                    }
                                    return [4 /*yield*/, gallery_model_js_1.GalleryModel.updateMany({
                                            $or: [{ folderName: { $exists: false } }, { folderName: null }, { folderName: undefined }, { folderName: "" }],
                                        }, {
                                            $set: { folderName: "General" },
                                        })];
                                case 3:
                                    updateResult = _a.sent();
                                    console.log("\u2705 Migration completed successfully");
                                    console.log("\uD83D\uDCCA Galleries migrated: ".concat(updateResult.modifiedCount));
                                    return [2 /*return*/, {
                                            migratedCount: updateResult.modifiedCount,
                                            totalGalleries: totalGalleries,
                                        }];
                                case 4:
                                    error_2 = _a.sent();
                                    console.error("❌ Error migrating existing galleries:", error_2);
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to migrate existing galleries");
                                case 5: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Run complete migration process
                 * 1. Ensure General folder exists
                 * 2. Migrate existing galleries
                 */
                GalleryFolderSeeder.prototype.runMigration = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var migrationResult, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    console.log("🚀 Starting complete gallery folder migration...");
                                    // Step 1: Ensure General folder exists
                                    return [4 /*yield*/, this.ensureGeneralFolderExists()];
                                case 1:
                                    // Step 1: Ensure General folder exists
                                    _a.sent();
                                    return [4 /*yield*/, this.migrateExistingGalleries()];
                                case 2:
                                    migrationResult = _a.sent();
                                    console.log("🎉 Complete migration finished successfully");
                                    console.log("\uD83D\uDCCA Summary:");
                                    console.log("   - Total galleries: ".concat(migrationResult.totalGalleries));
                                    console.log("   - Migrated galleries: ".concat(migrationResult.migratedCount));
                                    return [2 /*return*/, {
                                            generalFolderCreated: true,
                                            migratedCount: migrationResult.migratedCount,
                                            totalGalleries: migrationResult.totalGalleries,
                                        }];
                                case 3:
                                    error_3 = _a.sent();
                                    console.error("❌ Error running complete migration:", error_3);
                                    throw error_3;
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Validate migration (check that all galleries have a valid folderName)
                 */
                GalleryFolderSeeder.prototype.validateMigration = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var totalGalleries, galleriesWithFolder, galleriesWithoutFolder, isValid, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    console.log("🔍 Validating migration...");
                                    return [4 /*yield*/, gallery_model_js_1.GalleryModel.countDocuments()];
                                case 1:
                                    totalGalleries = _a.sent();
                                    return [4 /*yield*/, gallery_model_js_1.GalleryModel.countDocuments({
                                            folderName: { $exists: true, $nin: [null, "", undefined] },
                                        })];
                                case 2:
                                    galleriesWithFolder = _a.sent();
                                    return [4 /*yield*/, gallery_model_js_1.GalleryModel.find({
                                            $or: [{ folderName: { $exists: false } }, { folderName: null }, { folderName: undefined }, { folderName: "" }],
                                        }).select("_id galleryName owner folderName")];
                                case 3:
                                    galleriesWithoutFolder = _a.sent();
                                    isValid = galleriesWithoutFolder.length === 0;
                                    console.log("\uD83D\uDCCA Migration validation results:");
                                    console.log("   - Total galleries: ".concat(totalGalleries));
                                    console.log("   - Galleries with folder: ".concat(galleriesWithFolder));
                                    console.log("   - Galleries without folder: ".concat(galleriesWithoutFolder.length));
                                    console.log("   - Migration valid: ".concat(isValid ? "✅" : "❌"));
                                    return [2 /*return*/, {
                                            isValid: isValid,
                                            totalGalleries: totalGalleries,
                                            galleriesWithFolder: galleriesWithFolder,
                                            galleriesWithoutFolder: galleriesWithoutFolder.length,
                                            invalidGalleries: galleriesWithoutFolder,
                                        }];
                                case 4:
                                    error_4 = _a.sent();
                                    console.error("❌ Error validating migration:", error_4);
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to validate migration");
                                case 5: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Get migration status without running migration
                 */
                GalleryFolderSeeder.prototype.getMigrationStatus = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var generalFolder, generalFolderExists, totalGalleries, galleriesNeedingMigration, migrationNeeded, error_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, gallery_folder_repository_js_1.galleryFolderRepository.findByName("General")];
                                case 1:
                                    generalFolder = _a.sent();
                                    generalFolderExists = generalFolder !== null;
                                    return [4 /*yield*/, gallery_model_js_1.GalleryModel.countDocuments()];
                                case 2:
                                    totalGalleries = _a.sent();
                                    return [4 /*yield*/, gallery_model_js_1.GalleryModel.countDocuments({
                                            $or: [{ folderName: { $exists: false } }, { folderName: null }, { folderName: undefined }, { folderName: "" }],
                                        })];
                                case 3:
                                    galleriesNeedingMigration = _a.sent();
                                    migrationNeeded = !generalFolderExists || galleriesNeedingMigration > 0;
                                    return [2 /*return*/, {
                                            generalFolderExists: generalFolderExists,
                                            totalGalleries: totalGalleries,
                                            galleriesNeedingMigration: galleriesNeedingMigration,
                                            migrationNeeded: migrationNeeded,
                                        }];
                                case 4:
                                    error_5 = _a.sent();
                                    console.error("❌ Error getting migration status:", error_5);
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to get migration status");
                                case 5: return [2 /*return*/];
                            }
                        });
                    });
                };
                return GalleryFolderSeeder;
            }());
            exports_1("GalleryFolderSeeder", GalleryFolderSeeder);
            exports_1("galleryFolderSeeder", galleryFolderSeeder = new GalleryFolderSeeder());
        }
    };
});
