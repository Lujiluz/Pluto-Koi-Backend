import { NextFunction, Request, Response } from "express";
import { eventService, CreateEventData } from "../services/event.service.js";

class EventController {
  /**
   * Get the active event
   */
  async getActiveEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await eventService.getActiveEvent();
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving active event:", error);
      next(error);
    }
  }

  /**
   * Get all events
   */
  async getAllEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await eventService.getAllEvents();
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving events:", error);
      next(error);
    }
  }

  /**
   * Get an event by ID
   */
  async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const response = await eventService.getEventById(id as string);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error retrieving event:", error);
      next(error);
    }
  }

  /**
   * Create a new event
   */
  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isActive, totalBidAmount } = req.body;

      const eventData: CreateEventData = {
        isActive: isActive !== undefined ? isActive : false,
        totalBidAmount: totalBidAmount !== undefined ? totalBidAmount : 0,
      };

      const response = await eventService.createEvent(eventData);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating event:", error);
      next(error);
    }
  }

  /**
   * Update an event
   */
  async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive, totalBidAmount } = req.body;

      const eventData: Partial<CreateEventData> = {};
      if (isActive !== undefined) eventData.isActive = isActive;
      if (totalBidAmount !== undefined) eventData.totalBidAmount = totalBidAmount;

      const response = await eventService.updateEvent(id as string, eventData);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating event:", error);
      next(error);
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const response = await eventService.deleteEvent(id as string);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error deleting event:", error);
      next(error);
    }
  }

  /**
   * Recalculate total bid amount for active event
   */
  async recalculateTotalBidAmount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await eventService.recalculateTotalBidAmount();
      res.status(200).json(response);
    } catch (error) {
      console.error("Error recalculating total bid amount:", error);
      next(error);
    }
  }
}

export const eventController = new EventController();
