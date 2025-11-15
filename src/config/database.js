System.register(["mongoose", "../utils/database.js"], function (exports_1, context_1) {
    "use strict";
    var __assign = (this && this.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
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
    var mongoose_1, database_js_1, DatabaseConfig;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (mongoose_1_1) {
                mongoose_1 = mongoose_1_1;
            },
            function (database_js_1_1) {
                database_js_1 = database_js_1_1;
            }
        ],
        execute: function () {
            DatabaseConfig = /** @class */ (function () {
                function DatabaseConfig() {
                    this.mongoose = null; // Will be dynamically imported
                    this.isInitialized = false;
                    this.connectionString = process.env.MONGO_URI || "";
                    if (!this.connectionString) {
                        throw new database_js_1.DatabaseError("MONGO_URI environment variable is not defined");
                    }
                }
                DatabaseConfig.getInstance = function () {
                    if (!DatabaseConfig.instance) {
                        DatabaseConfig.instance = new DatabaseConfig();
                    }
                    return DatabaseConfig.instance;
                };
                DatabaseConfig.prototype.initializeMongoose = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (this.isInitialized)
                                return [2 /*return*/];
                            try {
                                // Dynamic import to handle missing mongoose dependency gracefully
                                this.mongoose = mongoose_1.default;
                                this.isInitialized = true;
                            }
                            catch (error) {
                                throw new database_js_1.DatabaseError("Mongoose is not installed. Please run: npm install mongoose @types/mongoose", error);
                            }
                            return [2 /*return*/];
                        });
                    });
                };
                DatabaseConfig.prototype.connect = function () {
                    return __awaiter(this, arguments, void 0, function (options) {
                        var connectionOptions, connectFn;
                        var _this = this;
                        if (options === void 0) { options = {}; }
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.initializeMongoose()];
                                case 1:
                                    _a.sent();
                                    connectionOptions = __assign(__assign({}, database_js_1.defaultConnectionOptions), options);
                                    connectFn = function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    console.log("🔌 Connecting to MongoDB...");
                                                    return [4 /*yield*/, this.mongoose.connect(this.connectionString, connectionOptions)];
                                                case 1:
                                                    _a.sent();
                                                    console.log("✅ Successfully connected to MongoDB");
                                                    this.setupConnectionEventHandlers();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); };
                                    return [4 /*yield*/, database_js_1.ConnectionManager.retryConnection(connectFn)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                DatabaseConfig.prototype.setupConnectionEventHandlers = function () {
                    var _this = this;
                    if (!this.mongoose)
                        return;
                    // Handle connection events
                    this.mongoose.connection.on("error", function (error) {
                        console.error("❌ MongoDB connection error:", error.message);
                    });
                    this.mongoose.connection.on("disconnected", function () {
                        console.warn("⚠️ MongoDB disconnected");
                    });
                    this.mongoose.connection.on("reconnected", function () {
                        console.log("✅ MongoDB reconnected");
                    });
                    // Graceful shutdown handling
                    process.on("SIGINT", function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.disconnect()];
                                case 1:
                                    _a.sent();
                                    process.exit(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    process.on("SIGTERM", function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.disconnect()];
                                case 1:
                                    _a.sent();
                                    process.exit(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                };
                DatabaseConfig.prototype.disconnect = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!this.mongoose)
                                        return [2 /*return*/];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, this.mongoose.disconnect()];
                                case 2:
                                    _a.sent();
                                    console.log("📤 Disconnected from MongoDB");
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _a.sent();
                                    console.error("❌ Error disconnecting from MongoDB:", error_1);
                                    throw new database_js_1.DatabaseError("Failed to disconnect from MongoDB", error_1);
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                };
                DatabaseConfig.prototype.getConnection = function () {
                    if (!this.mongoose) {
                        throw new database_js_1.DatabaseError("MongoDB connection not initialized");
                    }
                    return this.mongoose.connection;
                };
                DatabaseConfig.prototype.getStatus = function () {
                    if (!this.mongoose) {
                        return { isConnected: false, readyState: 0 };
                    }
                    var connection = this.mongoose.connection;
                    return {
                        isConnected: connection.readyState === 1,
                        readyState: connection.readyState,
                        host: connection.host,
                        name: connection.name,
                    };
                };
                DatabaseConfig.prototype.isConnected = function () {
                    return this.getStatus().isConnected;
                };
                return DatabaseConfig;
            }());
            exports_1("DatabaseConfig", DatabaseConfig);
            exports_1("default", DatabaseConfig);
        }
    };
});
