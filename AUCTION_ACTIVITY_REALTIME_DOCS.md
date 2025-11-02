# Auction Activity & Real-Time Bidding Documentation

## Overview

This document provides comprehensive documentation for the auction activity system, including REST API endpoints and real-time WebSocket functionality for live bidding leaderboards, bid notifications, and automatic time extensions.

## Table of Contents

1. [REST API Endpoints](#rest-api-endpoints)
2. [WebSocket Real-Time Features](#websocket-real-time-features)
3. [Bidding System Features](#bidding-system-features)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Client Integration Examples](#client-integration-examples)

---

## REST API Endpoints

All auction activity endpoints require authentication via JWT token in the `Authorization` header.

### 1. Place Bid

```
POST /api/auction-activity/bid
```

**Description:** Place a new bid on an active auction

**Authentication:** Required (JWT Token)

**Request Body:**

```json
{
  "auctionId": "string (required)",
  "bidAmount": "number (required, positive)",
  "bidType": "string (optional: 'initial' | 'outbid' | 'winning' | 'auto')"
}
```

**Success Response (201):**

```json
{
  "status": "success",
  "message": "Bid placed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "auctionId": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "endUser"
    },
    "bidAmount": 15000,
    "bidType": "winning",
    "isActive": true,
    "bidTime": "2024-01-20T15:30:00.000Z",
    "createdAt": "2024-01-20T15:30:00.000Z",
    "updatedAt": "2024-01-20T15:30:00.000Z"
  }
}
```

**Real-Time Effects:**

- Emits `new_bid_placed` event to all clients in the auction room
- Emits `auction_leaderboard_update` event with updated rankings
- May emit `auction_time_extended` event if bid placed in extra time window
- Previous highest bidder's bid is marked as inactive (`bidType: "outbid"`)

**Validation Rules:**

- User must be authenticated
- User account must not be banned
- Auction must exist and be active (not ended)
- Bid amount must be greater than current highest bid
- Bid amount must be a positive number

**Error Responses:**

- `400` - Invalid bid amount or auction has ended
- `401` - Authentication required
- `403` - Account is blocked
- `404` - Auction not found
- `500` - Server error

---

### 2. Get Auction Participants

```
GET /api/auction-activity/auction/:auctionId/participants
```

**Description:** Get all participants for a specific auction with detailed statistics

**Authentication:** Required (JWT Token)

**Path Parameters:**

- `auctionId` (required) - Auction ID (MongoDB ObjectId format)

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Auction participation retrieved successfully",
  "data": {
    "auctionId": "507f1f77bcf86cd799439012",
    "participants": [
      {
        "userId": "507f1f77bcf86cd799439013",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "endUser",
        "totalBids": 5,
        "highestBid": 15000,
        "latestBidTime": "2024-01-20T15:30:00.000Z",
        "isHighestBidder": true
      },
      {
        "userId": "507f1f77bcf86cd799439014",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "endUser",
        "totalBids": 3,
        "highestBid": 14500,
        "latestBidTime": "2024-01-20T15:25:00.000Z",
        "isHighestBidder": false
      }
    ],
    "totalParticipants": 2,
    "totalBids": 8,
    "currentHighestBid": 15000,
    "currentWinner": {
      "userId": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "bidAmount": 15000
    }
  }
}
```

**Use Cases:**

- Display complete leaderboard on auction detail page
- Show participant statistics
- Identify current winner

---

### 3. Get Current Highest Bid

```
GET /api/auction-activity/auction/:auctionId/highest-bid
```

**Description:** Get the current highest bid for an auction (lightweight endpoint)

**Authentication:** Required (JWT Token)

**Path Parameters:**

- `auctionId` (required) - Auction ID

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Current highest bid retrieved successfully",
  "data": {
    "auctionId": "507f1f77bcf86cd799439012",
    "currentHighestBid": 15000,
    "currentWinner": {
      "userId": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "bidAmount": 15000
    },
    "totalParticipants": 2
  }
}
```

---

### 4. Get Auction Statistics

```
GET /api/auction-activity/auction/:auctionId/stats
```

**Description:** Get comprehensive statistics for an auction

**Authentication:** Required (JWT Token)

**Path Parameters:**

- `auctionId` (required) - Auction ID

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Auction statistics retrieved successfully",
  "data": {
    "totalBids": 25,
    "uniqueParticipants": 8,
    "averageBidAmount": 12350,
    "currentHighestBid": 15000,
    "bidRange": {
      "min": 10000,
      "max": 15000
    }
  }
}
```

**Use Cases:**

- Display auction analytics
- Show bid distribution
- Generate reports

---

### 5. Get User Auction History

```
GET /api/auction-activity/auction/:auctionId/user/:userId/history
```

**Description:** Get a specific user's bid history for an auction

**Authentication:** Required (JWT Token)

**Path Parameters:**

- `auctionId` (required) - Auction ID
- `userId` (optional) - User ID (defaults to authenticated user)

**Authorization:**

- Users can view their own bid history
- Admins can view any user's bid history

**Success Response (200):**

```json
{
  "status": "success",
  "message": "User auction history retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "auctionId": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "bidAmount": 15000,
      "bidType": "winning",
      "isActive": true,
      "bidTime": "2024-01-20T15:30:00.000Z",
      "createdAt": "2024-01-20T15:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439016",
      "auctionId": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "bidAmount": 14500,
      "bidType": "outbid",
      "isActive": false,
      "bidTime": "2024-01-20T15:20:00.000Z",
      "createdAt": "2024-01-20T15:20:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `403` - Insufficient permissions (trying to view another user's history)

---

### 6. Get All Auction Activities (Admin Only)

```
GET /api/auction-activity/all
```

**Description:** Get all auction activities across all auctions with pagination

**Authentication:** Required (JWT Token) + Admin Role

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Auction activities retrieved successfully",
  "data": {
    "activities": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "auctionId": {
          "_id": "507f1f77bcf86cd799439012",
          "itemName": "Koi Fish Premium",
          "startPrice": 10000,
          "endPrice": 15000
        },
        "userId": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "endUser"
        },
        "bidAmount": 15000,
        "bidType": "winning",
        "isActive": true,
        "bidTime": "2024-01-20T15:30:00.000Z",
        "createdAt": "2024-01-20T15:30:00.000Z"
      }
    ],
    "metadata": {
      "page": 1,
      "limit": 20,
      "totalItems": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Authorization:**

- Only users with `admin` role can access this endpoint

---

## WebSocket Real-Time Features

### Connection Setup

**Server Configuration:**

- **URL:** `ws://your-server-url` or `wss://your-server-url` (for production)
- **Path:** `/socket.io/`
- **Transports:** WebSocket, Polling (fallback)
- **CORS:** Configured for cross-origin requests

**Client Connection:**

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:1728", {
  auth: {
    token: "YOUR_JWT_TOKEN", // Required for authentication
  },
  transports: ["websocket", "polling"],
});
```

**Authentication:**

- JWT token must be provided in `auth.token` or `Authorization` header
- Token is verified on connection
- Connection will be rejected if token is invalid or missing

### WebSocket Events

#### Client Events (Emit from Client)

##### 1. Join Auction Room

```javascript
// Event: 'join_auction'
socket.emit("join_auction", {
  auctionId: "507f1f77bcf86cd799439012",
});

// Acknowledgment received
socket.on("joined_auction", (data) => {
  console.log("Joined auction:", data);
  // {
  //   auctionId: '507f1f77bcf86cd799439012',
  //   message: 'Successfully joined auction',
  //   timestamp: '2024-01-20T15:30:00.000Z'
  // }
});
```

**Purpose:** Join a specific auction room to receive real-time updates

**Payload:**

```typescript
{
  auctionId: string;
}
```

---

##### 2. Leave Auction Room

```javascript
// Event: 'leave_auction'
socket.emit("leave_auction", {
  auctionId: "507f1f77bcf86cd799439012",
});

// Acknowledgment received
socket.on("left_auction", (data) => {
  console.log("Left auction:", data);
  // {
  //   auctionId: '507f1f77bcf86cd799439012',
  //   message: 'Successfully left auction',
  //   timestamp: '2024-01-20T15:35:00.000Z'
  // }
});
```

**Purpose:** Leave an auction room to stop receiving updates

**Payload:**

```typescript
{
  auctionId: string;
}
```

---

#### Server Events (Listen on Client)

##### 1. Auction Leaderboard Update

```javascript
// Event: 'auction_leaderboard_update'
socket.on("auction_leaderboard_update", (data) => {
  console.log("Leaderboard updated:", data);
  updateLeaderboardUI(data);
});
```

**Triggered When:**

- A new bid is placed
- Bid rankings change

**Payload:**

```typescript
{
  auctionId: string,
  participants: [
    {
      userId: string,
      name: string,
      email: string,
      totalBids: number,
      highestBid: number,
      latestBidTime: Date,
      isHighestBidder: boolean,
      rank: number  // Position in leaderboard (1 = highest bidder)
    }
  ],
  currentHighestBid: number,
  currentWinner: {
    userId: string,
    name: string,
    bidAmount: number
  } | null,
  totalParticipants: number,
  totalBids: number,
  timestamp: Date
}
```

**Example Response:**

```json
{
  "auctionId": "507f1f77bcf86cd799439012",
  "participants": [
    {
      "userId": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com",
      "totalBids": 5,
      "highestBid": 15000,
      "latestBidTime": "2024-01-20T15:30:00.000Z",
      "isHighestBidder": true,
      "rank": 1
    },
    {
      "userId": "507f1f77bcf86cd799439014",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "totalBids": 3,
      "highestBid": 14500,
      "latestBidTime": "2024-01-20T15:25:00.000Z",
      "isHighestBidder": false,
      "rank": 2
    }
  ],
  "currentHighestBid": 15000,
  "currentWinner": {
    "userId": "507f1f77bcf86cd799439013",
    "name": "John Doe",
    "bidAmount": 15000
  },
  "totalParticipants": 2,
  "totalBids": 8,
  "timestamp": "2024-01-20T15:30:00.000Z"
}
```

---

##### 2. New Bid Placed

```javascript
// Event: 'new_bid_placed'
socket.on("new_bid_placed", (data) => {
  console.log("New bid:", data);
  showBidNotification(data);
});
```

**Triggered When:**

- Any user places a bid on the auction

**Payload:**

```typescript
{
  auctionId: string,
  userId: string,
  userName: string,
  bidAmount: number,
  bidType: 'initial' | 'outbid' | 'winning' | 'auto',
  bidTime: Date,
  isNewLeader: boolean
}
```

**Example Response:**

```json
{
  "auctionId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439013",
  "userName": "John Doe",
  "bidAmount": 15000,
  "bidType": "winning",
  "bidTime": "2024-01-20T15:30:00.000Z",
  "isNewLeader": true
}
```

**Use Cases:**

- Show real-time bid notifications
- Highlight new bids in the UI
- Play sound effects for new bids
- Update "You've been outbid" messages

---

##### 3. Auction Time Extended

```javascript
// Event: 'auction_time_extended'
socket.on("auction_time_extended", (data) => {
  console.log("Time extended:", data);
  updateAuctionTimer(data.newEndTime);
  showExtensionNotification(data);
});
```

**Triggered When:**

- A bid is placed within the extra time window (last X minutes before auction end)
- Auction end time is automatically extended

**Payload:**

```typescript
{
  auctionId: string,
  newEndTime: Date,
  extensionMinutes: number,
  reason: string,
  timestamp: Date
}
```

**Example Response:**

```json
{
  "auctionId": "507f1f77bcf86cd799439012",
  "newEndTime": "2024-01-20T16:00:00.000Z",
  "extensionMinutes": 5,
  "reason": "Bid placed within last 5 minutes",
  "timestamp": "2024-01-20T15:55:00.000Z"
}
```

**Auto-Extension Logic:**

- If `extraTime` is set on auction (e.g., 5 minutes)
- When bid is placed within last 5 minutes before end time
- End time is extended by another 5 minutes from bid time
- Process repeats for subsequent bids in extra time window

**Use Cases:**

- Update countdown timer with new end time
- Show notification: "Auction extended by 5 minutes!"
- Prevent "sniping" strategies

---

##### 4. Auction Ended

```javascript
// Event: 'auction_ended'
socket.on("auction_ended", (data) => {
  console.log("Auction ended:", data);
  showAuctionResults(data);
});
```

**Triggered When:**

- Auction time expires
- Admin manually ends auction (if implemented)

**Payload:**

```typescript
{
  auctionId: string,
  winner: {
    userId: string,
    name: string,
    winningBid: number
  } | null,
  totalBids: number,
  totalParticipants: number,
  timestamp: Date
}
```

**Example Response:**

```json
{
  "auctionId": "507f1f77bcf86cd799439012",
  "winner": {
    "userId": "507f1f77bcf86cd799439013",
    "name": "John Doe",
    "winningBid": 15000
  },
  "totalBids": 25,
  "totalParticipants": 8,
  "timestamp": "2024-01-20T16:00:00.000Z"
}
```

---

##### 5. Error

```javascript
// Event: 'error'
socket.on("error", (data) => {
  console.error("WebSocket error:", data);
  showErrorMessage(data.message);
});
```

**Triggered When:**

- WebSocket operation fails
- Authentication fails
- Room join/leave fails

**Payload:**

```typescript
{
  message: string,
  code?: string,
  timestamp: Date
}
```

---

## Bidding System Features

### 1. Automatic Bid Type Assignment

When a bid is placed, the system automatically assigns the appropriate bid type:

- **`initial`** - First bid on an auction
- **`winning`** - Current highest bid (active)
- **`outbid`** - Previously highest bid that has been surpassed
- **`auto`** - Automated bid (for future auto-bidding feature)

### 2. Bid Validation

Before accepting a bid, the system validates:

- ✅ User is authenticated
- ✅ User account is not banned
- ✅ Auction exists
- ✅ Auction has not ended
- ✅ Bid amount is greater than current highest bid
- ✅ Bid amount is positive

### 3. Automatic Time Extension

Smart time extension prevents last-second "sniping":

**Configuration:**

- Set `extraTime` on auction (in minutes, e.g., 5)
- If `extraTime = 0`, feature is disabled

**How It Works:**

```
Original end time: 16:00
Extra time: 5 minutes
Threshold window: 15:55 - 16:00

Scenario 1: Bid at 15:56
- New end time: 16:01 (5 minutes from bid time)
- Emits time_extension event

Scenario 2: Bid at 15:54 (before window)
- End time unchanged (16:00)
- No extension event

Scenario 3: Bid at 15:58 (after extension)
- New end time: 16:03 (another 5 minutes)
- Can extend multiple times
```

### 4. Previous Bid Deactivation

When a new highest bid is placed:

- Previous highest bid is marked as `isActive: false`
- Previous bid type changed to `"outbid"`
- Allows tracking of bid history
- Enables "outbid" notifications

### 5. Real-Time Leaderboard

Automatically calculated and broadcast:

- Participants sorted by highest bid (descending)
- Includes rank, total bids, and bid statistics
- Updates instantly on new bid
- Shows current winner clearly

---

## Data Models

### Auction Model

```typescript
{
  _id: ObjectId,
  itemName: string,           // Name of auction item
  startPrice: number,         // Starting bid price
  endPrice: number,           // Final price (if won)
  startDate: Date,            // Auction start date
  endDate: Date,              // Auction end date
  endTime: Date,              // Auction end time (can be extended)
  extraTime: number,          // Extra time in minutes for auto-extension
  highestBid: number,         // Current highest bid amount
  media: [
    {
      fileUrl: string         // Image/video URL
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Auction Activity Model

```typescript
{
  _id: ObjectId,
  auctionId: ObjectId,                                    // Reference to Auction
  userId: ObjectId,                                       // Reference to User
  bidAmount: number,                                      // Bid amount
  bidType: 'initial' | 'outbid' | 'winning' | 'auto',   // Bid type
  isActive: boolean,                                      // Is current highest bid
  bidTime: Date,                                          // When bid was placed
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

Optimized for performance:

```typescript
// Compound indexes
{ auctionId: 1, userId: 1 }              // User's bids for specific auction
{ auctionId: 1, bidAmount: -1 }          // Highest bids for auction
{ auctionId: 1, isActive: 1, bidAmount: -1 } // Active highest bid
{ userId: 1, createdAt: -1 }             // User's bid history
{ itemName: 'text' }                     // Full-text search on auction items
```

---

## Error Handling

### REST API Error Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created (bid placed)
- `400` - Bad Request (validation failed, auction ended, bid too low)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (banned user, insufficient permissions)
- `404` - Not Found (auction or user not found)
- `500` - Internal Server Error

### WebSocket Errors

```javascript
socket.on("error", (data) => {
  // data.message - Human-readable error message
  // data.code - Optional error code
  // data.timestamp - When error occurred
});
```

---

## Client Integration Examples

### React/Next.js Example

```javascript
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function AuctionLeaderboard({ auctionId, authToken }) {
  const [socket, setSocket] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [latestBid, setLatestBid] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:3000", {
      auth: { token: authToken },
      transports: ["websocket", "polling"],
    });

    // Connection successful
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");

      // Join auction room
      newSocket.emit("join_auction", { auctionId });
    });

    // Leaderboard updates
    newSocket.on("auction_leaderboard_update", (data) => {
      console.log("Leaderboard updated:", data);
      setLeaderboard(data);
    });

    // New bid notifications
    newSocket.on("new_bid_placed", (data) => {
      console.log("New bid:", data);
      setLatestBid(data);

      // Show toast notification
      showToast(`${data.userName} bid $${data.bidAmount}`);
    });

    // Time extension
    newSocket.on("auction_time_extended", (data) => {
      console.log("Time extended:", data);
      showToast(`Auction extended by ${data.extensionMinutes} minutes!`);
    });

    // Auction ended
    newSocket.on("auction_ended", (data) => {
      console.log("Auction ended:", data);
      showResults(data);
    });

    // Error handling
    newSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
      showError(error.message);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.emit("leave_auction", { auctionId });
        newSocket.disconnect();
      }
    };
  }, [auctionId, authToken]);

  // Place bid via REST API
  const placeBid = async (bidAmount) => {
    try {
      const response = await fetch("http://localhost:3000/api/auction-activity/bid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          auctionId,
          bidAmount,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast("Bid placed successfully!");
        // WebSocket will automatically update leaderboard
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      showError("Failed to place bid");
    }
  };

  return (
    <div>
      <h2>Auction Leaderboard</h2>

      {/* Current highest bid */}
      {leaderboard?.currentWinner && (
        <div className="current-winner">
          <h3>Current Winner: {leaderboard.currentWinner.name}</h3>
          <p>Highest Bid: ${leaderboard.currentWinner.bidAmount}</p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="leaderboard">
        {leaderboard?.participants.map((participant) => (
          <div key={participant.userId} className="participant">
            <span className="rank">#{participant.rank}</span>
            <span className="name">{participant.name}</span>
            <span className="bid">${participant.highestBid}</span>
            <span className="bids">{participant.totalBids} bids</span>
            {participant.isHighestBidder && <span className="badge">Leading</span>}
          </div>
        ))}
      </div>

      {/* Bid form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const amount = Number(e.target.amount.value);
          placeBid(amount);
        }}
      >
        <input type="number" name="amount" placeholder="Enter bid amount" min={leaderboard?.currentHighestBid + 1 || 0} />
        <button type="submit">Place Bid</button>
      </form>
    </div>
  );
}

export default AuctionLeaderboard;
```

### Vanilla JavaScript Example

```javascript
// Initialize connection
const socket = io("http://localhost:3000", {
  auth: {
    token: localStorage.getItem("authToken"),
  },
});

// Join auction room
socket.emit("join_auction", {
  auctionId: "507f1f77bcf86cd799439012",
});

// Listen for leaderboard updates
socket.on("auction_leaderboard_update", (data) => {
  updateLeaderboard(data);
});

// Listen for new bids
socket.on("new_bid_placed", (data) => {
  showNotification(`${data.userName} placed a bid of $${data.bidAmount}`);
});

// Place bid via REST API
async function placeBid(auctionId, bidAmount) {
  const response = await fetch("/api/auction-activity/bid", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify({ auctionId, bidAmount }),
  });

  return response.json();
}

// Update UI with leaderboard
function updateLeaderboard(data) {
  const container = document.getElementById("leaderboard");
  container.innerHTML = data.participants
    .map(
      (p) => `
    <div class="participant ${p.isHighestBidder ? "winner" : ""}">
      <span>#${p.rank}</span>
      <span>${p.name}</span>
      <span>$${p.highestBid}</span>
      <span>${p.totalBids} bids</span>
    </div>
  `
    )
    .join("");
}
```

---

## Security Considerations

### Authentication

- ✅ JWT token required for all REST endpoints
- ✅ JWT token required for WebSocket connection
- ✅ Token verified on every connection
- ✅ User ID extracted from token (prevents spoofing)

### Authorization

- ✅ Users can only view their own bid history
- ✅ Admins can view all bid histories
- ✅ Admin-only endpoints properly protected
- ✅ Banned users cannot place bids

### Data Validation

- ✅ All inputs validated with Zod schemas
- ✅ MongoDB ObjectId validation
- ✅ Bid amount validation (positive, greater than current)
- ✅ Auction state validation (not ended)

### Rate Limiting (Recommended)

Consider implementing:

- Rate limiting on bid placement (e.g., max 10 bids per minute)
- WebSocket connection rate limiting
- DDoS protection

---

## Performance Optimizations

### Database Indexes

- Compound indexes for efficient queries
- Text index for item name search
- Optimized for common query patterns

### WebSocket Rooms

- Users only receive updates for auctions they've joined
- Reduces unnecessary network traffic
- Scalable to thousands of concurrent auctions

### Caching (Future Enhancement)

Consider implementing:

- Redis cache for current highest bids
- Cached leaderboard with TTL
- Reduces database queries

---

## Testing

### REST API Testing (cURL)

```bash
# Place bid
curl -X POST http://localhost:3000/api/auction-activity/bid \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"auctionId":"507f1f77bcf86cd799439012","bidAmount":15000}'

# Get participants
curl -X GET http://localhost:3000/api/auction-activity/auction/507f1f77bcf86cd799439012/participants \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get stats
curl -X GET http://localhost:3000/api/auction-activity/auction/507f1f77bcf86cd799439012/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### WebSocket Testing (Socket.io Client)

```javascript
const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: { token: "YOUR_TOKEN" },
});

socket.on("connect", () => {
  console.log("Connected");
  socket.emit("join_auction", { auctionId: "507f1f77bcf86cd799439012" });
});

socket.on("auction_leaderboard_update", (data) => {
  console.log("Leaderboard:", data);
});
```

---

## Conclusion

This auction activity system provides a robust, real-time bidding experience with:

- ✅ RESTful API for bid management
- ✅ WebSocket for real-time updates
- ✅ Automatic time extensions
- ✅ Live leaderboard
- ✅ Comprehensive bid tracking
- ✅ Admin analytics
- ✅ Security & validation
- ✅ Scalable architecture

The system is production-ready and can handle multiple concurrent auctions with real-time updates to all connected clients.
