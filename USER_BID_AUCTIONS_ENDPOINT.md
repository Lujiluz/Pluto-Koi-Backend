# User Bid Auctions Endpoint Documentation

## Overview

This endpoint allows authenticated users to retrieve a paginated list of all auctions where they have placed bids, along with their bidding statistics for each auction.

## Endpoint Details

### Route

```
GET /api/auction-activity/my-auctions
```

### Access

- **Authentication Required**: Yes (Bearer Token)
- **Role Required**: Any authenticated user

### Query Parameters

| Parameter | Type   | Required | Default | Description                          |
| --------- | ------ | -------- | ------- | ------------------------------------ |
| page      | number | No       | 1       | Page number for pagination           |
| limit     | number | No       | 10      | Number of auctions per page (max 50) |

### Response Format

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "User bid auctions retrieved successfully",
  "data": {
    "auctions": [
      {
        "auction": {
          "_id": "auction_id",
          "itemName": "Premium Koi Fish",
          "note": "Special auction item",
          "startPrice": 100000,
          "priceMultiplication": 1,
          "startDate": "2025-11-01T00:00:00.000Z",
          "endDate": "2025-11-30T23:59:59.000Z",
          "endTime": "2025-11-30T23:59:59.000Z",
          "extraTime": 5,
          "highestBid": 500000,
          "media": [
            {
              "fileUrl": "https://example.com/image.jpg"
            }
          ],
          "createdAt": "2025-11-01T00:00:00.000Z",
          "updatedAt": "2025-11-20T10:30:00.000Z"
        },
        "userBidInfo": {
          "totalBids": 5,
          "highestBid": 450000,
          "latestBid": {
            "amount": 450000,
            "bidType": "outbid",
            "bidTime": "2025-11-20T10:30:00.000Z"
          },
          "isCurrentWinner": false
        },
        "currentHighestBid": 500000,
        "auctionStatus": "active"
      }
    ],
    "metadata": {
      "page": 1,
      "limit": 10,
      "totalItems": 15,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

#### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "message": "Authentication required"
}
```

## Response Fields Explanation

### Auction Object

- `_id`: Unique identifier for the auction
- `itemName`: Name of the item being auctioned
- `note`: Additional notes about the auction
- `startPrice`: Starting price for the auction
- `priceMultiplication`: Price multiplier to calculate valid bid increments (default: 1)
- `startDate`: When the auction starts
- `endDate`: When the auction ends
- `endTime`: Exact time when auction ends
- `extraTime`: Extra time extension in minutes if bid placed near end
- `highestBid`: Current highest bid amount
- `media`: Array of media files for the auction item
- `createdAt`: When the auction was created
- `updatedAt`: When the auction was last updated

**Note**: Valid bid amounts must be exact multiples of `startPrice × priceMultiplication`.

### User Bid Info

- `totalBids`: Total number of bids the user has placed on this auction
- `highestBid`: User's highest bid amount for this auction
- `latestBid`: Details of the user's most recent bid
  - `amount`: The bid amount
  - `bidType`: Type of bid (initial, outbid, winning, auto)
  - `bidTime`: When the bid was placed
- `isCurrentWinner`: Boolean indicating if the user is currently winning this auction

### Additional Fields

- `currentHighestBid`: The current highest bid across all participants
- `auctionStatus`: Status of the auction (active, ended)

### Metadata

Standard pagination metadata:

- `page`: Current page number
- `limit`: Number of items per page
- `totalItems`: Total number of auctions user has bid on
- `totalPages`: Total number of pages
- `hasNextPage`: Boolean indicating if there are more pages
- `hasPreviousPage`: Boolean indicating if there are previous pages

## Usage Examples

### Example 1: Get First Page of User's Bid Auctions

```bash
curl -X GET \
  'http://localhost:3000/api/auction-activity/my-auctions?page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Example 2: Get Second Page with Custom Limit

```bash
curl -X GET \
  'http://localhost:3000/api/auction-activity/my-auctions?page=2&limit=20' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Example 3: Using with Axios (JavaScript)

```javascript
const response = await axios.get("/api/auction-activity/my-auctions", {
  params: {
    page: 1,
    limit: 10,
  },
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const { auctions, metadata } = response.data.data;
```

## Use Cases

1. **User Dashboard**: Display all auctions where the user has participated
2. **Bid History**: Show user's bidding activity across all auctions
3. **Track Winning Status**: Allow users to see which auctions they're winning
4. **Auction Management**: Help users manage their active bids

## Implementation Details

### Service Layer

- Method: `getUserBidAuctions(userId, page, limit)`
- Location: `src/services/auction.activity.service.ts`
- Uses MongoDB `distinct()` to find unique auctions
- Aggregates user bid statistics per auction
- Determines current winner status
- Calculates auction status (active/ended)

### Controller Layer

- Method: `getUserBidAuctions(req, res, next)`
- Location: `src/controllers/auction.activity.controller.ts`
- Extracts authenticated user ID from JWT token
- Validates pagination parameters
- Handles error responses

### Route Configuration

- Path: `/my-auctions`
- Location: `src/routes/auction.activity.routes.ts`
- Middleware: `authenticateToken`, `validatePaginationQuery`
- Method: GET

## Performance Considerations

- Results are paginated to prevent large data transfers
- Uses MongoDB indexes on `userId` and `auctionId` for efficient queries
- Calculates statistics in parallel using `Promise.all()`
- Filters out deleted auctions automatically

## Security

- Requires valid JWT authentication token
- Users can only see their own bid auctions
- No sensitive user information from other bidders is exposed
- Admin privileges not required (user-specific data only)

## Future Enhancements

Potential improvements:

1. Add filtering by auction status (active, ended, won)
2. Add sorting options (by date, bid amount, auction end time)
3. Include estimated time remaining for active auctions
4. Add total bid amount spent across all auctions
5. Include notification status for outbid alerts
