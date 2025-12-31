import { Router } from "express";
import { validateGeneralRules } from "../../validations/general-rules.validation.js";
import { generalRulesController } from "../../controllers/general-rules.controller.js";

const router = Router();

/**
 * Admin General Rules Routes
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

/**
 * @route   GET /api/admin/general-rules
 * @desc    Get general rules
 * @access  Private (Admin only)
 */
router.get("/", generalRulesController.getAllRules.bind(generalRulesController));

/**
 * @route   POST /api/admin/general-rules
 * @desc    Create general rules
 * @access  Private (Admin only)
 */
router.post("/", validateGeneralRules, generalRulesController.createRules.bind(generalRulesController));

/**
 * @route   PUT /api/admin/general-rules/:id
 * @desc    Update general rules by ID
 * @access  Private (Admin only)
 */
router.put("/:id", validateGeneralRules, generalRulesController.updateRules.bind(generalRulesController));

export default router;
