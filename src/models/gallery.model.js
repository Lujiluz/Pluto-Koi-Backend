System.register(["mongoose"], function (exports_1, context_1) {
    "use strict";
    var mongoose_1, gallerySchema, GalleryModel;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (mongoose_1_1) {
                mongoose_1 = mongoose_1_1;
            }
        ],
        execute: function () {
            gallerySchema = new mongoose_1.Schema({
                galleryName: { type: String, required: true },
                owner: { type: String, required: true },
                handling: { type: String, required: true },
                folderName: { type: String, default: "General", index: true },
                isActive: { type: Boolean, default: true },
                media: [
                    {
                        fileUrl: { type: String, required: true },
                    },
                ],
            }, { timestamps: true });
            gallerySchema.index({ galleryName: "text", owner: "text", handling: "text", folderName: "text" });
            exports_1("GalleryModel", GalleryModel = mongoose_1.model("Gallery", gallerySchema));
        }
    };
});
