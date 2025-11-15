System.register(["../middleware/errorHandler.js", "../models/gallery-folder.model.js", "../models/gallery.model.js", "../utils/pagination.js"], function (exports_1, context_1) {
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
    var errorHandler_js_1, gallery_folder_model_js_1, gallery_model_js_1, pagination_js_1, GalleryFolderRepository, galleryFolderRepository;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (errorHandler_js_1_1) {
                errorHandler_js_1 = errorHandler_js_1_1;
            },
            function (gallery_folder_model_js_1_1) {
                gallery_folder_model_js_1 = gallery_folder_model_js_1_1;
            },
            function (gallery_model_js_1_1) {
                gallery_model_js_1 = gallery_model_js_1_1;
            },
            function (pagination_js_1_1) {
                pagination_js_1 = pagination_js_1_1;
            }
        ],
        execute: function () {
            GalleryFolderRepository = /** @class */ (function () {
                function GalleryFolderRepository() {
                }
                /**
                 * Create a new gallery folder
                 */
                GalleryFolderRepository.prototype.create = function (folderData) {
                    return __awaiter(this, void 0, void 0, function () {
                        var folder, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    folder = new gallery_folder_model_js_1.GalleryFolderModel(folderData);
                                    return [4 /*yield*/, folder.save()];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    error_1 = _a.sent();
                                    if (error_1.code === 11000) {
                                        throw new errorHandler_js_1.CustomErrorHandler(409, "Folder with this name already exists");
                                    }
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to create gallery folder");
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Find gallery folder by ID
                 */
                GalleryFolderRepository.prototype.findById = function (id) {
                    return __awaiter(this, void 0, void 0, function () {
                        var error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.findById(id)];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    error_2 = _a.sent();
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to find gallery folder by ID");
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Find gallery folder by name
                 */
                GalleryFolderRepository.prototype.findByName = function (folderName) {
                    return __awaiter(this, void 0, void 0, function () {
                        var error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.findOne({
                                            folderName: { $regex: new RegExp("^".concat(folderName, "$"), "i") },
                                        })];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    error_3 = _a.sent();
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to find gallery folder by name");
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Update gallery folder by ID
                 */
                GalleryFolderRepository.prototype.updateById = function (id, updateData) {
                    return __awaiter(this, void 0, void 0, function () {
                        var error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.findByIdAndUpdate(id, updateData, {
                                            new: true,
                                            runValidators: true,
                                        })];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    error_4 = _a.sent();
                                    if (error_4.code === 11000) {
                                        throw new errorHandler_js_1.CustomErrorHandler(409, "Folder with this name already exists");
                                    }
                                    if (error_4.message && error_4.message.includes("General folder")) {
                                        throw new errorHandler_js_1.CustomErrorHandler(400, error_4.message);
                                    }
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to update gallery folder");
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Delete gallery folder by ID (soft delete) and move galleries to General folder
                 */
                GalleryFolderRepository.prototype.deleteById = function (id) {
                    return __awaiter(this, void 0, void 0, function () {
                        var folder, result, error_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.findById(id)];
                                case 1:
                                    folder = _a.sent();
                                    if (!folder) {
                                        return [2 /*return*/, false];
                                    }
                                    if (folder.folderName === "General") {
                                        throw new errorHandler_js_1.CustomErrorHandler(400, "General folder cannot be deleted");
                                    }
                                    // Move all galleries from this folder to "General" folder
                                    return [4 /*yield*/, gallery_model_js_1.GalleryModel.updateMany({ folderName: folder.folderName }, { folderName: "General" })];
                                case 2:
                                    // Move all galleries from this folder to "General" folder
                                    _a.sent();
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.findByIdAndUpdate(id, { isActive: false }, { new: true })];
                                case 3:
                                    result = _a.sent();
                                    return [2 /*return*/, result !== null];
                                case 4:
                                    error_5 = _a.sent();
                                    if (error_5 instanceof errorHandler_js_1.CustomErrorHandler) {
                                        throw error_5;
                                    }
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to delete gallery folder");
                                case 5: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Hard delete gallery folder by ID and move galleries to General folder
                 */
                GalleryFolderRepository.prototype.hardDeleteById = function (id) {
                    return __awaiter(this, void 0, void 0, function () {
                        var folder, result, error_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.findById(id)];
                                case 1:
                                    folder = _a.sent();
                                    if (!folder) {
                                        return [2 /*return*/, false];
                                    }
                                    if (folder.folderName === "General") {
                                        throw new errorHandler_js_1.CustomErrorHandler(400, "General folder cannot be deleted");
                                    }
                                    // Move all galleries from this folder to "General" folder
                                    return [4 /*yield*/, gallery_model_js_1.GalleryModel.updateMany({ folderName: folder.folderName }, { folderName: "General" })];
                                case 2:
                                    // Move all galleries from this folder to "General" folder
                                    _a.sent();
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.findByIdAndDelete(id)];
                                case 3:
                                    result = _a.sent();
                                    return [2 /*return*/, result !== null];
                                case 4:
                                    error_6 = _a.sent();
                                    if (error_6 instanceof errorHandler_js_1.CustomErrorHandler) {
                                        throw error_6;
                                    }
                                    if (error_6.message && error_6.message.includes("General folder")) {
                                        throw new errorHandler_js_1.CustomErrorHandler(400, error_6.message);
                                    }
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to permanently delete gallery folder");
                                case 5: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Get all gallery folders with pagination and filtering
                 */
                GalleryFolderRepository.prototype.findAll = function () {
                    return __awaiter(this, arguments, void 0, function (page, limit, filters) {
                        var skip, query, total, folders, metadata, error_7;
                        if (page === void 0) { page = 1; }
                        if (limit === void 0) { limit = 10; }
                        if (filters === void 0) { filters = {}; }
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    skip = (page - 1) * limit;
                                    query = {};
                                    // Filter by active status
                                    if (filters.isActive !== undefined) {
                                        query.isActive = filters.isActive;
                                    }
                                    // Search by folder name or description
                                    if (filters.search) {
                                        query["$text"] = { $search: filters.search };
                                    }
                                    return [4 /*yield*/, Promise.all([gallery_folder_model_js_1.GalleryFolderModel.countDocuments(query)])];
                                case 1:
                                    total = (_a.sent())[0];
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)];
                                case 2:
                                    folders = _a.sent();
                                    metadata = pagination_js_1.paginationMetadata(page, limit, total);
                                    return [2 /*return*/, { folders: folders, metadata: metadata }];
                                case 3:
                                    error_7 = _a.sent();
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to fetch gallery folders");
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Get all active gallery folders (for dropdown/selection purposes)
                 */
                GalleryFolderRepository.prototype.findAllActive = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var error_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.find({ isActive: true }).sort({ folderName: 1 })];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    error_8 = _a.sent();
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to fetch active gallery folders");
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Get gallery folder statistics
                 */
                GalleryFolderRepository.prototype.getFolderStats = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, folderStats, galleryCountStats, stats, galleryCountData, error_9;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, Promise.all([
                                            gallery_folder_model_js_1.GalleryFolderModel.aggregate([
                                                {
                                                    $group: {
                                                        _id: null,
                                                        totalFolders: { $sum: 1 },
                                                        activeFolders: {
                                                            $sum: { $cond: ["$isActive", 1, 0] },
                                                        },
                                                        inactiveFolders: {
                                                            $sum: { $cond: ["$isActive", 0, 1] },
                                                        },
                                                    },
                                                },
                                            ]),
                                            gallery_model_js_1.GalleryModel.aggregate([
                                                {
                                                    $group: {
                                                        _id: "$folderName",
                                                        galleryCount: { $sum: 1 },
                                                    },
                                                },
                                                { $sort: { galleryCount: -1 } },
                                            ]),
                                        ])];
                                case 1:
                                    _a = _b.sent(), folderStats = _a[0], galleryCountStats = _a[1];
                                    stats = folderStats[0] || {
                                        totalFolders: 0,
                                        activeFolders: 0,
                                        inactiveFolders: 0,
                                    };
                                    galleryCountData = galleryCountStats.map(function (item) { return ({
                                        folderName: item._id,
                                        galleryCount: item.galleryCount,
                                    }); });
                                    return [2 /*return*/, {
                                            totalFolders: stats.totalFolders,
                                            activeFolders: stats.activeFolders,
                                            inactiveFolders: stats.inactiveFolders,
                                            foldersWithGalleryCount: galleryCountData,
                                        }];
                                case 2:
                                    error_9 = _b.sent();
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to get gallery folder statistics");
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Check if gallery folder exists by name
                 */
                GalleryFolderRepository.prototype.existsByName = function (folderName, excludeId) {
                    return __awaiter(this, void 0, void 0, function () {
                        var query, folder, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    query = {
                                        folderName: { $regex: new RegExp("^".concat(folderName, "$"), "i") },
                                    };
                                    if (excludeId) {
                                        query._id = { $ne: excludeId };
                                    }
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.findOne(query)];
                                case 1:
                                    folder = _a.sent();
                                    return [2 /*return*/, folder !== null];
                                case 2:
                                    error_10 = _a.sent();
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to check gallery folder existence");
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Ensure General folder exists in database
                 */
                GalleryFolderRepository.prototype.ensureGeneralFolderExists = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var generalFolder, updatedFolder, error_11;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 6, , 7]);
                                    return [4 /*yield*/, this.findByName("General")];
                                case 1:
                                    generalFolder = _a.sent();
                                    if (!!generalFolder) return [3 /*break*/, 3];
                                    return [4 /*yield*/, this.create({
                                            folderName: "General",
                                            description: "Default folder for galleries",
                                            isActive: true,
                                        })];
                                case 2:
                                    generalFolder = _a.sent();
                                    return [3 /*break*/, 5];
                                case 3:
                                    if (!!generalFolder.isActive) return [3 /*break*/, 5];
                                    return [4 /*yield*/, this.updateById(generalFolder.id, {
                                            isActive: true,
                                        })];
                                case 4:
                                    updatedFolder = _a.sent();
                                    generalFolder = updatedFolder || generalFolder;
                                    _a.label = 5;
                                case 5: return [2 /*return*/, generalFolder];
                                case 6:
                                    error_11 = _a.sent();
                                    if (error_11 instanceof errorHandler_js_1.CustomErrorHandler) {
                                        throw error_11;
                                    }
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to ensure General folder exists");
                                case 7: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Search gallery folders by name or description
                 */
                GalleryFolderRepository.prototype.searchFolders = function (searchTerm) {
                    return __awaiter(this, void 0, void 0, function () {
                        var error_12;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.find({
                                            $or: [{ folderName: { $regex: searchTerm, $options: "i" } }, { description: { $regex: searchTerm, $options: "i" } }],
                                            isActive: true,
                                        }).sort({ folderName: 1 })];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    error_12 = _a.sent();
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to search gallery folders");
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Get gallery folders with gallery count
                 */
                GalleryFolderRepository.prototype.getFoldersWithGalleryCount = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var error_13;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, gallery_folder_model_js_1.GalleryFolderModel.aggregate([
                                            {
                                                $match: { isActive: true },
                                            },
                                            {
                                                $lookup: {
                                                    from: "galleries",
                                                    localField: "folderName",
                                                    foreignField: "folderName",
                                                    as: "galleries",
                                                },
                                            },
                                            {
                                                $addFields: {
                                                    galleryCount: { $size: "$galleries" },
                                                },
                                            },
                                            {
                                                $project: {
                                                    galleries: 0, // Remove the actual gallery data, keep only count
                                                },
                                            },
                                            {
                                                $sort: { galleryCount: -1, folderName: 1 },
                                            },
                                        ])];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    error_13 = _a.sent();
                                    throw new errorHandler_js_1.CustomErrorHandler(500, "Failed to get gallery folders with gallery count");
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                return GalleryFolderRepository;
            }());
            exports_1("GalleryFolderRepository", GalleryFolderRepository);
            exports_1("galleryFolderRepository", galleryFolderRepository = new GalleryFolderRepository());
        }
    };
});
