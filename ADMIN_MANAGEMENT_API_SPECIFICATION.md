# Admin Management API Specification

## Overview

This document describes the Admin Management API endpoints for the Pluto-Koi project. All endpoints are admin-only and require authentication. This API allows administrators to manage other admin users (create, view, delete, block/unblock).

**Base URL:** `/api/admin`

**Authentication:** All endpoints require:

- Valid JWT token in Authorization header
- Admin role (`role: "admin"`)

---

## Key Differences from End User Registration

| Aspect           | End User                                         | Admin                      |
| ---------------- | ------------------------------------------------ | -------------------------- |
| Phone Number     | Required                                         | Not required               |
| Address          | Required (street, city, state, zipCode, country) | Not required               |
| Approval Process | Required (pending → approved)                    | Auto-approved              |
| Creation Method  | Self-registration via `/api/auth/register`       | Created by existing admin  |
| Required Fields  | name, email, password, phoneNumber, address      | name, email, password only |

---

## Endpoints

### 1. Get All Admin Users

**Endpoint:** `GET /api/admin`

**Description:** Retrieve a paginated list of admin users with optional search capability.

**Access:** Admin only

**Query Parameters:**

| Parameter | Type   | Required | Default | Description                    |
| --------- | ------ | -------- | ------- | ------------------------------ |
| page      | string | No       | "1"     | Page number (must be positive) |
| limit     | string | No       | "10"    | Items per page (1-100)         |
| search    | string | No       | -       | Search by name or email        |

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Admin users retrieved successfully",
  "data": {
    "statistics": {
      "totalAdmins": 5,
      "activeAdmins": 4
    },
    "admins": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "metadata": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      "itemsPerPage": 10,
      "hasNextPage": false,
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
  "errors": ["page: Page must be a positive number"]
}
```

**401 Unauthorized** - Missing or invalid token:

```json
{
  "success": false,
  "message": "Access token is required"
}
```

**403 Forbidden** - User is not an admin:

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

---

### 2. Create Admin User

**Endpoint:** `POST /api/admin`

**Description:** Create a new admin user. Only requires name, email, and password. No phone number, address, or approval process required.

**Access:** Admin only

**Request Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

| Field    | Type   | Required | Description                          |
| -------- | ------ | -------- | ------------------------------------ |
| name     | string | Yes      | Admin name (2-50 characters)         |
| email    | string | Yes      | Valid email address (must be unique) |
| password | string | Yes      | Password (6-100 characters)          |

**Example Request:**

```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "securePassword123"
}
```

**Success Response (201 Created):**

```json
{
  "status": "success",
  "message": "Admin user created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "New Admin",
    "email": "newadmin@example.com",
    "role": "admin",
    "status": "active",
    "approvalStatus": "approved",
    "phoneNumber": "N/A",
    "deleted": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["name: Name must be at least 2 characters long", "email: Please enter a valid email address", "password: Password must be at least 6 characters long"]
}
```

**409 Conflict** - Email already registered:

```json
{
  "status": "error",
  "message": "Email already registered"
}
```

---

### 3. Get Admin User by ID

**Endpoint:** `GET /api/admin/:id`

**Description:** Retrieve a specific admin user by their ID.

**Access:** Admin only

**URL Parameters:**

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | MongoDB ObjectId of the admin user |

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Admin user retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid ID format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["id: Invalid user ID format"]
}
```

**404 Not Found** - Admin not found:

```json
{
  "status": "error",
  "message": "Admin user not found"
}
```

---

### 4. Delete Admin User

**Endpoint:** `DELETE /api/admin/:id`

**Description:** Soft delete an admin user. An admin cannot delete their own account.

**Access:** Admin only

**URL Parameters:**

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | MongoDB ObjectId of the admin user |

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Admin user deleted successfully",
  "data": null
}
```

**Error Responses:**

**400 Bad Request** - Self-deletion attempt:

```json
{
  "status": "error",
  "message": "You cannot delete your own admin account"
}
```

**404 Not Found** - Admin not found:

```json
{
  "status": "error",
  "message": "Admin user not found"
}
```

---

### 5. Block Admin User

**Endpoint:** `PATCH /api/admin/:id/block`

**Description:** Block an admin user (set status to banned). An admin cannot block themselves.

**Access:** Admin only

**URL Parameters:**

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | MongoDB ObjectId of the admin user |

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Admin user blocked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "banned",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T08:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Self-blocking attempt:

```json
{
  "status": "error",
  "message": "You cannot block your own admin account"
}
```

**400 Bad Request** - Already blocked:

```json
{
  "status": "error",
  "message": "Admin is already blocked"
}
```

**404 Not Found** - Admin not found:

```json
{
  "status": "error",
  "message": "Admin user not found"
}
```

---

### 6. Unblock Admin User

**Endpoint:** `PATCH /api/admin/:id/unblock`

**Description:** Unblock an admin user (set status to active).

**Access:** Admin only

**URL Parameters:**

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | MongoDB ObjectId of the admin user |

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Admin user unblocked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T09:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Not blocked:

```json
{
  "status": "error",
  "message": "Admin is not blocked"
}
```

**404 Not Found** - Admin not found:

```json
{
  "status": "error",
  "message": "Admin user not found"
}
```

---

## Updated: Get All Users Endpoint

### Role Filter Support

The existing `GET /api/user` endpoint now supports filtering by user role.

**Endpoint:** `GET /api/user`

**New Query Parameter:**

| Parameter | Type   | Required | Default | Description                          |
| --------- | ------ | -------- | ------- | ------------------------------------ |
| role      | string | No       | -       | Filter by role: `admin` or `endUser` |

**Example Requests:**

```bash
# Get all end users only (default behavior if role not specified)
GET /api/user

# Get only admin users
GET /api/user?role=admin

# Get only end users
GET /api/user?role=endUser

# Get admins with search
GET /api/user?role=admin&search=john

# Get end users with status filter
GET /api/user?role=endUser&status=active&page=1&limit=20
```

**Response:** Same as existing response structure with filtered results based on role.

---

## Common Response Codes

| Code | Status                | Description                        |
| ---- | --------------------- | ---------------------------------- |
| 200  | OK                    | Request successful                 |
| 201  | Created               | Resource created successfully      |
| 400  | Bad Request           | Invalid request data or parameters |
| 401  | Unauthorized          | Missing or invalid token           |
| 403  | Forbidden             | Insufficient permissions           |
| 404  | Not Found             | Resource not found                 |
| 409  | Conflict              | Resource already exists            |
| 500  | Internal Server Error | Server error                       |

---

## Notes

1. **Password Security:** Passwords are automatically hashed using bcrypt before storage.
2. **Soft Delete:** Admin users are soft-deleted (marked as deleted) rather than permanently removed.
3. **Self-Protection:** Admins cannot delete or block their own accounts to prevent accidental lockouts.
4. **Auto-Approval:** New admin users are automatically set to `approved` status - no approval workflow required.
5. **Phone Number:** Admin users have phone number set to "N/A" as it's not required for admin accounts.
