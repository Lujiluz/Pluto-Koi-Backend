# Auction Activity API Specification

## Overview

The Auction Activity API provides endpoints for managing auction bids, tracking participation, and retrieving auction statistics. All endpoints require authentication.

**Base URL**: `/api/auction-activity`

**Authentication**: All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Important: Bid Amount Validation

All bid amounts **must follow the increment pattern** based on the auction's `startPrice` and `priceMultiplication`.

**Formula**: `Valid Bid = startPrice + (n × priceMultiplication)` where n = 0, 1, 2, 3, ...

### Example 1:

If an auction has:

- `startPrice = 50000`
- `priceMultiplication = 100000`

Then valid bids are:

- ✅ Valid: `50000`, `150000`, `250000`, `350000`
- ❌ Invalid: `75000`, `100000`, `200000`

### Example 2:

If an auction has:

- `startPrice = 30000`
- `priceMultiplication = 50000`

Then valid bids are:

- ✅ Valid: `30000`, `80000`, `130000`, `180000`
- ❌ Invalid: `50000`, `100000`, `150000`

If the bid amount doesn't match this requirement, the API will return:

```json
{
  "success": false,
  "message": "Bid amount must follow increment of 100.000. Valid bids: 50.000, 150.000, 250.000, etc."
}
```

---

## Endpoints

### 1. Place a Bid

Places a new bid on an auction.

**Endpoint**: `POST /api/auction-activity/bid`

**Access**: Private (Authenticated users)

**Request Body**:

```json
{
  "auctionId": "string (required)",
  "bidAmount": "number (required, positive, must follow increment pattern)",
  "bidType": "string (optional, enum: 'initial' | 'outbid' | 'winning' | 'auto')"
}
```

**Validation Rules**:

- `auctionId`: Must be a non-empty string
- `bidAmount`:
  - Must be at least `startPrice`
  - **Must follow the formula: `startPrice + (n × priceMultiplication)`** where n = 0, 1, 2, 3, ...
  - Must be higher than the current highest bid
- `bidType`: Optional, must be one of: `initial`, `outbid`, `winning`, `auto`

**Success Response** (201 Created):

```json
{
  "success": true,
  "message": "Bid placed successfully",
  "data": {
    "auctionActivity": {
      "_id": "string",
      "auctionId": "string",
      "userId": "string",
      "bidAmount": "number",
      "bidType": "string",
      "isActive": "boolean",
      "bidTime": "ISO 8601 datetime",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  }
}
```

**Error Responses**:

- **401 Unauthorized**:

```json
{
  "success": false,
  "message": "Authentication required"
}
```

- **403 Forbidden** (User Banned):

```json
{
  "success": false,
  "message": "Your account has been blocked."
}
```

- **400 Bad Request** (Invalid Bid Increment):

```json
{
  "success": false,
  "message": "Bid amount must follow increment of 100.000. Valid bids: 50.000, 150.000, 250.000, etc."
}
```

- **400 Bad Request** (Bid Below Start Price):

```json
{
  "success": false,
  "message": "Bid amount must be at least 50.000 (start price)"
}
```

- **400 Bad Request** (Bid Too Low):

```json
{
  "success": false,
  "message": "Bid must be higher than current highest bid of 150000"
}
```

- **400 Bad Request** (Validation Error):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["auctionId: Auction ID is required", "bidAmount: Bid amount must be greater than 0"]
}
```

- **400 Bad Request** (Missing Fields):

```json
{
  "success": false,
  "message": "Auction ID and bid amount are required"
}
```

- **400 Bad Request** (Invalid Amount):

```json
{
  "success": false,
  "message": "Bid amount must be greater than 0"
}
```

- **400 Bad Request** (Auction Ended):

```json
{
  "success": false,
  "message": "Auction has ended"
}
```

- **404 Not Found** (Auction Not Found):

```json
{
  "success": false,
  "message": "Auction not found"
}
```

**Example Request** (Valid bid - follows increment pattern):

For auction with `startPrice = 50000` and `priceMultiplication = 100000`:

```bash
curl -X POST https://api.example.com/api/auction-activity/bid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "auctionId": "507f1f77bcf86cd799439011",
    "bidAmount": 150000,
    "bidType": "initial"
  }'
# Valid: 150000 = 50000 + (1 × 100000)
```

**Example Request** (Invalid bid - doesn't follow increment):

```bash
curl -X POST https://api.example.com/api/auction-activity/bid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "auctionId": "507f1f77bcf86cd799439011",
    "bidAmount": 100000,
    "bidType": "initial"
  }'
# Error: Bid amount must follow increment of 100.000. Valid bids: 50.000, 150.000, 250.000, etc.
```

---

### 2. Get Auction Participants

Retrieves all participants who have placed bids on a specific auction.

**Endpoint**: `GET /api/auction-activity/auction/:auctionId/participants`

**Access**: Private (Authenticated users)

**URL Parameters**:

- `auctionId` (required): The auction ID

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Auction participation retrieved successfully",
  "data": {
    "auctionId": "string",
    "currentHighestBid": "number",
    "currentWinner": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "totalParticipants": "number",
    "participants": [
      {
        "_id": "string",
        "auctionId": "string",
        "userId": {
          "_id": "string",
          "name": "string",
          "email": "string",
          "role": "string"
        },
        "bidAmount": "number",
        "bidType": "string",
        "isActive": "boolean",
        "bidTime": "ISO 8601 datetime",
        "createdAt": "ISO 8601 datetime",
        "updatedAt": "ISO 8601 datetime"
      }
    ]
  }
}
```

**Error Responses**:

- **400 Bad Request**:

```json
{
  "success": false,
  "message": "Parameter validation failed",
  "errors": ["auctionId: Auction ID is required"]
}
```

**Example Request**:

```bash
curl -X GET https://api.example.com/api/auction-activity/auction/507f1f77bcf86cd799439011/participants \
  -H "Authorization: Bearer <token>"
```

---

### 3. Get Current Highest Bid

Retrieves the current highest bid information for an auction.

**Endpoint**: `GET /api/auction-activity/auction/:auctionId/highest-bid`

**Access**: Private (Authenticated users)

**URL Parameters**:

- `auctionId` (required): The auction ID

**Success Response** (200 OK):

```json
{
  "status": "success",
  "message": "Current highest bid retrieved successfully",
  "data": {
    "auctionId": "string",
    "currentHighestBid": "number",
    "currentWinner": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    } | null,
    "totalParticipants": "number"
  }
}
```

**Error Responses**:

- **400 Bad Request**:

```json
{
  "success": false,
  "message": "Auction ID is required"
}
```

**Example Request**:

```bash
curl -X GET https://api.example.com/api/auction-activity/auction/507f1f77bcf86cd799439011/highest-bid \
  -H "Authorization: Bearer <token>"
```

---

### 4. Get Auction Statistics

Retrieves comprehensive statistics for an auction.

**Endpoint**: `GET /api/auction-activity/auction/:auctionId/stats`

**Access**: Private (Authenticated users)

**URL Parameters**:

- `auctionId` (required): The auction ID

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Auction statistics retrieved successfully",
  "data": {
    "auctionId": "string",
    "totalBids": "number",
    "totalParticipants": "number",
    "currentHighestBid": "number",
    "averageBidAmount": "number",
    "lowestBid": "number",
    "highestBid": "number",
    "bidHistory": [
      {
        "bidAmount": "number",
        "bidTime": "ISO 8601 datetime",
        "userId": "string"
      }
    ]
  }
}
```

**Error Responses**:

- **400 Bad Request**:

```json
{
  "success": false,
  "message": "Auction ID is required"
}
```

**Example Request**:

```bash
curl -X GET https://api.example.com/api/auction-activity/auction/507f1f77bcf86cd799439011/stats \
  -H "Authorization: Bearer <token>"
```

---

### 5. Get User Auction History

Retrieves a user's bid history for a specific auction. Users can view their own history, while admins can view any user's history.

**Endpoint**: `GET /api/auction-activity/auction/:auctionId/user/:userId/history`

**Access**:

- Private (own history)
- Admin (other user's history)

**URL Parameters**:

- `auctionId` (required): The auction ID
- `userId` (required): The user ID (use own ID for personal history)

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "User auction history retrieved successfully",
  "data": {
    "auctionId": "string",
    "userId": "string",
    "bidHistory": [
      {
        "_id": "string",
        "auctionId": "string",
        "userId": "string",
        "bidAmount": "number",
        "bidType": "string",
        "isActive": "boolean",
        "bidTime": "ISO 8601 datetime",
        "createdAt": "ISO 8601 datetime",
        "updatedAt": "ISO 8601 datetime"
      }
    ],
    "totalBids": "number",
    "highestBid": "number",
    "latestBid": "number"
  }
}
```

**Error Responses**:

- **401 Unauthorized**:

```json
{
  "success": false,
  "message": "Authentication required"
}
```

- **403 Forbidden** (Non-admin accessing other user's history):

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

- **400 Bad Request**:

```json
{
  "success": false,
  "message": "Auction ID is required"
}
```

**Example Request**:

```bash
# Get own history
curl -X GET https://api.example.com/api/auction-activity/auction/507f1f77bcf86cd799439011/user/507f191e810c19729de860ea/history \
  -H "Authorization: Bearer <token>"

# Admin getting another user's history
curl -X GET https://api.example.com/api/auction-activity/auction/507f1f77bcf86cd799439011/user/507f191e810c19729de860eb/history \
  -H "Authorization: Bearer <admin_token>"
```

---

### 6. Get All Auction Activities (Admin Only)

Retrieves all auction activities across all auctions with pagination.

**Endpoint**: `GET /api/auction-activity/all`

**Access**: Admin only

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "All auction activities retrieved successfully",
  "data": {
    "activities": [
      {
        "_id": "string",
        "auctionId": {
          "_id": "string",
          "title": "string",
          "status": "string"
        },
        "userId": {
          "_id": "string",
          "name": "string",
          "email": "string",
          "role": "string"
        },
        "bidAmount": "number",
        "bidType": "string",
        "isActive": "boolean",
        "bidTime": "ISO 8601 datetime",
        "createdAt": "ISO 8601 datetime",
        "updatedAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "currentPage": "number",
      "totalPages": "number",
      "totalItems": "number",
      "itemsPerPage": "number",
      "hasNextPage": "boolean",
      "hasPreviousPage": "boolean"
    }
  }
}
```

**Error Responses**:

- **403 Forbidden** (Non-admin user):

```json
{
  "success": false,
  "message": "Admin access required"
}
```

- **400 Bad Request** (Invalid query parameters):

```json
{
  "success": false,
  "message": "Query validation failed",
  "errors": ["page: Page must be a positive number"]
}
```

**Example Request**:

```bash
curl -X GET "https://api.example.com/api/auction-activity/all?page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

---

## Data Models

### Auction Activity

```typescript
{
  _id: ObjectId,
  auctionId: ObjectId (ref: Auction),
  userId: ObjectId (ref: User),
  bidAmount: number (min: 0),
  bidType: 'initial' | 'outbid' | 'winning' | 'auto',
  isActive: boolean,
  bidTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Bid Types

- **`initial`**: First bid placed by a user
- **`outbid`**: Bid placed after being outbid by another user
- **`winning`**: Currently winning bid
- **`auto`**: Automatically placed bid (if auto-bid feature is enabled)

---

## Common Error Codes

| Status Code | Description                                             |
| ----------- | ------------------------------------------------------- |
| 200         | OK - Request successful                                 |
| 201         | Created - Resource created successfully                 |
| 400         | Bad Request - Invalid input or validation error         |
| 401         | Unauthorized - Authentication required or token invalid |
| 403         | Forbidden - Insufficient permissions                    |
| 404         | Not Found - Resource not found                          |
| 500         | Internal Server Error - Server error                    |

---

## Notes

1. **Authentication**: All endpoints require a valid JWT token
2. **Authorization**: Some endpoints have role-based access control (admin vs regular user)
3. **Pagination**: Admin endpoints support pagination with `page` and `limit` query parameters
4. **Bid Validation**: The system validates that bids are positive numbers and meet auction requirements
5. **Real-time Updates**: Bid activities may trigger real-time notifications via WebSocket connections
6. **Active Bids**: The `isActive` flag indicates if a bid is still considered valid for the auction
7. **Timestamps**: All timestamps are in ISO 8601 format (e.g., "2025-11-19T10:30:00.000Z")

---

## Example Workflow

### Placing a Bid and Checking Status

1. **Place a bid**:

```bash
POST /api/auction-activity/bid
{
  "auctionId": "507f1f77bcf86cd799439011",
  "bidAmount": 15000,
  "bidType": "initial"
}
```

2. **Check current highest bid**:

```bash
GET /api/auction-activity/auction/507f1f77bcf86cd799439011/highest-bid
```

3. **View all participants**:

```bash
GET /api/auction-activity/auction/507f1f77bcf86cd799439011/participants
```

4. **Check personal bid history**:

```bash
GET /api/auction-activity/auction/507f1f77bcf86cd799439011/user/507f191e810c19729de860ea/history
```

5. **View auction statistics**:

```bash
GET /api/auction-activity/auction/507f1f77bcf86cd799439011/stats
```
