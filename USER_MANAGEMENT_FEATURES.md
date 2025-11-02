# User Management Features Documentation

## Overview

This document outlines the implementation of enhanced user management features including user blocking/unblocking functionality and advanced user filtering and search capabilities.

## Features Implemented

### 1. User Blocking/Unblocking

Users can now be blocked or unblocked by administrators. The system uses the `status` field in the user model with three possible values:

- `active` - User can access the system normally
- `inactive` - User is inactive (reserved for future use)
- `banned` - User is blocked and cannot access the system

### 2. User Filtering and Search

Administrators can now filter and search users using the following capabilities:

- **Status Filter**: Filter users by their status (active, inactive, banned)
- **Search**: Search users by name, email, or phone number (case-insensitive)
- **Pagination**: Results are paginated with configurable page size

## API Endpoints

### Get All Users (Enhanced)

```
GET /api/user
```

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page
- `status` (optional) - Filter by status: "active", "inactive", or "banned"
- `search` (optional) - Search term for name, email, or phone number

**Example Requests:**

```bash
# Get all users (paginated)
GET /api/user?page=1&limit=10

# Filter by status
GET /api/user?status=active

# Search by name, email, or phone
GET /api/user?search=john

# Combine filters
GET /api/user?status=active&search=john&page=1&limit=20
```

**Response:**

```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": {
    "statistics": {
      "totalUsers": 100,
      "totalUsersTrend": 5,
      "totalDeletedUsers": 10,
      "totalDeletedUsersTrend": 2
    },
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+1234567890",
        "role": "endUser",
        "status": "active",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "metadata": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Block User

```
PATCH /api/user/:id/block
```

**Description:** Blocks a user by setting their status to "banned"

**Path Parameters:**

- `id` (required) - User ID (MongoDB ObjectId format)

**Example Request:**

```bash
PATCH /api/user/507f1f77bcf86cd799439011/block
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "User blocked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "banned",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-20T15:30:00.000Z"
  }
}
```

**Error Responses:**

- `400` - User is already blocked
- `404` - User not found
- `500` - Server error

### Unblock User

```
PATCH /api/user/:id/unblock
```

**Description:** Unblocks a user by setting their status to "active"

**Path Parameters:**

- `id` (required) - User ID (MongoDB ObjectId format)

**Example Request:**

```bash
PATCH /api/user/507f1f77bcf86cd799439011/unblock
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "User unblocked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-20T16:00:00.000Z"
  }
}
```

**Error Responses:**

- `400` - User is not blocked
- `404` - User not found
- `500` - Server error

## Security & Access Control

### Authentication

All user management endpoints require:

1. Valid JWT token in Authorization header: `Bearer <token>`
2. Admin role permissions

### Blocked User Restrictions

When a user is blocked (`status: "banned"`):

1. **Login Prevention**: Cannot log in to the system
2. **API Access Prevention**: Cannot access protected routes
3. **Clear Error Messages**: Receives "Your account has been blocked. Please contact support."

## Technical Implementation

### Files Modified

#### 1. User Model (`src/models/user.model.ts`)

- Already had `status` field with type `UserStatus`
- Enum values: `"active"`, `"inactive"`, `"banned"`

#### 2. User Repository (`src/repository/user.repository.ts`)

- **Updated `findAll` method**: Added filtering by status and search functionality
- **New method `updateUserStatus`**: Updates user status for blocking/unblocking

#### 3. User Service (`src/services/user.service.ts`)

- **Updated `getAllUsers` method**: Added status and search parameters
- **New method `blockUser`**: Handles user blocking logic
- **New method `unblockUser`**: Handles user unblocking logic

#### 4. User Controller (`src/controllers/user.controller.ts`)

- **Updated `getAllUsers`**: Extracts query parameters for filtering
- **New method `blockUser`**: Handles block user requests
- **New method `unblockUser`**: Handles unblock user requests

#### 5. User Routes (`src/routes/user.routes.ts`)

- Added new routes for blocking and unblocking
- Integrated validation middleware

#### 6. User Validation (`src/validations/user.validation.ts`) - NEW FILE

- Query validation for getAllUsers endpoint
- Parameter validation for user ID
- Reusable validation middleware

#### 7. Auth Service (`src/services/auth.service.ts`)

- Updated login method to check for banned users
- Prevents deleted users from logging in

#### 8. Auth Middleware (`src/middleware/auth.middleware.ts`)

- Updated `authenticateToken` to check for banned users on every request
- Checks for deleted users

## Database Schema

### User Status Field

```typescript
status: {
  type: String,
  default: "active",
  enum: ["active", "inactive", "banned"]
}
```

### Indexes

The user model includes indexes on:

- `email` (unique)
- `deleted` (for filtering)

## Validation Rules

### Query Parameters (GET /api/user)

- `page`: Must be a positive number
- `limit`: Must be a positive number between 1 and 100
- `status`: Must be one of "active", "inactive", or "banned"
- `search`: String (trimmed, optional)

### Path Parameters

- `id`: Must be a valid MongoDB ObjectId (24 character hex string)

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Best Practices

1. **Soft Delete**: Users are soft-deleted (marked as deleted) rather than removed from database
2. **Banned vs Deleted**: Banned users can be unblocked; deleted users cannot be restored via API
3. **Validation**: All inputs are validated using Zod schemas
4. **Security**: Blocked users are checked at both login and on every authenticated request
5. **Search Performance**: Search uses regex with case-insensitive matching across multiple fields
6. **Pagination**: Results are paginated to prevent performance issues with large datasets

## Testing Examples

### Using cURL

```bash
# Get all users
curl -X GET "http://localhost:3000/api/user" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter active users
curl -X GET "http://localhost:3000/api/user?status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search users
curl -X GET "http://localhost:3000/api/user?search=john" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Block a user
curl -X PATCH "http://localhost:3000/api/user/507f1f77bcf86cd799439011/block" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Unblock a user
curl -X PATCH "http://localhost:3000/api/user/507f1f77bcf86cd799439011/unblock" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Get all users with filters
const response = await fetch("/api/user?status=active&search=john&page=1&limit=20", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const data = await response.json();

// Block a user
const blockResponse = await fetch(`/api/user/${userId}/block`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const blockData = await blockResponse.json();
```

## Future Enhancements

Potential improvements for consideration:

1. Add reason field for blocking (why user was blocked)
2. Add blocked by and blocked at timestamp fields
3. Email notification when user is blocked/unblocked
4. Admin audit log for user management actions
5. Bulk block/unblock operations
6. Time-limited blocks (auto-unblock after specified duration)
7. Block history tracking

## Conclusion

This implementation provides a robust user management system with the ability to control user access through blocking/unblocking and efficiently find users through filtering and search capabilities. All operations are protected by authentication and authorization, ensuring only administrators can manage users.
