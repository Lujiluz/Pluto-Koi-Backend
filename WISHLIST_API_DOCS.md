# Wishlist API Documentation

## Overview

The Wishlist API allows users to manage their wishlist items, which can include both products and auctions. The system uses an **embedding approach** where essential item data is stored directly in the wishlist document for quick access, while maintaining references to the original items.

## Base URL

```
/api/pluto-koi/v1/wishlist
```

## Authentication

All wishlist endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Wishlist Model Structure

The wishlist uses an embedded approach with the following structure:

```typescript
{
  userId: ObjectId,           // Reference to the user
  items: [
    {
      itemId: ObjectId,       // Reference to product or auction
      itemType: "product" | "auction",
      itemData: {
        itemName: string,     // Embedded item name
        price: number,        // Embedded current price
        imageUrl: string      // Embedded first image URL
      },
      addedAt: Date          // When item was added to wishlist
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Benefits of Embedding Approach:

1. **Fast Retrieval**: No need for multiple database joins
2. **Data Snapshot**: Preserves item information at the time of addition
3. **Reduced Queries**: Single query returns all necessary information
4. **Sync Capability**: Can update embedded data when needed

## Endpoints

### 1. Get User's Wishlist

Retrieves the complete wishlist for the authenticated user.

**Endpoint:** `GET /api/pluto-koi/v1/wishlist`

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "message": "Wishlist retrieved successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439011",
    "userId": "607f1f77bcf86cd799439010",
    "items": [
      {
        "itemId": "607f1f77bcf86cd799439012",
        "itemType": "product",
        "itemData": {
          "itemName": "Premium Koi Fish",
          "price": 150000,
          "imageUrl": "http://localhost:3000/media/products/image1.jpg"
        },
        "addedAt": "2025-10-20T10:00:00.000Z"
      },
      {
        "itemId": "607f1f77bcf86cd799439013",
        "itemType": "auction",
        "itemData": {
          "itemName": "Rare Koi Collection",
          "price": 200000,
          "imageUrl": "http://localhost:3000/media/auctions/image2.jpg"
        },
        "addedAt": "2025-10-21T14:30:00.000Z"
      }
    ],
    "createdAt": "2025-10-15T08:00:00.000Z",
    "updatedAt": "2025-10-21T14:30:00.000Z"
  }
}
```

---

### 2. Add Item to Wishlist

Adds a product or auction to the user's wishlist. Automatically fetches and embeds item data.

**Endpoint:** `POST /api/pluto-koi/v1/wishlist`

**Authentication:** Required

**Request Body:**

```json
{
  "itemId": "607f1f77bcf86cd799439012",
  "itemType": "product" // or "auction"
}
```

**Validation Rules:**

- `itemId`: Required, must be a valid MongoDB ObjectId
- `itemType`: Required, must be either "product" or "auction"
- Item must exist and be active/available
- Item cannot already be in the wishlist

**Response (Success - 201):**

```json
{
  "status": "success",
  "message": "Item added to wishlist successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439011",
    "userId": "607f1f77bcf86cd799439010",
    "items": [
      {
        "itemId": "607f1f77bcf86cd799439012",
        "itemType": "product",
        "itemData": {
          "itemName": "Premium Koi Fish",
          "price": 150000,
          "imageUrl": "http://localhost:3000/media/products/image1.jpg"
        },
        "addedAt": "2025-10-22T10:00:00.000Z"
      }
    ],
    "createdAt": "2025-10-15T08:00:00.000Z",
    "updatedAt": "2025-10-22T10:00:00.000Z"
  }
}
```

**Error Responses:**

- **404 Not Found** - Item doesn't exist

```json
{
  "success": false,
  "message": "Product not found"
}
```

- **409 Conflict** - Item already in wishlist

```json
{
  "success": false,
  "message": "Item already exists in wishlist"
}
```

- **400 Bad Request** - Cannot add inactive/expired items

```json
{
  "success": false,
  "message": "Cannot add inactive product to wishlist"
}
```

---

### 3. Remove Item from Wishlist

Removes a specific item from the wishlist.

**Endpoint:** `DELETE /api/pluto-koi/v1/wishlist/item`

**Authentication:** Required

**Request Body:**

```json
{
  "itemId": "607f1f77bcf86cd799439012",
  "itemType": "product"
}
```

**Response (Success - 200):**

```json
{
  "status": "success",
  "message": "Item removed from wishlist successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439011",
    "userId": "607f1f77bcf86cd799439010",
    "items": [],
    "createdAt": "2025-10-15T08:00:00.000Z",
    "updatedAt": "2025-10-22T10:15:00.000Z"
  }
}
```

---

### 4. Clear Entire Wishlist

Removes all items from the user's wishlist.

**Endpoint:** `DELETE /api/pluto-koi/v1/wishlist`

**Authentication:** Required

**Response (Success - 200):**

```json
{
  "status": "success",
  "message": "Wishlist cleared successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439011",
    "userId": "607f1f77bcf86cd799439010",
    "items": [],
    "createdAt": "2025-10-15T08:00:00.000Z",
    "updatedAt": "2025-10-22T10:20:00.000Z"
  }
}
```

---

### 5. Check if Item is in Wishlist

Checks whether a specific item exists in the user's wishlist.

**Endpoint:** `GET /api/pluto-koi/v1/wishlist/check`

**Authentication:** Required

**Query Parameters:**

- `itemId` (required): The ID of the item to check
- `itemType` (required): Either "product" or "auction"

**Example:**

```
GET /api/pluto-koi/v1/wishlist/check?itemId=607f1f77bcf86cd799439012&itemType=product
```

**Response (Success - 200):**

```json
{
  "status": "success",
  "message": "Item is in wishlist",
  "data": {
    "exists": true
  }
}
```

**Use Case:** Useful for showing "Add to Wishlist" vs "Remove from Wishlist" button states in UI.

---

### 6. Get Wishlist Statistics

Retrieves statistical information about the user's wishlist.

**Endpoint:** `GET /api/pluto-koi/v1/wishlist/stats`

**Authentication:** Required

**Response (Success - 200):**

```json
{
  "status": "success",
  "message": "Wishlist statistics retrieved successfully",
  "data": {
    "totalItems": 5,
    "productCount": 3,
    "auctionCount": 2
  }
}
```

---

### 7. Get Items by Type

Retrieves wishlist items filtered by type (products or auctions only).

**Endpoint:** `GET /api/pluto-koi/v1/wishlist/items`

**Authentication:** Required

**Query Parameters:**

- `itemType` (required): Either "product" or "auction"

**Example:**

```
GET /api/pluto-koi/v1/wishlist/items?itemType=product
```

**Response (Success - 200):**

```json
{
  "status": "success",
  "message": "product items retrieved successfully",
  "data": [
    {
      "itemId": "607f1f77bcf86cd799439012",
      "itemType": "product",
      "itemData": {
        "itemName": "Premium Koi Fish",
        "price": 150000,
        "imageUrl": "http://localhost:3000/media/products/image1.jpg"
      },
      "addedAt": "2025-10-20T10:00:00.000Z"
    },
    {
      "itemId": "607f1f77bcf86cd799439014",
      "itemType": "product",
      "itemData": {
        "itemName": "Butterfly Koi",
        "price": 120000,
        "imageUrl": "http://localhost:3000/media/products/image3.jpg"
      },
      "addedAt": "2025-10-21T12:00:00.000Z"
    }
  ]
}
```

---

### 8. Sync Wishlist Item Data

Updates the embedded data for a specific wishlist item by fetching fresh data from the source (product or auction). Useful when prices or item details have changed.

**Endpoint:** `POST /api/pluto-koi/v1/wishlist/sync`

**Authentication:** Required

**Request Body:**

```json
{
  "itemId": "607f1f77bcf86cd799439012",
  "itemType": "product"
}
```

**Response (Success - 200):**

```json
{
  "status": "success",
  "message": "Wishlist item synced successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439011",
    "userId": "607f1f77bcf86cd799439010",
    "items": [
      {
        "itemId": "607f1f77bcf86cd799439012",
        "itemType": "product",
        "itemData": {
          "itemName": "Premium Koi Fish - Updated",
          "price": 175000, // Updated price
          "imageUrl": "http://localhost:3000/media/products/new-image.jpg"
        },
        "addedAt": "2025-10-20T10:00:00.000Z"
      }
    ],
    "createdAt": "2025-10-15T08:00:00.000Z",
    "updatedAt": "2025-10-22T11:00:00.000Z"
  }
}
```

**Behavior:**

- If the source item no longer exists, it will be automatically removed from the wishlist
- Updates name, price, and image URL from the current source data
- For auctions: updates to current highest bid or start price
- For products: updates to current product price

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["itemId: Item ID is required", "itemType: Item type must be either 'product' or 'auction'"]
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Product not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "Item already exists in wishlist"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to retrieve wishlist"
}
```

---

## Usage Examples

### Example 1: Adding a Product to Wishlist

```javascript
const response = await fetch("http://localhost:3000/api/pluto-koi/v1/wishlist", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_JWT_TOKEN",
  },
  body: JSON.stringify({
    itemId: "607f1f77bcf86cd799439012",
    itemType: "product",
  }),
});

const data = await response.json();
console.log(data);
```

### Example 2: Checking if Item is in Wishlist

```javascript
const itemId = "607f1f77bcf86cd799439012";
const itemType = "product";

const response = await fetch(`http://localhost:3000/api/pluto-koi/v1/wishlist/check?itemId=${itemId}&itemType=${itemType}`, {
  headers: {
    Authorization: "Bearer YOUR_JWT_TOKEN",
  },
});

const data = await response.json();
if (data.data.exists) {
  console.log("Item is in wishlist");
} else {
  console.log("Item is not in wishlist");
}
```

### Example 3: Getting Wishlist Statistics

```javascript
const response = await fetch("http://localhost:3000/api/pluto-koi/v1/wishlist/stats", {
  headers: {
    Authorization: "Bearer YOUR_JWT_TOKEN",
  },
});

const data = await response.json();
console.log(`Total items: ${data.data.totalItems}`);
console.log(`Products: ${data.data.productCount}`);
console.log(`Auctions: ${data.data.auctionCount}`);
```

---

## Best Practices

1. **Check Before Adding**: Use the check endpoint to determine if an item is already in the wishlist before attempting to add it.

2. **Periodic Sync**: Consider syncing wishlist items periodically or when the user views their wishlist to ensure embedded data is current.

3. **Handle Deleted Items**: When syncing, handle cases where items may have been deleted from the source (products/auctions).

4. **UI State Management**: Use the check endpoint to manage UI state (heart icons, buttons, etc.).

5. **Statistics for Badges**: Use the stats endpoint to display badge counts on navigation or wishlist icons.

---

## Database Indexes

The wishlist model includes the following indexes for optimal performance:

- `userId`: Unique index for fast user wishlist lookup
- `items.itemId`: Index for checking item existence
- `items.itemType`: Index for filtering by type

---

## Data Consistency

The embedding approach provides a snapshot of item data at the time of addition. To maintain consistency:

1. Use the **sync endpoint** to update embedded data when needed
2. Implement background jobs to periodically sync all wishlist items
3. Remove items automatically during sync if source items are deleted
4. For auctions: Consider syncing when auction prices change significantly

---

## Future Enhancements

Potential improvements to consider:

1. **Bulk Operations**: Add endpoints for bulk add/remove operations
2. **Wishlist Sharing**: Share wishlist with other users
3. **Notifications**: Alert users when wishlist item prices drop
4. **Priority Levels**: Add priority/favorite flags to wishlist items
5. **Notes**: Allow users to add notes to wishlist items
6. **Collections**: Group wishlist items into collections/folders
