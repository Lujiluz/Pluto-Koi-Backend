import { GeneralResponse } from "../interfaces/global.interface.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { IEvent } from "../models/event.model.js";
import { eventRepository } from "../repository/event.repository.js";
import { AuctionActivityModel } from "../models/auction.activity.model.js";
import { AuctionModel } from "../models/auction.model.js";
import { Types } from "mongoose";

export interface CreateEventData {
  isActive: boolean;
  totalBidAmount?: number;
}

class EventService {
  /**
   * Get the active event
   * @returns The active event or null
   */
  async getActiveEvent(): Promise<GeneralResponse<IEvent | null>> {
    try {
      const event = await eventRepository.getActiveEvent();

      return {
        status: "success",
        message: event ? "Active event retrieved successfully" : "No active event found",
        data: { ...event },
      };
    } catch (error) {
      console.error("Error retrieving active event:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve active event");
    }
  }

  /**
   * Get an event by ID
   * @param eventId - Event ID
   * @returns The event
   */
  async getEventById(eventId: string): Promise<GeneralResponse<IEvent>> {
    try {
      const event = await eventRepository.findById(eventId);

      if (!event) {
        throw new CustomErrorHandler(404, "Event not found");
      }

      return {
        status: "success",
        message: "Event retrieved successfully",
        data: event,
      };
    } catch (error) {
      console.error("Error retrieving event:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to retrieve event");
    }
  }

  /**
   * Create a new event (actually upserts - updates if exists, creates if doesn't)
   * @param eventData - Event data
   * @returns The created/updated event
   */
  async createEvent(eventData: CreateEventData): Promise<GeneralResponse<IEvent>> {
    try {
      // Calculate totalBidAmount first if event will be active
      let calculatedTotalBidAmount = 0;
      if (eventData.isActive) {
        calculatedTotalBidAmount = await this.calculateTotalBidAmount();
      }

      console.log('CALCULATED BID AMOUNT: ', calculatedTotalBidAmount)

      // Upsert the event with calculated totalBidAmount
      const event = await eventRepository.upsertEvent({
        isActive: eventData.isActive,
        totalBidAmount: calculatedTotalBidAmount,
      });

      return {
        status: "success",
        message: "Event created successfully",
        data: event,
      };
    } catch (error) {
      console.error("Error creating event:", error);
      throw new CustomErrorHandler(500, "Failed to create event");
    }
  }

  /**
   * Update an event
   * @param eventId - Event ID
   * @param eventData - Updated event data
   * @returns The updated event
   */
  async updateEvent(eventId: string, eventData: Partial<CreateEventData>): Promise<GeneralResponse<IEvent>> {
    try {
      const event = await eventRepository.findById(eventId);

      if (!event) {
        throw new CustomErrorHandler(404, "Event not found");
      }

      // If activating this event, deactivate all other events first
      if (eventData.isActive === true && !event.isActive) {
        await eventRepository.deactivateAllEvents();
      }

      const updatedEvent = await eventRepository.update(eventId, eventData);

      if (!updatedEvent) {
        throw new CustomErrorHandler(500, "Failed to update event");
      }

      // Recalculate total bid amount based on event status
      // If active: calculate sum of all highest bids on active auctions
      // If inactive: reset to 0
      let finalEvent = updatedEvent;
      if (updatedEvent.isActive) {
        const recalculateResult = await this.recalculateTotalBidAmount();
        if (recalculateResult.data) {
          finalEvent = recalculateResult.data;
        }
      } else {
        // Reset totalBidAmount to 0 when event is deactivated
        const resetEvent = await eventRepository.updateTotalBidAmount(0);
        if (resetEvent) {
          finalEvent = resetEvent;
        }
      }

      return {
        status: "success",
        message: "Event updated successfully",
        data: finalEvent,
      };
    } catch (error) {
      console.error("Error updating event:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to update event");
    }
  }

  /**
   * Delete an event
   * @param eventId - Event ID
   * @returns Success message
   */
  async deleteEvent(eventId: string): Promise<GeneralResponse<null>> {
    try {
      const event = await eventRepository.findById(eventId);

      if (!event) {
        throw new CustomErrorHandler(404, "Event not found");
      }

      await eventRepository.delete(eventId);

      return {
        status: "success",
        message: "Event deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error deleting event:", error);
      if (error instanceof CustomErrorHandler) {
        throw error;
      }
      throw new CustomErrorHandler(500, "Failed to delete event");
    }
  }

  /**
   * Get all events
   * @returns All events
   */
  async getAllEvents(): Promise<GeneralResponse<IEvent[]>> {
    try {
      const events = await eventRepository.findAll();

      return {
        status: "success",
        message: "Events retrieved successfully",
        data: events,
      };
    } catch (error) {
      console.error("Error retrieving events:", error);
      throw new CustomErrorHandler(500, "Failed to retrieve events");
    }
  }

  /**
   * Recalculate total bid amount for the active event
   * This calculates the sum of all highest bids on all active auctions
   */
  async recalculateTotalBidAmount(): Promise<GeneralResponse<IEvent | null>> {
    try {
      const activeEvent = await eventRepository.getActiveEvent();

      if (!activeEvent) {
        return {
          status: "success",
          message: "No active event to update",
          data: null,
        };
      }

      // Get all active auctions (auctions that are currently running)
      const now = new Date();
      const activeAuctions = await AuctionModel.find({
        startDate: { $lte: now },
        endDate: { $gte: now },
      }).exec();

      // Calculate total bid amount from all active auctions
      let totalBidAmount = 0;

      for (const auction of activeAuctions) {
        const highestBid = await AuctionActivityModel.getHighestBidForAuction(auction._id as Types.ObjectId);
        if (highestBid) {
          totalBidAmount += highestBid.bidAmount;
        }
      }

      // Update the event with the calculated total
      const updatedEvent = await eventRepository.updateTotalBidAmount(totalBidAmount);

      return {
        status: "success",
        message: "Total bid amount recalculated successfully",
        data: updatedEvent,
      };
    } catch (error) {
      console.error("Error recalculating total bid amount:", error);
      throw new CustomErrorHandler(500, "Failed to recalculate total bid amount");
    }
  }

  /**
   * Get event details for auction endpoint
   * Returns totalBidAmount if event is active, null otherwise
   */
  async getEventDetailsForAuction(): Promise<{ totalBidAmount: number } | null> {
    try {
      const activeEvent = await eventRepository.getActiveEvent();

      if (!activeEvent) {
        return null;
      }

      return {
        totalBidAmount: activeEvent.totalBidAmount,
      };
    } catch (error) {
      console.error("Error getting event details:", error);
      return null;
    }
  }

  /**
   * Calculate total bid amount from all active auctions
   * This is a helper method that returns just the calculated number
   */
  private async calculateTotalBidAmount(): Promise<number> {
    // Get all active auctions (auctions that are currently running)
    const now = new Date();
    const activeAuctions = await AuctionModel.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).exec();

    // Calculate total bid amount from all active auctions
    let totalBidAmount = 0;

    for (const auction of activeAuctions) {
      const highestBid = await AuctionActivityModel.getHighestBidForAuction(auction._id as Types.ObjectId);
      if (highestBid) {
        totalBidAmount += highestBid.bidAmount;
      }
    }

    return totalBidAmount;
  }
}

export const eventService = new EventService();
