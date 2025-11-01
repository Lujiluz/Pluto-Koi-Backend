import { Router } from "express";
import { eventController } from "../controllers/event.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateCreateEvent, validateUpdateEvent, validateEventId } from "../validations/event.validation.js";

const router = Router();

router.use(authenticateToken);

/**
 * @route   GET /api/event/active
 * @desc    Get the active event
 * @access  Private
 */
router.get("/active", eventController.getActiveEvent.bind(eventController));

/**
 * @route   GET /api/event
 * @desc    Get all events
 * @access  Private
 */
router.get("/", eventController.getAllEvents.bind(eventController));

/**
 * @route   POST /api/event
 * @desc    Create a new event
 * @access  Private
 */
router.post("/", validateCreateEvent, eventController.createEvent.bind(eventController));

/**
 * @route   GET /api/event/:id
 * @desc    Get event by ID
 * @access  Private
 */
router.get("/:id", validateEventId, eventController.getEventById.bind(eventController));

/**
 * @route   PUT /api/event/:id
 * @desc    Update event by ID
 * @access  Private
 */
router.put("/:id", validateEventId, validateUpdateEvent, eventController.updateEvent.bind(eventController));

/**
 * @route   DELETE /api/event/:id
 * @desc    Delete event by ID
 * @access  Private
 */
router.delete("/:id", validateEventId, eventController.deleteEvent.bind(eventController));

/**
 * @route   POST /api/event/recalculate
 * @desc    Recalculate total bid amount for active event
 * @access  Private
 */
router.post("/recalculate", eventController.recalculateTotalBidAmount.bind(eventController));

export default router;
