import { AuctionModel } from "../models/auction.model.js";
import { AuctionActivityModel } from "../models/auction.activity.model.js";
import { EventModel, IEvent } from "../models/event.model.js";
import { auctionRepository } from "./auction.repository.js";

class EventRepository {
  /**
   * Get the active event with top 3 bidders
   * @returns The active event with top bidders data or null
   */
  async getActiveEvent(): Promise<any> {
    const event = await EventModel.findOne({ isActive: true }).exec();
    if (!event) {
      return null;
    }

    const topBidders = await this.getTop3Bidders();

    return {
      event,
      topBidders,
    };
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
   * Get 3 top bidders which are:
   * 1. Most Bidder: user that have most bid participation
   * 2. Highest Bidder: user that have highest total bid amount
   * 3. Most latest bidder: user that have most recent bid
   * @returns Top 3 bidders
   */
  async getTop3Bidders(): Promise<any> {
    // Get all active auctions
    const activeAuctions = await AuctionModel.find({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).select("_id");

    const auctionIds = activeAuctions.map((auction) => auction._id);

    if (auctionIds.length === 0) {
      return {
        mostBidder: null,
        highestBidder: null,
        latestBidder: null,
      };
    }

    // 1. Most Bidder: user with most bid participation
    const mostBidderResult = await AuctionActivityModel.aggregate([
      { $match: { auctionId: { $in: auctionIds } } },
      {
        $group: {
          _id: "$userId",
          bidCount: { $sum: 1 },
        },
      },
      { $sort: { bidCount: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          bidCount: 1,
        },
      },
    ]);

    // 2. Highest Bidder: user with highest total bid amount
    const highestBidderResult = await AuctionActivityModel.aggregate([
      { $match: { auctionId: { $in: auctionIds } } },
      {
        $group: {
          _id: "$userId",
          totalBidAmount: { $sum: "$bidAmount" },
        },
      },
      { $sort: { totalBidAmount: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          totalBidAmount: 1,
        },
      },
    ]);

    // 3. Latest Bidder: user with most recent bid
    const latestBidderResult = await AuctionActivityModel.aggregate([
      { $match: { auctionId: { $in: auctionIds } } },
      { $sort: { bidTime: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$userId",
          name: "$user.name",
          email: "$user.email",
          bidTime: 1,
          bidAmount: 1,
        },
      },
    ]);

    return {
      mostBidder: mostBidderResult[0] || null,
      highestBidder: highestBidderResult[0] || null,
      latestBidder: latestBidderResult[0] || null,
    };
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

  /**
   * Upsert event - update if exists, create if doesn't exist
   * Only maintains ONE event in the system
   * @param eventData - Event data
   * @returns The upserted event
   */
  async upsertEvent(eventData: Partial<IEvent>): Promise<IEvent> {
    console.log("Upserting event with data:", eventData);
    // Find any existing event (regardless of isActive status)
    const existingEvent = await EventModel.findOne().exec();
    const totalBid = await auctionRepository.sumAllBids()

    if (existingEvent) {
      // Update the existing event
      existingEvent.isActive = eventData.isActive ?? existingEvent.isActive;
      existingEvent.totalBidAmount = eventData.totalBidAmount ?? totalBid;
      return await existingEvent.save();
    } else {
      // Create new event if none exists
      const newEvent = new EventModel({
        isActive: eventData.isActive ?? false,
        totalBidAmount: eventData.totalBidAmount ?? totalBid,
      });
      return await newEvent.save();
    }
  }
}

export const eventRepository = new EventRepository();
