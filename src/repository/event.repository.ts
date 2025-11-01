import { EventModel, IEvent } from "../models/event.model.js";

class EventRepository {
  /**
   * Get the active event
   * @returns The active event or null
   */
  async getActiveEvent(): Promise<IEvent | null> {
    return await EventModel.findOne({ isActive: true }).exec();
  }

  /**
   * Get an event by ID
   * @param eventId - Event ID
   * @returns The event or null
   */
  async findById(eventId: string): Promise<IEvent | null> {
    return await EventModel.findById(eventId).exec();
  }

  /**
   * Create a new event
   * @param eventData - Event data
   * @returns The created event
   */
  async create(eventData: Partial<IEvent>): Promise<IEvent> {
    const event = new EventModel(eventData);
    return await event.save();
  }

  /**
   * Update an event
   * @param eventId - Event ID
   * @param eventData - Updated event data
   * @returns The updated event
   */
  async update(eventId: string, eventData: Partial<IEvent>): Promise<IEvent | null> {
    return await EventModel.findByIdAndUpdate(eventId, eventData, { new: true }).exec();
  }

  /**
   * Delete an event
   * @param eventId - Event ID
   * @returns The deleted event
   */
  async delete(eventId: string): Promise<IEvent | null> {
    return await EventModel.findByIdAndDelete(eventId).exec();
  }

  /**
   * Get all events
   * @returns All events
   */
  async findAll(): Promise<IEvent[]> {
    return await EventModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Deactivate all events
   */
  async deactivateAllEvents(): Promise<void> {
    await EventModel.updateMany({}, { isActive: false }).exec();
  }

  /**
   * Update totalBidAmount for the active event
   * @param totalBidAmount - New total bid amount
   * @returns The updated event
   */
  async updateTotalBidAmount(totalBidAmount: number): Promise<IEvent | null> {
    return await EventModel.findOneAndUpdate({ isActive: true }, { totalBidAmount }, { new: true }).exec();
  }
}

export const eventRepository = new EventRepository();
