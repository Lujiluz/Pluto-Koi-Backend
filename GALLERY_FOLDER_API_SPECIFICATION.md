# Gallery Folder API Specification

## Overview

The Gallery Folder API provides endpoints for managing gallery folders, which allow organizing galleries into categories like "Products", "Activities", etc. Every gallery belongs to a folder, with "General" being the default folder.

## Base URL

```
/api/gallery-folders
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow a consistent structure:

```json
{
  "status": "success" | "error",
  "message": "Human-readable message",
  "data": <response_data> | null
}
```

---

## Endpoints

### 1. Create Gallery Folder

Creates a new gallery folder.

**Endpoint:** `POST /api/gallery-folders`

**Request Body:**

```json
{
  "folderName": "string (required, 2-50 chars, alphanumeric + spaces/hyphens/underscores)",
  "description": "string (optional, max 255 chars)",
  "isActive": "boolean (optional, default: true)"
}
```

**Example Request:**

```json
{
  "folderName": "Products",
  "description": "Folder for product showcase galleries",
  "isActive": true
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "message": "Gallery folder created successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "folderName": "Products",
    "description": "Folder for product showcase galleries",
    "isActive": true,
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation errors
- `409 Conflict` - Folder name already exists

---

### 2. Get All Gallery Folders

Retrieves gallery folders with pagination and filtering.

**Endpoint:** `GET /api/gallery-folders`

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page
- `isActive` (optional) - Filter by active status (true/false)
- `search` (optional, max 100 chars) - Search in folder name and description

**Example Request:**

```
GET /api/gallery-folders?page=1&limit=10&isActive=true&search=product
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery folders retrieved successfully",
  "data": {
    "folders": [
      {
        "_id": "674d1234567890abcdef1234",
        "folderName": "Products",
        "description": "Folder for product showcase galleries",
        "isActive": true,
        "createdAt": "2025-11-15T10:30:00.000Z",
        "updatedAt": "2025-11-15T10:30:00.000Z"
      }
    ],
    "metadata": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPreviousPage": false
    },
    "statistics": {
      "totalFolders": 2,
      "activeFolders": 2,
      "inactiveFolders": 0,
      "foldersWithGalleryCount": [
        {
          "folderName": "General",
          "galleryCount": 5
        },
        {
          "folderName": "Products",
          "galleryCount": 3
        }
      ]
    }
  }
}
```

---

### 3. Get Active Gallery Folders

Retrieves all active gallery folders (useful for dropdowns).

**Endpoint:** `GET /api/gallery-folders/active`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Active gallery folders retrieved successfully",
  "data": [
    {
      "_id": "674d1234567890abcdef1234",
      "folderName": "General",
      "description": "Default folder for galleries",
      "isActive": true,
      "createdAt": "2025-11-15T10:00:00.000Z",
      "updatedAt": "2025-11-15T10:00:00.000Z"
    },
    {
      "_id": "674d1234567890abcdef5678",
      "folderName": "Products",
      "description": "Folder for product showcase galleries",
      "isActive": true,
      "createdAt": "2025-11-15T10:30:00.000Z",
      "updatedAt": "2025-11-15T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Get Gallery Folder by ID

Retrieves a specific gallery folder by its ID.

**Endpoint:** `GET /api/gallery-folders/{folderId}`

**Parameters:**

- `folderId` (required) - MongoDB ObjectId of the folder

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery folder retrieved successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "folderName": "Products",
    "description": "Folder for product showcase galleries",
    "isActive": true,
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found` - Folder not found

---

### 5. Get Gallery Folder by Name

Retrieves a specific gallery folder by its name.

**Endpoint:** `GET /api/gallery-folders/name/{folderName}`

**Parameters:**

- `folderName` (required) - Name of the folder

**Example Request:**

```
GET /api/gallery-folders/name/Products
```

**Response:** Same as Get Gallery Folder by ID

---

### 6. Update Gallery Folder

Updates an existing gallery folder.

**Endpoint:** `PUT /api/gallery-folders/{folderId}`

**Parameters:**

- `folderId` (required) - MongoDB ObjectId of the folder

**Request Body:** (All fields optional)

```json
{
  "folderName": "string (optional, 2-50 chars)",
  "description": "string (optional, max 255 chars)",
  "isActive": "boolean (optional)"
}
```

**Example Request:**

```json
{
  "description": "Updated description for product galleries"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery folder updated successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "folderName": "Products",
    "description": "Updated description for product galleries",
    "isActive": true,
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T11:00:00.000Z"
  }
}
```

**Restrictions:**

- Cannot rename the "General" folder
- Cannot deactivate the "General" folder
- Folder names must be unique

---

### 7. Toggle Gallery Folder Status

Toggles the active/inactive status of a gallery folder.

**Endpoint:** `PATCH /api/gallery-folders/{folderId}/toggle-status`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery folder deactivated successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "folderName": "Products",
    "description": "Folder for product showcase galleries",
    "isActive": false,
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T11:15:00.000Z"
  }
}
```

**Restrictions:**

- Cannot deactivate the "General" folder

---

### 8. Search Gallery Folders

Searches gallery folders by name or description.

**Endpoint:** `GET /api/gallery-folders/search`

**Query Parameters:**

- `q` (required, min 2 chars, max 100 chars) - Search query

**Example Request:**

```
GET /api/gallery-folders/search?q=product
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery folder search completed successfully",
  "data": [
    {
      "_id": "674d1234567890abcdef1234",
      "folderName": "Products",
      "description": "Folder for product showcase galleries",
      "isActive": true,
      "createdAt": "2025-11-15T10:30:00.000Z",
      "updatedAt": "2025-11-15T10:30:00.000Z"
    }
  ]
}
```

---

### 9. Get Folders with Gallery Count

Retrieves gallery folders along with the count of galleries in each folder.

**Endpoint:** `GET /api/gallery-folders/with-gallery-count`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery folders with gallery count retrieved successfully",
  "data": [
    {
      "_id": "674d1234567890abcdef1234",
      "folderName": "General",
      "description": "Default folder for galleries",
      "isActive": true,
      "galleryCount": 5,
      "createdAt": "2025-11-15T10:00:00.000Z",
      "updatedAt": "2025-11-15T10:00:00.000Z"
    },
    {
      "_id": "674d1234567890abcdef5678",
      "folderName": "Products",
      "description": "Folder for product showcase galleries",
      "isActive": true,
      "galleryCount": 3,
      "createdAt": "2025-11-15T10:30:00.000Z",
      "updatedAt": "2025-11-15T10:30:00.000Z"
    }
  ]
}
```

---

### 10. Delete Gallery Folder (Soft Delete)

Soft deletes a gallery folder and moves all galleries to the "General" folder.

**Endpoint:** `DELETE /api/gallery-folders/{folderId}`

**Parameters:**

- `folderId` (required) - MongoDB ObjectId of the folder

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery folder deleted successfully. All galleries moved to General folder.",
  "data": null
}
```

**Restrictions:**

- Cannot delete the "General" folder

---

### 11. Delete Gallery Folder (Hard Delete)

Permanently deletes a gallery folder and moves all galleries to the "General" folder.

**Endpoint:** `DELETE /api/gallery-folders/{folderId}/permanent`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery folder permanently deleted successfully. All galleries moved to General folder.",
  "data": null
}
```

**Restrictions:**

- Cannot delete the "General" folder

---

### 12. Ensure General Folder Exists

Creates the "General" folder if it doesn't exist (initialization endpoint).

**Endpoint:** `POST /api/gallery-folders/ensure-general`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "General folder ensured successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "folderName": "General",
    "description": "Default folder for galleries",
    "isActive": true,
    "createdAt": "2025-11-15T10:00:00.000Z",
    "updatedAt": "2025-11-15T10:00:00.000Z"
  }
}
```

---

## Error Codes

| Status Code | Description                                            |
| ----------- | ------------------------------------------------------ |
| 400         | Bad Request - Validation errors, invalid parameters    |
| 401         | Unauthorized - Missing or invalid authentication token |
| 403         | Forbidden - Insufficient permissions                   |
| 404         | Not Found - Folder not found                           |
| 409         | Conflict - Folder name already exists                  |
| 500         | Internal Server Error - Server error                   |

## Validation Rules

### Folder Name

- Required when creating
- 2-50 characters
- Alphanumeric characters, spaces, hyphens, and underscores only
- Must be unique
- Cannot change "General" folder name

### Description

- Optional
- Maximum 255 characters
- Trimmed automatically

### isActive

- Boolean value
- Cannot set "General" folder to false

## Special Notes

1. **General Folder Protection**: The "General" folder is protected and cannot be deleted, renamed, or deactivated.

2. **Gallery Migration**: When a folder is deleted, all galleries in that folder are automatically moved to the "General" folder.

3. **Case Sensitivity**: Folder names are case-insensitive for uniqueness checks.

4. **Pagination**: All list endpoints support pagination with consistent metadata structure.

5. **Search**: Text search is performed on both folder name and description fields.
