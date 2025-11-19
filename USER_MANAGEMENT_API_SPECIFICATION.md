# User Management API Specification

## Overview

This document describes the User Management API endpoints for the Pluto-Koi project. All endpoints are admin-only and require authentication.

**Base URL:** `/api/user`

**Authentication:** All endpoints require:

- Valid JWT token in Authorization header
- Admin role (`role: "admin"`)

---

## Endpoints

### 1. Get All Users

**Endpoint:** `GET /api/user`

**Description:** Retrieve a paginated list of users with optional filtering and search capabilities.

**Access:** Admin only

**Query Parameters:**

| Parameter | Type   | Required | Default | Description                                         |
| --------- | ------ | -------- | ------- | --------------------------------------------------- |
| page      | string | No       | "1"     | Page number (must be positive)                      |
| limit     | string | No       | "10"    | Items per page (1-100)                              |
| status    | string | No       | -       | Filter by status: `active`, `inactive`, or `banned` |
| search    | string | No       | -       | Search by name, email, or phone number              |

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": {
    "statistics": {
      "totalUsers": 150,
      "activeUsers": 120,
      "inactiveUsers": 20,
      "bannedUsers": 10
    },
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+1234567890",
        "role": "endUser",
        "status": "active",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "deleted": false,
        "deletedAt": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "metadata": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 150,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid query parameters:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["page: Page must be a positive number", "limit: Limit must be a positive number between 1 and 100"]
}
```

**401 Unauthorized** - Missing or invalid token:

```json
{
  "status": "error",
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Non-admin user:

```json
{
  "status": "error",
  "message": "Access denied. Admin privileges required"
}
```

**500 Internal Server Error:**

```json
{
  "status": "error",
  "message": "Failed to retrieve users"
}
```

---

### 2. Get User By ID

**Endpoint:** `GET /api/user/:id`

**Description:** Retrieve detailed information about a specific user.

**Access:** Admin only

**URL Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| id        | string | Yes      | MongoDB ObjectId (24 hex chars) |

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "role": "endUser",
    "status": "active",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "deleted": false,
    "deletedAt": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid user ID format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["id: Invalid user ID format"]
}
```

**404 Not Found** - User doesn't exist:

```json
{
  "status": "error",
  "message": "User not found"
}
```

**401 Unauthorized** - Missing or invalid token:

```json
{
  "status": "error",
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Non-admin user:

```json
{
  "status": "error",
  "message": "Access denied. Admin privileges required"
}
```

**500 Internal Server Error:**

```json
{
  "status": "error",
  "message": "Failed to retrieve user"
}
```

---

### 3. Block User

**Endpoint:** `PATCH /api/user/:id/block`

**Description:** Block a user by setting their status to "banned". Blocked users cannot access the system.

**Access:** Admin only

**URL Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| id        | string | Yes      | MongoDB ObjectId (24 hex chars) |

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "User blocked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "role": "endUser",
    "status": "banned",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "deleted": false,
    "deletedAt": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - User already blocked:

```json
{
  "status": "error",
  "message": "User is already blocked"
}
```

**400 Bad Request** - Invalid user ID format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["id: Invalid user ID format"]
}
```

**404 Not Found** - User doesn't exist:

```json
{
  "status": "error",
  "message": "User not found"
}
```

**401 Unauthorized:**

```json
{
  "status": "error",
  "message": "Authentication token is required"
}
```

**403 Forbidden:**

```json
{
  "status": "error",
  "message": "Access denied. Admin privileges required"
}
```

**500 Internal Server Error:**

```json
{
  "status": "error",
  "message": "Failed to block user"
}
```

---

### 4. Unblock User

**Endpoint:** `PATCH /api/user/:id/unblock`

**Description:** Unblock a user by setting their status to "active". This restores access for previously banned users.

**Access:** Admin only

**URL Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| id        | string | Yes      | MongoDB ObjectId (24 hex chars) |

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "User unblocked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "role": "endUser",
    "status": "active",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "deleted": false,
    "deletedAt": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T15:45:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - User not blocked:

```json
{
  "status": "error",
  "message": "User is not blocked"
}
```

**400 Bad Request** - Invalid user ID format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["id: Invalid user ID format"]
}
```

**404 Not Found** - User doesn't exist:

```json
{
  "status": "error",
  "message": "User not found"
}
```

**401 Unauthorized:**

```json
{
  "status": "error",
  "message": "Authentication token is required"
}
```

**403 Forbidden:**

```json
{
  "status": "error",
  "message": "Access denied. Admin privileges required"
}
```

**500 Internal Server Error:**

```json
{
  "status": "error",
  "message": "Failed to unblock user"
}
```

---

### 5. Delete User

**Endpoint:** `DELETE /api/user/:id`

**Description:** Soft delete a user by setting the `deleted` flag to true and recording the deletion timestamp. The user data is retained in the database but marked as deleted.

**Access:** Admin only

**URL Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| id        | string | Yes      | MongoDB ObjectId (24 hex chars) |

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "User deleted successfully",
  "data": null
}
```

**Error Responses:**

**400 Bad Request** - Invalid user ID format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["id: Invalid user ID format"]
}
```

**404 Not Found** - User not found or already deleted:

```json
{
  "status": "error",
  "message": "User not found or already deleted"
}
```

**401 Unauthorized:**

```json
{
  "status": "error",
  "message": "Authentication token is required"
}
```

**403 Forbidden:**

```json
{
  "status": "error",
  "message": "Access denied. Admin privileges required"
}
```

**500 Internal Server Error:**

```json
{
  "status": "error",
  "message": "Failed to delete user"
}
```

---

## Data Models

### User Object

| Field       | Type    | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| \_id        | string  | MongoDB ObjectId                                  |
| name        | string  | User's full name (2-50 characters)                |
| email       | string  | User's email address (unique, validated)          |
| phoneNumber | string  | User's phone number (validated format)            |
| role        | string  | User role: `admin` or `endUser`                   |
| status      | string  | Account status: `active`, `inactive`, or `banned` |
| address     | object  | User's address (optional)                         |
| deleted     | boolean | Soft delete flag                                  |
| deletedAt   | date    | Timestamp of deletion (null if not deleted)       |
| createdAt   | date    | Account creation timestamp                        |
| updatedAt   | date    | Last update timestamp                             |

### Address Object

| Field   | Type   | Description     |
| ------- | ------ | --------------- |
| street  | string | Street address  |
| city    | string | City name       |
| state   | string | State/province  |
| zipCode | string | Postal/ZIP code |
| country | string | Country name    |

### Pagination Metadata

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| currentPage     | number  | Current page number              |
| totalPages      | number  | Total number of pages            |
| totalItems      | number  | Total number of items            |
| itemsPerPage    | number  | Number of items per page         |
| hasNextPage     | boolean | Whether there is a next page     |
| hasPreviousPage | boolean | Whether there is a previous page |

### User Statistics

| Field         | Type   | Description              |
| ------------- | ------ | ------------------------ |
| totalUsers    | number | Total number of users    |
| activeUsers   | number | Number of active users   |
| inactiveUsers | number | Number of inactive users |
| bannedUsers   | number | Number of banned users   |

---

## Status Codes Summary

| Status Code | Description                                        |
| ----------- | -------------------------------------------------- |
| 200         | Successful operation                               |
| 400         | Bad request (validation error, invalid parameters) |
| 401         | Unauthorized (missing/invalid authentication)      |
| 403         | Forbidden (insufficient permissions)               |
| 404         | Resource not found                                 |
| 500         | Internal server error                              |

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token must belong to a user with the `admin` role. Non-admin users will receive a 403 Forbidden response.

---

## Validation Rules

### User ID Parameter

- Must be a valid MongoDB ObjectId (24 hexadecimal characters)
- Example: `507f1f77bcf86cd799439011`

### Query Parameters (Get All Users)

- **page**: Must be a positive number (> 0)
- **limit**: Must be a positive number between 1 and 100
- **status**: Must be one of: `active`, `inactive`, `banned`
- **search**: Any string (trimmed)

---

## Examples

### Example 1: Get All Active Users (Page 1)

```bash
curl -X GET "http://localhost:3000/api/user?page=1&limit=10&status=active" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 2: Search Users by Name

```bash
curl -X GET "http://localhost:3000/api/user?search=John&page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 3: Get Specific User

```bash
curl -X GET "http://localhost:3000/api/user/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 4: Block a User

```bash
curl -X PATCH "http://localhost:3000/api/user/507f1f77bcf86cd799439011/block" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 5: Unblock a User

```bash
curl -X PATCH "http://localhost:3000/api/user/507f1f77bcf86cd799439011/unblock" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 6: Delete a User

```bash
curl -X DELETE "http://localhost:3000/api/user/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Notes

1. **Password Security**: User passwords are never returned in API responses. They are automatically excluded via the model's `toJSON` method.

2. **Soft Delete**: The DELETE endpoint performs a soft delete, setting `deleted: true` and `deletedAt` timestamp. The user record remains in the database.

3. **Search Functionality**: The search parameter searches across user name, email, and phone number fields.

4. **User Statistics**: The GET all users endpoint includes statistics about user counts by status.

5. **Status Management**:

   - Blocking a user changes status from any state to `banned`
   - Unblocking a user changes status from `banned` to `active`
   - Only users with status `banned` can be unblocked
   - Already blocked users cannot be blocked again

6. **Role-Based Access**: All endpoints in this API require admin role. End users cannot access these management features.

---

## Version History

| Version | Date       | Changes                   |
| ------- | ---------- | ------------------------- |
| 1.0     | 2024-01-15 | Initial API specification |
