import { Types } from "mongoose";

/**
 * WebSocket event types
 */
export enum WebSocketEvents {
  // Client events
  JOIN_AUCTION = "join_auction",
  LEAVE_AUCTION = "leave_auction",

  // Server events
  AUCTION_LEADERBOARD_UPDATE = "auction_leaderboard_update",
  AUCTION_TIME_EXTENDED = "auction_time_extended",
  AUCTION_ENDED = "auction_ended",
  NEW_BID_PLACED = "new_bid_placed",
  ERROR = "error",
}

/**
 * Leaderboard participant data
 */
export interface LeaderboardParticipant {
  userId: string;
  name: string;
  email: string;
  totalBids: number;
  highestBid: number;
  latestBidTime: Date;
  isHighestBidder: boolean;
  rank: number;
}

/**
 * Leaderboard update payload
 */
export interface LeaderboardUpdatePayload {
  auctionId: string;
  participants: LeaderboardParticipant[];
  currentHighestBid: number;
  currentWinner: {
    userId: string;
    name: string;
    bidAmount: number;
  } | null;
  totalParticipants: number;
  totalBids: number;
  timestamp: Date;
}

/**
 * Time extension payload
 */
export interface TimeExtensionPayload {
  auctionId: string;
  newEndTime: Date;
  extensionMinutes: number;
  reason: string;
  timestamp: Date;
}

/**
 * New bid notification payload
 */
export interface NewBidPayload {
  auctionId: string;
  userId: string;
  userName: string;
  bidAmount: number;
  bidType: "initial" | "outbid" | "winning" | "auto";
  bidTime: Date;
  isNewLeader: boolean;
}

/**
 * Auction ended payload
 */
export interface AuctionEndedPayload {
  auctionId: string;
  winner: {
    userId: string;
    name: string;
    winningBid: number;
  } | null;
  totalBids: number;
  totalParticipants: number;
  timestamp: Date;
}

/**
 * Error payload
 */
export interface ErrorPayload {
  message: string;
  code?: string;
  timestamp: Date;
}

/**
 * Join auction request
 */
export interface JoinAuctionRequest {
  auctionId: string;
}

/**
 * Leave auction request
 */
export interface LeaveAuctionRequest {
  auctionId: string;
}
