import { TimeProvider, defaultTimeProvider } from "../utils/time-provider.js";

/**
 * Auction state interface representing an auction's current state
 */
export interface AuctionState {
  id: string;
  itemName: string;
  startPrice: number;
  priceMultiplication: number;
  startDate: Date;
  endDate: Date;
  endTime: Date;
  extraTime: number; // in minutes
  highestBid: number;
  currentWinner: string | null;
}

/**
 * Bid attempt interface
 */
export interface BidAttempt {
  userId: string;
  bidAmount: number;
  bidTime: Date;
}

/**
 * Bid result interface
 */
export interface BidResult {
  success: boolean;
  error?: string;
  isNewLeader: boolean;
  previousHighestBid: number;
  previousWinner: string | null;
  timeExtended: boolean;
  newEndTime?: Date;
  extensionMinutes?: number;
}

/**
 * Auction status enum
 */
export enum AuctionStatus {
  NOT_STARTED = "not_started",
  ACTIVE = "active",
  IN_EXTRA_TIME = "in_extra_time",
  ENDED = "ended",
}

/**
 * AuctionEngine - Pure domain logic for auction operations.
 * This class contains NO side effects (no DB, no HTTP, no WebSocket).
 * Perfect for unit testing with deterministic time.
 */
export class AuctionEngine {
  private timeProvider: TimeProvider;

  constructor(timeProvider: TimeProvider = defaultTimeProvider) {
    this.timeProvider = timeProvider;
  }

  /**
   * Get current auction status based on dates
   */
  getAuctionStatus(auction: AuctionState): AuctionStatus {
    const now = this.timeProvider.now();

    if (now < auction.startDate) {
      return AuctionStatus.NOT_STARTED;
    }

    if (now > auction.endTime) {
      return AuctionStatus.ENDED;
    }

    // Check if in extra time window
    if (auction.extraTime > 0) {
      const extraTimeMs = auction.extraTime * 60 * 1000;
      const extraTimeThreshold = new Date(auction.endTime.getTime() - extraTimeMs);

      if (now >= extraTimeThreshold && now <= auction.endTime) {
        return AuctionStatus.IN_EXTRA_TIME;
      }
    }

    return AuctionStatus.ACTIVE;
  }

  /**
   * Check if auction is active (accepting bids)
   */
  isAuctionActive(auction: AuctionState): boolean {
    const status = this.getAuctionStatus(auction);
    return status === AuctionStatus.ACTIVE || status === AuctionStatus.IN_EXTRA_TIME;
  }

  /**
   * Validate if a bid amount follows the price multiplication rule.
   * Valid bids: startPrice + (n × priceMultiplication) where n >= 0
   */
  isValidBidIncrement(auction: AuctionState, bidAmount: number): boolean {
    const { startPrice, priceMultiplication } = auction;

    // Bid must be at least startPrice
    if (bidAmount < startPrice) {
      return false;
    }

    // Check if bid follows the increment pattern
    const bidDifference = bidAmount - startPrice;

    // If bidAmount equals startPrice, it's valid (n = 0)
    if (bidDifference === 0) {
      return true;
    }

    // Check if difference is a valid multiple of priceMultiplication
    return bidDifference % priceMultiplication === 0;
  }

  /**
   * Get valid bid amounts for display/validation
   */
  getValidBidExamples(auction: AuctionState, count: number = 3): number[] {
    const examples: number[] = [];
    const { startPrice, priceMultiplication } = auction;

    for (let n = 0; n < count; n++) {
      examples.push(startPrice + n * priceMultiplication);
    }

    return examples;
  }

  /**
   * Get the next valid bid amount after a given bid
   */
  getNextValidBid(auction: AuctionState, currentHighestBid: number): number {
    const { startPrice, priceMultiplication } = auction;

    if (currentHighestBid < startPrice) {
      return startPrice;
    }

    // Calculate the next valid increment
    const n = Math.floor((currentHighestBid - startPrice) / priceMultiplication) + 1;
    return startPrice + n * priceMultiplication;
  }

  /**
   * Check if bid is higher than current highest bid
   */
  isBidHigherThanCurrent(bidAmount: number, currentHighestBid: number): boolean {
    return bidAmount > currentHighestBid;
  }

  /**
   * Check if the bid is placed within the extra time window
   * and should trigger a time extension
   */
  shouldExtendTime(auction: AuctionState, bidTime: Date): boolean {
    const extraTimeMinutes = auction.extraTime || 0;

    // No extra time configured
    if (extraTimeMinutes === 0) {
      return false;
    }

    const currentEndTime = auction.endTime;
    const extraTimeMs = extraTimeMinutes * 60 * 1000;
    const extensionThreshold = new Date(currentEndTime.getTime() - extraTimeMs);

    // Check if bid is within extra time window
    return bidTime >= extensionThreshold && bidTime <= currentEndTime;
  }

  /**
   * Calculate the new end time after an extension
   */
  calculateNewEndTime(auction: AuctionState, bidTime: Date): Date {
    const extraTimeMs = auction.extraTime * 60 * 1000;
    return new Date(bidTime.getTime() + extraTimeMs);
  }

  /**
   * Process a bid attempt and return the result.
   * This is pure logic - no side effects.
   */
  processBid(auction: AuctionState, bid: BidAttempt): BidResult {
    const result: BidResult = {
      success: false,
      isNewLeader: false,
      previousHighestBid: auction.highestBid,
      previousWinner: auction.currentWinner,
      timeExtended: false,
    };

    // Check if auction is active
    if (!this.isAuctionActive(auction)) {
      const status = this.getAuctionStatus(auction);
      if (status === AuctionStatus.NOT_STARTED) {
        result.error = "Auction has not started yet";
      } else {
        result.error = "Auction has ended";
      }
      return result;
    }

    // Validate bid amount is at least startPrice
    if (bid.bidAmount < auction.startPrice) {
      result.error = `Bid amount must be at least ${auction.startPrice.toLocaleString("id-ID")} (start price)`;
      return result;
    }

    // Validate bid follows price multiplication rule
    if (!this.isValidBidIncrement(auction, bid.bidAmount)) {
      const examples = this.getValidBidExamples(auction);
      result.error = `Bid amount must follow increment of ${auction.priceMultiplication.toLocaleString("id-ID")}. Valid bids: ${examples.map((e) => e.toLocaleString("id-ID")).join(", ")}, etc.`;
      return result;
    }

    // Validate bid is higher than current highest
    if (auction.highestBid > 0 && !this.isBidHigherThanCurrent(bid.bidAmount, auction.highestBid)) {
      result.error = `Bid must be higher than current highest bid of ${auction.highestBid}`;
      return result;
    }

    // Check for time extension
    if (this.shouldExtendTime(auction, bid.bidTime)) {
      result.timeExtended = true;
      result.newEndTime = this.calculateNewEndTime(auction, bid.bidTime);
      result.extensionMinutes = auction.extraTime;
    }

    // Bid is valid
    result.success = true;
    result.isNewLeader = true;

    return result;
  }

  /**
   * Determine the winner of an ended auction
   */
  determineWinner(auction: AuctionState): {
    hasWinner: boolean;
    winnerId: string | null;
    winningBid: number;
  } {
    const status = this.getAuctionStatus(auction);

    if (status !== AuctionStatus.ENDED) {
      return {
        hasWinner: false,
        winnerId: null,
        winningBid: 0,
      };
    }

    return {
      hasWinner: auction.currentWinner !== null,
      winnerId: auction.currentWinner,
      winningBid: auction.highestBid,
    };
  }

  /**
   * Calculate time remaining in auction (in milliseconds)
   */
  getTimeRemaining(auction: AuctionState): number {
    const now = this.timeProvider.now();
    const remaining = auction.endTime.getTime() - now.getTime();
    return Math.max(0, remaining);
  }

  /**
   * Check if we're in the final seconds (for UI countdown)
   */
  isInFinalCountdown(auction: AuctionState, thresholdSeconds: number = 60): boolean {
    const remaining = this.getTimeRemaining(auction);
    return remaining > 0 && remaining <= thresholdSeconds * 1000;
  }
}

/**
 * Default auction engine instance with real time provider
 */
export const auctionEngine = new AuctionEngine();
