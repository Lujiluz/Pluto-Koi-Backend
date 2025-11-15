System.register([], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var CustomErrorHandler, errorHandler;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            CustomErrorHandler = /** @class */ (function (_super) {
                __extends(CustomErrorHandler, _super);
                function CustomErrorHandler(statusCode, message) {
                    var _this = _super.call(this) || this;
                    _this.statusCode = statusCode;
                    _this.message = message;
                    return _this;
                }
                return CustomErrorHandler;
            }(Error));
            exports_1("CustomErrorHandler", CustomErrorHandler);
            errorHandler = function (err, req, res, next) {
                var statusCode = err.statusCode, message = err.message;
                res.status(statusCode || 500).json({
                    status: 'error',
                    statusCode: statusCode,
                    message: message
                });
            };
            exports_1("errorHandler", errorHandler);
        }
    };
});
