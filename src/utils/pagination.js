System.register([], function (exports_1, context_1) {
    "use strict";
    var paginationMetadata;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            exports_1("paginationMetadata", paginationMetadata = function (page, limit, totalItems) {
                var totalPages = Math.ceil(totalItems / limit);
                return {
                    page: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPages: totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                };
            });
        }
    };
});
