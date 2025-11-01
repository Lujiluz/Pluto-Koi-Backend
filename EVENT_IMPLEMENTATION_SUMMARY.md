# Event Service Implementation Summary

## What Was Implemented

A complete Event service that manages special events and displays total bid amounts from all active auctions.

## Key Features

1. **Event Management**

   - Create, read, update, and delete events
   - Only one event can be active at a time
   - Automatic deactivation of other events when a new event is activated

2. **Total Bid Calculation**

   - Automatically calculates sum of highest bids from all active auctions
   - Manual recalculation endpoint available
   - Active auction = `startDate <= now <= endDate`

3. **Auction Integration**
   - When event is active, `/api/auction` returns `eventDetail` field with `totalBidAmount`
   - When no event is active, response remains unchanged (backward compatible)

## API Endpoints

| Method | Endpoint                 | Description                  |
| ------ | ------------------------ | ---------------------------- |
| GET    | `/api/event/active`      | Get currently active event   |
| GET    | `/api/event`             | Get all events               |
| GET    | `/api/event/:id`         | Get event by ID              |
| POST   | `/api/event`             | Create new event             |
| PUT    | `/api/event/:id`         | Update event                 |
| DELETE | `/api/event/:id`         | Delete event                 |
| POST   | `/api/event/recalculate` | Recalculate total bid amount |

## Files Created

1. **Model**: `src/models/event.model.ts`

   - Event schema with `isActive` and `totalBidAmount` fields

2. **Repository**: `src/repository/event.repository.ts`

   - Data access methods for events
   - Helper methods for managing active events

3. **Service**: `src/services/event.service.ts`

   - Business logic for event management
   - Total bid amount calculation
   - Integration helper for auction service

4. **Controller**: `src/controllers/event.controller.ts`

   - HTTP request handlers for all event endpoints

5. **Routes**: `src/routes/event.routes.ts`

   - API route definitions with authentication and validation

6. **Validation**: `src/validations/event.validation.ts`
   - Zod schemas for request validation

## Files Modified

1. **`src/services/auction.service.ts`**

   - Added `eventService` import
   - Modified `getAllAuctions()` to include `eventDetail` when active
   - Response now includes optional `eventDetail` field

2. **`src/routes/index.ts`**
   - Added event routes registration

## How It Works

### Creating an Event

```json
POST /api/event
{
  "isActive": true,
  "totalBidAmount": 0
}
```

- If `isActive: true`, all other events are deactivated
- If active, total bid amount is automatically calculated

### Auction Endpoint Behavior

**With Active Event:**

```json
GET /api/auction
Response:
{
  "status": "success",
  "data": {
    "statistics": {...},
    "auctions": [...],
    "metadata": {...},
    "eventDetail": {
      "totalBidAmount": 50000
    }
  }
}
```

**Without Active Event:**

```json
GET /api/auction
Response:
{
  "status": "success",
  "data": {
    "statistics": {...},
    "auctions": [...],
    "metadata": {...}
  }
}
```

### Total Bid Calculation Logic

1. Find all auctions where current date is between `startDate` and `endDate`
2. For each active auction, get the highest bid using `AuctionActivityModel.getHighestBidForAuction()`
3. Sum all highest bid amounts
4. Update the active event's `totalBidAmount`

## Authentication

All event endpoints require JWT authentication:

```
Authorization: Bearer <token>
```

## Validation

- **isActive**: Must be boolean
- **totalBidAmount**: Must be number >= 0
- **ID parameters**: Must be valid MongoDB ObjectId

## Testing

To test the implementation:

1. **Create an active event:**

   ```bash
   POST /api/event
   Body: { "isActive": true }
   ```

2. **Get auctions (should include eventDetail):**

   ```bash
   GET /api/auction
   ```

3. **Recalculate total bid amount:**

   ```bash
   POST /api/event/recalculate
   ```

4. **Deactivate event:**

   ```bash
   PUT /api/event/:id
   Body: { "isActive": false }
   ```

5. **Get auctions again (eventDetail should be absent):**
   ```bash
   GET /api/auction
   ```

## Notes

- The implementation is backward compatible - existing auction endpoint behavior is preserved when no event is active
- Only one event can be active at a time (enforced at service level)
- Total bid amount is calculated from active auctions only
- Manual recalculation endpoint is available for data synchronization

## Next Steps

To use the Event service:

1. Start your server
2. Create an event via POST `/api/event`
3. Set `isActive: true` to activate the event
4. The auction endpoint will automatically include event details
5. Use POST `/api/event/recalculate` to refresh total bid amounts as needed

For detailed API documentation, refer to `EVENT_SERVICE_DOCUMENTATION.md`.
