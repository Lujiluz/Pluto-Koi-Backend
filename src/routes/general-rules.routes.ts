import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateGeneralRules } from "../validations/general-rules.validation.js";
import { generalRulesController } from "../controllers/general-rules.controller.js";

const router = Router();

router.use(authenticateToken);

/**
 * @route   GET /api/general-rules
 * @desc    Get general rules
 * @access  Private
 */
router.get("/", generalRulesController.getAllRules.bind(generalRulesController));

/**
 * @route   POST /api/general-rules
 * @desc    Create general rules
 * @access  Private
 */
router.post("/", validateGeneralRules, generalRulesController.createRules.bind(generalRulesController));

/**
 * @route   PUT /api/general-rules/:id
 * @desc    Update general rules by ID
 * @access  Private
 */
router.put("/:id", validateGeneralRules, generalRulesController.updateRules.bind(generalRulesController));

export default router;
