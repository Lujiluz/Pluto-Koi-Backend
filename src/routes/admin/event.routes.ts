import { Router } from "express";
import { eventController } from "../../controllers/event.controller.js";
import { validateCreateEvent, validateUpdateEvent, validateEventId } from "../../validations/event.validation.js";

const router = Router();

/**
 * Admin Event Routes
 * All routes are protected by authenticateAdminToken middleware in admin/index.ts
 */

/**
 * @route   GET /api/admin/event/active
 * @desc    Get the active event
 * @access  Private (Admin only)
 */
router.get("/active", eventController.getActiveEvent.bind(eventController));

/**
 * @route   GET /api/admin/event
 * @desc    Get all events
 * @access  Private (Admin only)
 */
router.get("/", eventController.getAllEvents.bind(eventController));

/**
 * @route   POST /api/admin/event
 * @desc    Create a new event
 * @access  Private (Admin only)
 */
router.post("/", validateCreateEvent, eventController.createEvent.bind(eventController));

/**
 * @route   GET /api/admin/event/:id
 * @desc    Get event by ID
 * @access  Private (Admin only)
 */
router.get("/:id", validateEventId, eventController.getEventById.bind(eventController));

/**
 * @route   PUT /api/admin/event/:id
 * @desc    Update event by ID
 * @access  Private (Admin only)
 */
router.put("/:id", validateEventId, validateUpdateEvent, eventController.updateEvent.bind(eventController));

/**
 * @route   DELETE /api/admin/event/:id
 * @desc    Delete event by ID
 * @access  Private (Admin only)
 */
router.delete("/:id", validateEventId, eventController.deleteEvent.bind(eventController));

/**
 * @route   POST /api/admin/event/recalculate
 * @desc    Recalculate total bid amount for active event
 * @access  Private (Admin only)
 */
router.post("/recalculate", eventController.recalculateTotalBidAmount.bind(eventController));

export default router;
