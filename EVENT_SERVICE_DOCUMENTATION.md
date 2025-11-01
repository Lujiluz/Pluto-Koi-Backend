# Event Service Implementation Documentation

## Overview

This document describes the Event Service implementation for the Pluto-Koi backend. The Event service manages special events that aggregate and display total bid amounts from all active auctions.

## Features

- Create, read, update, and delete events
- Automatically calculate total bid amounts from active auctions
- Integration with auction endpoints to display event details
- Only one active event at a time

## Database Model

### Event Model (`IEvent`)

```typescript
{
  isActive: boolean,           // Event status
  totalBidAmount: number,      // Sum of all highest bids on active auctions
  createdAt: Date,            // Timestamp
  updatedAt: Date             // Timestamp
}
```

## API Endpoints

### 1. Get Active Event

**GET** `/api/event/active`

Returns the currently active event, or null if no event is active.

**Response:**

```json
{
  "status": "success",
  "message": "Active event retrieved successfully",
  "data": {
    "_id": "event_id",
    "isActive": true,
    "totalBidAmount": 50000,
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2025-11-01T00:00:00.000Z"
  }
}
```

### 2. Get All Events

**GET** `/api/event`

Returns all events in the system, sorted by creation date (newest first).

**Response:**

```json
{
  "status": "success",
  "message": "Events retrieved successfully",
  "data": [
    {
      "_id": "event_id",
      "isActive": true,
      "totalBidAmount": 50000,
      "createdAt": "2025-11-01T00:00:00.000Z",
      "updatedAt": "2025-11-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Get Event by ID

**GET** `/api/event/:id`

Returns a specific event by its ID.

**Response:**

```json
{
  "status": "success",
  "message": "Event retrieved successfully",
  "data": {
    "_id": "event_id",
    "isActive": true,
    "totalBidAmount": 50000,
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2025-11-01T00:00:00.000Z"
  }
}
```

### 4. Create Event

**POST** `/api/event`

Creates a new event. If the event is active, all other events are automatically deactivated.

**Request Body:**

```json
{
  "isActive": true,
  "totalBidAmount": 0
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Event created successfully",
  "data": {
    "_id": "new_event_id",
    "isActive": true,
    "totalBidAmount": 0,
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2025-11-01T00:00:00.000Z"
  }
}
```

### 5. Update Event

**PUT** `/api/event/:id`

Updates an existing event. If activating an event, all other events are deactivated first.

**Request Body:**

```json
{
  "isActive": true,
  "totalBidAmount": 75000
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Event updated successfully",
  "data": {
    "_id": "event_id",
    "isActive": true,
    "totalBidAmount": 75000,
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2025-11-01T00:00:00.000Z"
  }
}
```

### 6. Delete Event

**DELETE** `/api/event/:id`

Deletes an event by ID.

**Response:**

```json
{
  "status": "success",
  "message": "Event deleted successfully",
  "data": null
}
```

### 7. Recalculate Total Bid Amount

**POST** `/api/event/recalculate`

Manually recalculates the total bid amount for the active event based on current active auctions.

**Response:**

```json
{
  "status": "success",
  "message": "Total bid amount recalculated successfully",
  "data": {
    "_id": "event_id",
    "isActive": true,
    "totalBidAmount": 80000,
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2025-11-01T00:00:00.000Z"
  }
}
```

## Integration with Auction Endpoint

### Modified Auction Endpoint

**GET** `/api/auction`

When an event is active, the auction endpoint now includes an `eventDetail` field in the response:

**Response (with active event):**

```json
{
  "status": "success",
  "message": "Auctions retrieved successfully",
  "data": {
    "statistics": {
      "totalAuctions": 10,
      "activeAuctions": 5,
      "upcomingAuctions": 3,
      "completedAuctions": 2
    },
    "auctions": [...],
    "metadata": {
      "page": 1,
      "limit": 10,
      "total": 10,
      "totalPages": 1
    },
    "eventDetail": {
      "totalBidAmount": 50000
    }
  }
}
```

**Response (without active event):**

```json
{
  "status": "success",
  "message": "Auctions retrieved successfully",
  "data": {
    "statistics": {...},
    "auctions": [...],
    "metadata": {...}
  }
}
```

## Business Logic

### Total Bid Amount Calculation

The `totalBidAmount` is calculated as:

1. Find all auctions where:
   - `startDate <= currentDate`
   - `endDate >= currentDate`
2. For each active auction, get the highest bid
3. Sum all highest bid amounts

### Active Event Management

- Only one event can be active at a time
- When creating or updating an event with `isActive: true`, all other events are automatically deactivated
- When an event becomes active, the total bid amount is automatically recalculated

## Service Methods

### EventService

#### `getActiveEvent()`

Retrieves the currently active event.

#### `getEventById(eventId: string)`

Retrieves a specific event by ID.

#### `createEvent(eventData: CreateEventData)`

Creates a new event. Automatically deactivates other events if the new event is active.

#### `updateEvent(eventId: string, eventData: Partial<CreateEventData>)`

Updates an event. Automatically deactivates other events if activating this event.

#### `deleteEvent(eventId: string)`

Deletes an event by ID.

#### `getAllEvents()`

Retrieves all events, sorted by creation date.

#### `recalculateTotalBidAmount()`

Recalculates the total bid amount for the active event based on current auction data.

#### `getEventDetailsForAuction()`

Helper method used by auction service to get event details for inclusion in auction responses.

## Repository Methods

### EventRepository

#### `getActiveEvent()`

Finds and returns the active event.

#### `findById(eventId: string)`

Finds an event by ID.

#### `create(eventData: Partial<IEvent>)`

Creates a new event.

#### `update(eventId: string, eventData: Partial<IEvent>)`

Updates an event.

#### `delete(eventId: string)`

Deletes an event.

#### `findAll()`

Returns all events.

#### `deactivateAllEvents()`

Sets `isActive: false` for all events.

#### `updateTotalBidAmount(totalBidAmount: number)`

Updates the total bid amount for the active event.

## Validation

All event endpoints use Zod validation:

### Create Event Schema

```typescript
{
  isActive: boolean (optional, default: false),
  totalBidAmount: number (optional, default: 0, min: 0)
}
```

### Update Event Schema

```typescript
{
  isActive: boolean (optional),
  totalBidAmount: number (optional, min: 0)
}
```

### Event ID Validation

- Must be a valid MongoDB ObjectId

## Error Handling

All endpoints return appropriate error responses:

**404 - Not Found:**

```json
{
  "status": "error",
  "message": "Event not found"
}
```

**400 - Validation Error:**

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["isActive: Expected boolean, received string"]
}
```

**500 - Server Error:**

```json
{
  "status": "error",
  "message": "Failed to retrieve event"
}
```

## Authentication

All event endpoints require authentication via JWT token:

```
Authorization: Bearer <token>
```

## Usage Examples

### Creating an Active Event

```bash
curl -X POST http://localhost:3000/api/event \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true, "totalBidAmount": 0}'
```

### Checking for Active Event

```bash
curl -X GET http://localhost:3000/api/event/active \
  -H "Authorization: Bearer <token>"
```

### Recalculating Total Bid Amount

```bash
curl -X POST http://localhost:3000/api/event/recalculate \
  -H "Authorization: Bearer <token>"
```

### Getting Auctions with Event Details

```bash
curl -X GET http://localhost:3000/api/auction \
  -H "Authorization: Bearer <token>"
```

## Files Created/Modified

### New Files

- `src/models/event.model.ts` - Event Mongoose model
- `src/repository/event.repository.ts` - Event data access layer
- `src/services/event.service.ts` - Event business logic
- `src/controllers/event.controller.ts` - Event HTTP handlers
- `src/routes/event.routes.ts` - Event API routes
- `src/validations/event.validation.ts` - Event validation schemas

### Modified Files

- `src/services/auction.service.ts` - Added event details integration
- `src/routes/index.ts` - Added event routes

## Future Enhancements

Potential improvements for the Event feature:

1. Event scheduling (auto-activate/deactivate based on date/time)
2. Event history and analytics
3. WebSocket notifications for real-time total bid updates
4. Event-specific auction filtering
5. Event metadata (name, description, banner image)
