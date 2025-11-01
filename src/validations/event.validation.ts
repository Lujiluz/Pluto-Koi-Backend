import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Types } from "mongoose";

// Schema for creating an event
const createEventSchema = z.object({
  isActive: z.boolean().optional().default(false),
  totalBidAmount: z.number().min(0).optional().default(0),
});

// Schema for updating an event
const updateEventSchema = z.object({
  isActive: z.boolean().optional(),
  totalBidAmount: z.number().min(0).optional(),
});

// Schema for event ID parameter
const eventIdSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid event ID format",
  }),
});

/**
 * Validate create event request
 */
export const validateCreateEvent = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createEventSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });

      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
      return;
    }
    next(error);
  }
};

/**
 * Validate update event request
 */
export const validateUpdateEvent = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updateEventSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });

      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
      return;
    }
    next(error);
  }
};

/**
 * Validate event ID parameter
 */
export const validateEventId = (req: Request, res: Response, next: NextFunction): void => {
  try {
    eventIdSchema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });

      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
      return;
    }
    next(error);
  }
};
