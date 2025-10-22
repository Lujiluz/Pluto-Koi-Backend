import { Router } from "express";
import { wishlistController } from "../controllers/wishlist.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateAddToWishlist, validateRemoveFromWishlist, validateCheckItem, validateItemTypeQuery, validateSyncItem } from "../validations/wishlist.validation.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get("/", wishlistController.getWishlist.bind(wishlistController));

/**
 * @route   GET /api/wishlist/stats
 * @desc    Get wishlist statistics (total items, products count, auctions count)
 * @access  Private
 */
router.get("/stats", wishlistController.getWishlistStats.bind(wishlistController));

/**
 * @route   GET /api/wishlist/check
 * @desc    Check if specific item exists in wishlist
 * @access  Private
 * @query   itemId, itemType
 */
router.get("/check", validateCheckItem, wishlistController.checkItemInWishlist.bind(wishlistController));

/**
 * @route   GET /api/wishlist/items
 * @desc    Get wishlist items filtered by type
 * @access  Private
 * @query   itemType (product or auction)
 */
router.get("/items", validateItemTypeQuery, wishlistController.getItemsByType.bind(wishlistController));

/**
 * @route   POST /api/wishlist
 * @desc    Add item to wishlist
 * @access  Private
 * @body    itemId, itemType
 */
router.post("/", validateAddToWishlist, wishlistController.addToWishlist.bind(wishlistController));

/**
 * @route   POST /api/wishlist/sync
 * @desc    Sync wishlist item data (update embedded data from source)
 * @access  Private
 * @body    itemId, itemType
 */
router.post("/sync", validateSyncItem, wishlistController.syncWishlistItem.bind(wishlistController));

/**
 * @route   DELETE /api/wishlist/item
 * @desc    Remove specific item from wishlist
 * @access  Private
 * @body    itemId, itemType
 */
router.delete("/item", validateRemoveFromWishlist, wishlistController.removeFromWishlist.bind(wishlistController));

/**
 * @route   DELETE /api/wishlist
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete("/", wishlistController.clearWishlist.bind(wishlistController));

export default router;
