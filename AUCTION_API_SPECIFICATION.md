# Auction API Specification

## Overview

The Auction API provides endpoints for managing auctions, including creating, reading, updating, and deleting auction items. This specification includes the updated **priceMultiplication** feature that replaces the previous `endPrice` field.

**Base URL**: `/api/auction`

**Authentication**: Most endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Price Multiplication Feature

Starting from this version, auctions use a **priceMultiplication** system instead of a fixed end price. This feature ensures:

- **Bid increments** are defined by `priceMultiplication` (the increment amount in nominal value)
- **Valid bid amounts** must follow the formula: `startPrice + (n × priceMultiplication)` where n = 0, 1, 2, 3, ...
- **Consistent bidding** prevents irregular bid amounts

### Example:

- If `startPrice = 30000` and `priceMultiplication = 100000`
- Valid bids: `30000`, `130000`, `230000`, `330000`, etc.
- Invalid bids: `50000`, `100000`, `150000` (not following the increment pattern)

### Another Example:

- If `startPrice = 50000` and `priceMultiplication = 50000`
- Valid bids: `50000`, `100000`, `150000`, `200000`, etc.
- Invalid bids: `75000`, `125000`, `175000`

---

## Auction Data Model

### Auction Schema

```typescript
interface IAuction {
  _id: string;
  itemName: string;
  note: string;
  startPrice: number;
  priceMultiplication: number; // Bid increment amount (default: same as startPrice)
  startDate: Date;
  endDate: Date;
  endTime: Date;
  extraTime: number; // Default: 0 (minutes)
  highestBid: number; // Default: 0
  media: Array<{
    fileUrl: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Endpoints

### 1. Get All Auctions

Retrieves all auctions with pagination and search functionality.

**Endpoint**: `GET /api/auction`

**Access**: Public

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term for auction item name

**Success Response** (200 OK):

```json
{
  "status": "success",
  "message": "Auctions retrieved successfully",
  "data": {
    "auctions": [
      {
        "_id": "string",
        "itemName": "Premium Koi Fish - Kohaku",
        "note": "Beautiful premium koi with excellent pattern",
        "startPrice": 30000,
        "priceMultiplication": 1,
        "startDate": "2024-12-01T00:00:00.000Z",
        "endDate": "2024-12-31T23:59:59.000Z",
        "endTime": "2024-12-31T23:59:59.000Z",
        "extraTime": 5,
        "highestBid": 150000,
        "media": [
          {
            "fileUrl": "/media/auctions/koi-123.jpg"
          }
        ],
        "createdAt": "2024-11-01T10:00:00.000Z",
        "updatedAt": "2024-11-29T15:30:00.000Z",
        "currentHighestBid": 150000,
        "currentWinner": {
          "_id": "user123",
          "name": "John Doe",
          "bidAmount": 150000
        }
      }
    ],
    "metadata": {
      "page": 1,
      "limit": 10,
      "totalItems": 50,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "statistics": {
      "totalAuctions": 50,
      "activeAuctions": 30,
      "endedAuctions": 20
    },
    "eventDetail": {
      "totalBidAmount": 5000000
    }
  }
}
```

**Example Request**:

```bash
curl -X GET "https://api.example.com/api/auction?page=1&limit=10&search=koi"
```

---

### 2. Create Auction

Creates a new auction with media files.

**Endpoint**: `POST /api/auction`

**Access**: Private (Authenticated users - Admin only)

**Content-Type**: `multipart/form-data`

**Form Data**:

- `itemName` (required): Auction item name (max 200 characters)
- `note` (optional): Additional notes or description
- `startPrice` (required): Starting price (must be > 0)
- `priceMultiplication` (optional): Bid increment amount in nominal value (default: same as startPrice, must be ≥ 1)
- `startDate` (required): Auction start date (ISO 8601 format, must be in the future)
- `endDate` (required): Auction end date (ISO 8601 format, must be after startDate)
- `endTime` (optional): Specific end time (HH:MM:SS format)
- `extraTime` (optional): Extra time in minutes for auto-extension (default: 5)
- `highestBid` (optional): Initial highest bid (default: 0)
- `media` (optional): Array of image files (max 10 files, 5MB each)

**Validation Rules**:

- `itemName`: Non-empty, max 200 characters
- `startPrice`: Must be greater than 0
- `priceMultiplication`: Must be 1 or greater (represents the bid increment amount)
- `startDate`: Must be a future date
- `endDate`: Must be after `startDate`
- `media`: Max 10 files, each max 5MB, accepted formats: jpg, jpeg, png, gif, webp

**Success Response** (201 Created):

```json
{
  "status": "success",
  "message": "Auction created successfully",
  "data": {
    "_id": "674a1234567890abcdef1234",
    "itemName": "Premium Koi Fish - Kohaku",
    "note": "Beautiful premium koi with excellent pattern",
    "startPrice": 30000,
    "priceMultiplication": 100000,
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "endTime": "2024-12-31T23:59:59.000Z",
    "extraTime": 5,
    "highestBid": 0,
    "media": [
      {
        "fileUrl": "/media/auctions/koi-123.jpg"
      }
    ],
    "createdAt": "2024-11-29T10:00:00.000Z",
    "updatedAt": "2024-11-29T10:00:00.000Z"
  }
}
```

**Error Responses**:

- **400 Bad Request** (Validation Error):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["itemName: Item name is required", "startPrice: Start price must be greater than 0", "priceMultiplication: Price multiplication must be 1 or greater"]
}
```

- **400 Bad Request** (Date Validation):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["endDate: End date must be after start date"]
}
```

**Example Request**:

```bash
curl -X POST https://api.example.com/api/auction \
  -H "Authorization: Bearer <token>" \
  -F "itemName=Premium Koi Fish - Kohaku" \
  -F "note=Beautiful premium koi" \
  -F "startPrice=30000" \
  -F "priceMultiplication=100000" \
  -F "startDate=2024-12-01T00:00:00.000Z" \
  -F "endDate=2024-12-31T23:59:59.000Z" \
  -F "endTime=23:59:59" \
  -F "extraTime=5" \
  -F "media=@/path/to/image1.jpg" \
  -F "media=@/path/to/image2.jpg"
```

---

### 3. Get Auction by ID

Retrieves a specific auction by its ID.

**Endpoint**: `GET /api/auction/:id`

**Access**: Public

**URL Parameters**:

- `id` (required): Auction ID

**Success Response** (200 OK):

```json
{
  "status": "success",
  "message": "Auction retrieved successfully",
  "data": {
    "_id": "674a1234567890abcdef1234",
    "itemName": "Premium Koi Fish - Kohaku",
    "note": "Beautiful premium koi with excellent pattern",
    "startPrice": 30000,
    "priceMultiplication": 1,
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "endTime": "2024-12-31T23:59:59.000Z",
    "extraTime": 5,
    "highestBid": 150000,
    "media": [
      {
        "fileUrl": "/media/auctions/koi-123.jpg"
      }
    ],
    "createdAt": "2024-11-01T10:00:00.000Z",
    "updatedAt": "2024-11-29T15:30:00.000Z"
  }
}
```

**Error Responses**:

- **404 Not Found**:

```json
{
  "success": false,
  "message": "Auction not found"
}
```

**Example Request**:

```bash
curl -X GET https://api.example.com/api/auction/674a1234567890abcdef1234
```

---

### 4. Update Auction

Updates an existing auction.

**Endpoint**: `PUT /api/auction/:id`

**Access**: Private (Authenticated users - Admin only)

**Content-Type**: `multipart/form-data`

**URL Parameters**:

- `id` (required): Auction ID

**Form Data** (all optional):

- `itemName`: Auction item name
- `note`: Additional notes
- `startPrice`: Starting price
- `priceMultiplication`: Price multiplication factor
- `startDate`: Auction start date
- `endDate`: Auction end date
- `endTime`: Specific end time
- `highestBid`: Current highest bid
- `media`: New media files (replaces existing)

**Success Response** (200 OK):

```json
{
  "status": "success",
  "message": "Auction updated successfully",
  "data": {
    "_id": "674a1234567890abcdef1234",
    "itemName": "Updated Premium Koi Fish",
    "note": "Updated description",
    "startPrice": 35000,
    "priceMultiplication": 2,
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "endTime": "2024-12-31T23:59:59.000Z",
    "extraTime": 5,
    "highestBid": 150000,
    "media": [
      {
        "fileUrl": "/media/auctions/koi-updated-123.jpg"
      }
    ],
    "createdAt": "2024-11-01T10:00:00.000Z",
    "updatedAt": "2024-11-29T16:00:00.000Z"
  }
}
```

**Error Responses**:

- **404 Not Found**:

```json
{
  "success": false,
  "message": "Auction not found"
}
```

**Example Request**:

```bash
curl -X PUT https://api.example.com/api/auction/674a1234567890abcdef1234 \
  -H "Authorization: Bearer <token>" \
  -F "itemName=Updated Premium Koi Fish" \
  -F "startPrice=35000" \
  -F "priceMultiplication=2" \
  -F "media=@/path/to/new-image.jpg"
```

---

### 5. Delete Auction

Deletes an auction by ID.

**Endpoint**: `DELETE /api/auction/:id`

**Access**: Private (Authenticated users - Admin only)

**URL Parameters**:

- `id` (required): Auction ID

**Success Response** (200 OK):

```json
{
  "status": "success",
  "message": "Auction deleted successfully",
  "data": null
}
```

**Error Responses**:

- **404 Not Found**:

```json
{
  "success": false,
  "message": "Auction not found"
}
```

**Example Request**:

```bash
curl -X DELETE https://api.example.com/api/auction/674a1234567890abcdef1234 \
  -H "Authorization: Bearer <token>"
```

---

## Price Multiplication Examples

### Example 1: Increment of 100,000

```
startPrice: 50000
priceMultiplication: 100000

Valid bids: 50000, 150000, 250000, 350000, 450000
Formula: startPrice + (n × priceMultiplication)
  - 50000 + (0 × 100000) = 50000
  - 50000 + (1 × 100000) = 150000
  - 50000 + (2 × 100000) = 250000

Invalid bids: 75000, 100000, 200000 (not following the pattern)
```

### Example 2: Increment of 50,000

```
startPrice: 30000
priceMultiplication: 50000

Valid bids: 30000, 80000, 130000, 180000, 230000
Formula: startPrice + (n × priceMultiplication)
  - 30000 + (0 × 50000) = 30000
  - 30000 + (1 × 50000) = 80000
  - 30000 + (2 × 50000) = 130000

Invalid bids: 50000, 100000, 150000
```

### Example 3: Same as Start Price

```
startPrice: 25000
priceMultiplication: 25000

Valid bids: 25000, 50000, 75000, 100000, 125000
Formula: startPrice + (n × priceMultiplication)
  - 25000 + (0 × 25000) = 25000
  - 25000 + (1 × 25000) = 50000
  - 25000 + (2 × 25000) = 75000

Invalid bids: 30000, 40000, 60000
```

---

## Error Codes

| Status Code | Description                            |
| ----------- | -------------------------------------- |
| 200         | Success                                |
| 201         | Resource created successfully          |
| 400         | Bad request - validation error         |
| 401         | Unauthorized - authentication required |
| 403         | Forbidden - insufficient permissions   |
| 404         | Resource not found                     |
| 500         | Internal server error                  |

---

## Notes

1. **Price Multiplication**: The `priceMultiplication` field is the **nominal increment amount** for bids. Valid bids follow the formula: `startPrice + (n × priceMultiplication)` where n = 0, 1, 2, 3, ...

2. **Media Files**: Maximum 10 files per auction, each file max 5MB. Supported formats: jpg, jpeg, png, gif, webp.

3. **Extra Time**: When a bid is placed within the `extraTime` window before auction end, the auction automatically extends by `extraTime` minutes.

4. **Time Zones**: All dates are stored and returned in UTC (ISO 8601 format).

5. **Authentication**: Create, update, and delete operations require admin authentication.

6. **Search**: The search parameter performs a text search on the `itemName` field.

---

## Migration from `endPrice` to `priceMultiplication`

If you're migrating from the old `endPrice` system:

**Old System**:

```json
{
  "startPrice": 30000,
  "endPrice": 500000
}
```

**New System**:

```json
{
  "startPrice": 30000,
  "priceMultiplication": 100000
}
```

The new system provides more flexibility and ensures consistent bidding increments. The `priceMultiplication` is a nominal value representing how much each bid should increase.
