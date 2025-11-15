# Gallery API Specification

## Overview

The Gallery API provides endpoints for managing image galleries. Each gallery belongs to a folder (default: "General") and can contain multiple media files. Galleries can be organized, filtered, and managed through various endpoints.

## Base URL

```
/api/gallery
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

### 1. Create Gallery

Creates a new gallery with optional media files.

**Endpoint:** `POST /api/gallery`

**Content-Type:** `multipart/form-data`

**Form Fields:**

- `galleryName` (required, 2-100 chars) - Name of the gallery
- `owner` (required, 2-50 chars) - Owner of the gallery
- `handling` (required, 2-100 chars) - Handling information
- `folderName` (optional, 2-50 chars, default: "General") - Folder name
- `isActive` (optional, default: true) - Active status
- `media` (optional) - Array of media files (max 20 files)

**Example Request:**

```bash
POST /api/gallery
Content-Type: multipart/form-data

galleryName=Product Showcase
owner=John Doe
handling=Marketing Team
folderName=Products
isActive=true
media=@image1.jpg
media=@image2.png
```

**Response (201 Created):**

```json
{
  "status": "success",
  "message": "Gallery created successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "galleryName": "Product Showcase",
    "owner": "John Doe",
    "handling": "Marketing Team",
    "folderName": "Products",
    "isActive": true,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/gallery/image1.jpg"
      },
      {
        "fileUrl": "http://localhost:3000/media/gallery/image2.png"
      }
    ],
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation errors, file validation errors
- `409 Conflict` - Gallery name already exists

---

### 2. Get All Galleries

Retrieves galleries with pagination, filtering, and statistics.

**Endpoint:** `GET /api/gallery`

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page
- `isActive` (optional) - Filter by active status (true/false)
- `search` (optional, max 100 chars) - Text search in gallery name, owner, handling, folderName
- `owner` (optional, max 50 chars) - Filter by owner name (partial match)
- `folderName` (optional, max 50 chars) - Filter by folder name

**Example Request:**

```
GET /api/gallery?page=1&limit=10&folderName=Products&isActive=true&search=showcase
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Galleries retrieved successfully",
  "data": {
    "galleries": [
      {
        "_id": "674d1234567890abcdef1234",
        "galleryName": "Product Showcase",
        "owner": "John Doe",
        "handling": "Marketing Team",
        "folderName": "Products",
        "isActive": true,
        "media": [
          {
            "fileUrl": "http://localhost:3000/media/gallery/image1.jpg"
          }
        ],
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
      "totalGalleries": 10,
      "activeGalleries": 8,
      "inactiveGalleries": 2,
      "totalMediaFiles": 45,
      "galleriesByOwner": [
        {
          "owner": "John Doe",
          "count": 3
        }
      ],
      "galleriesByFolder": [
        {
          "folderName": "Products",
          "count": 5
        },
        {
          "folderName": "General",
          "count": 3
        }
      ]
    }
  }
}
```

---

### 3. Get Gallery by ID

Retrieves a specific gallery by its ID.

**Endpoint:** `GET /api/gallery/{galleryId}`

**Parameters:**

- `galleryId` (required) - MongoDB ObjectId of the gallery

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery retrieved successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "galleryName": "Product Showcase",
    "owner": "John Doe",
    "handling": "Marketing Team",
    "folderName": "Products",
    "isActive": true,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/gallery/image1.jpg"
      },
      {
        "fileUrl": "http://localhost:3000/media/gallery/image2.png"
      }
    ],
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found` - Gallery not found

---

### 4. Update Gallery

Updates an existing gallery with optional media file replacement.

**Endpoint:** `PUT /api/gallery/{galleryId}`

**Content-Type:** `multipart/form-data`

**Parameters:**

- `galleryId` (required) - MongoDB ObjectId of the gallery

**Form Fields:** (All optional)

- `galleryName` (optional, 2-100 chars) - Name of the gallery
- `owner` (optional, 2-50 chars) - Owner of the gallery
- `handling` (optional, 2-100 chars) - Handling information
- `folderName` (optional, 2-50 chars) - Folder name
- `isActive` (optional) - Active status
- `media` (optional) - Array of media files (replaces all existing media)
- `keepExistingMedia` (optional, default: true) - Whether to keep existing media

**Example Request:**

```bash
PUT /api/gallery/674d1234567890abcdef1234
Content-Type: multipart/form-data

galleryName=Updated Product Showcase
folderName=Activities
media=@new_image.jpg
keepExistingMedia=false
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery updated successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "galleryName": "Updated Product Showcase",
    "owner": "John Doe",
    "handling": "Marketing Team",
    "folderName": "Activities",
    "isActive": true,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/gallery/new_image.jpg"
      }
    ],
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T11:15:00.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found` - Gallery not found
- `409 Conflict` - Gallery name already exists

---

### 5. Delete Gallery (Soft Delete)

Soft deletes a gallery by setting isActive to false.

**Endpoint:** `DELETE /api/gallery/{galleryId}`

**Parameters:**

- `galleryId` (required) - MongoDB ObjectId of the gallery

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery deleted successfully",
  "data": null
}
```

**Error Responses:**

- `404 Not Found` - Gallery not found

---

### 6. Delete Gallery (Hard Delete)

Permanently deletes a gallery from the database.

**Endpoint:** `DELETE /api/gallery/{galleryId}/permanent`

**Parameters:**

- `galleryId` (required) - MongoDB ObjectId of the gallery

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery permanently deleted successfully",
  "data": null
}
```

**Error Responses:**

- `404 Not Found` - Gallery not found

---

### 7. Get Galleries by Owner

Retrieves all active galleries for a specific owner.

**Endpoint:** `GET /api/gallery/owner/{owner}`

**Parameters:**

- `owner` (required, 2-50 chars) - Owner name (partial match)

**Example Request:**

```
GET /api/gallery/owner/John%20Doe
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Galleries by owner retrieved successfully",
  "data": [
    {
      "_id": "674d1234567890abcdef1234",
      "galleryName": "Product Showcase",
      "owner": "John Doe",
      "handling": "Marketing Team",
      "folderName": "Products",
      "isActive": true,
      "media": [
        {
          "fileUrl": "http://localhost:3000/media/gallery/image1.jpg"
        }
      ],
      "createdAt": "2025-11-15T10:30:00.000Z",
      "updatedAt": "2025-11-15T10:30:00.000Z"
    }
  ]
}
```

---

### 8. Get Featured Galleries

Retrieves featured (active) galleries with optional limit.

**Endpoint:** `GET /api/gallery/featured`

**Query Parameters:**

- `limit` (optional, default: 10, max: 50) - Number of galleries to retrieve

**Example Request:**

```
GET /api/gallery/featured?limit=5
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Featured galleries retrieved successfully",
  "data": [
    {
      "_id": "674d1234567890abcdef1234",
      "galleryName": "Product Showcase",
      "owner": "John Doe",
      "handling": "Marketing Team",
      "folderName": "Products",
      "isActive": true,
      "media": [
        {
          "fileUrl": "http://localhost:3000/media/gallery/image1.jpg"
        }
      ],
      "createdAt": "2025-11-15T10:30:00.000Z",
      "updatedAt": "2025-11-15T10:30:00.000Z"
    }
  ]
}
```

---

### 9. Search Galleries

Searches galleries by name, owner, handling, or folder name.

**Endpoint:** `GET /api/gallery/search`

**Query Parameters:**

- `q` (required, min 2 chars, max 100 chars) - Search query

**Example Request:**

```
GET /api/gallery/search?q=product
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery search completed successfully",
  "data": [
    {
      "_id": "674d1234567890abcdef1234",
      "galleryName": "Product Showcase",
      "owner": "John Doe",
      "handling": "Marketing Team",
      "folderName": "Products",
      "isActive": true,
      "media": [
        {
          "fileUrl": "http://localhost:3000/media/gallery/image1.jpg"
        }
      ],
      "createdAt": "2025-11-15T10:30:00.000Z",
      "updatedAt": "2025-11-15T10:30:00.000Z"
    }
  ]
}
```

---

### 10. Toggle Gallery Status

Toggles the active/inactive status of a gallery.

**Endpoint:** `PATCH /api/gallery/{galleryId}/toggle-status`

**Parameters:**

- `galleryId` (required) - MongoDB ObjectId of the gallery

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Gallery deactivated successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "galleryName": "Product Showcase",
    "owner": "John Doe",
    "handling": "Marketing Team",
    "folderName": "Products",
    "isActive": false,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/gallery/image1.jpg"
      }
    ],
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T11:30:00.000Z"
  }
}
```

---

### 11. Get Galleries with Media Count

Retrieves galleries sorted by media count.

**Endpoint:** `GET /api/gallery/media-count`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Galleries with media count retrieved successfully",
  "data": [
    {
      "_id": "674d1234567890abcdef1234",
      "galleryName": "Product Showcase",
      "owner": "John Doe",
      "handling": "Marketing Team",
      "folderName": "Products",
      "isActive": true,
      "media": [
        {
          "fileUrl": "http://localhost:3000/media/gallery/image1.jpg"
        },
        {
          "fileUrl": "http://localhost:3000/media/gallery/image2.png"
        }
      ],
      "mediaCount": 2,
      "createdAt": "2025-11-15T10:30:00.000Z",
      "updatedAt": "2025-11-15T10:30:00.000Z"
    }
  ]
}
```

---

### 12. Upload Media to Gallery

Adds media files to an existing gallery.

**Endpoint:** `POST /api/gallery/{galleryId}/media`

**Content-Type:** `multipart/form-data`

**Parameters:**

- `galleryId` (required) - MongoDB ObjectId of the gallery

**Form Fields:**

- `media` (required) - Array of media files to upload

**Example Request:**

```bash
POST /api/gallery/674d1234567890abcdef1234/media
Content-Type: multipart/form-data

media=@new_image1.jpg
media=@new_image2.png
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Media uploaded successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "galleryName": "Product Showcase",
    "owner": "John Doe",
    "handling": "Marketing Team",
    "folderName": "Products",
    "isActive": true,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/gallery/existing_image.jpg"
      },
      {
        "fileUrl": "http://localhost:3000/media/gallery/new_image1.jpg"
      },
      {
        "fileUrl": "http://localhost:3000/media/gallery/new_image2.png"
      }
    ],
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T11:45:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - No media files provided
- `404 Not Found` - Gallery not found

---

### 13. Remove All Media from Gallery

Removes all media files from a gallery.

**Endpoint:** `DELETE /api/gallery/{galleryId}/media`

**Parameters:**

- `galleryId` (required) - MongoDB ObjectId of the gallery

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "All media removed successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "galleryName": "Product Showcase",
    "owner": "John Doe",
    "handling": "Marketing Team",
    "folderName": "Products",
    "isActive": true,
    "media": [],
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T12:00:00.000Z"
  }
}
```

---

## Error Codes

| Status Code | Description                                             |
| ----------- | ------------------------------------------------------- |
| 400         | Bad Request - Validation errors, file validation errors |
| 401         | Unauthorized - Missing or invalid authentication token  |
| 403         | Forbidden - Insufficient permissions                    |
| 404         | Not Found - Gallery not found                           |
| 409         | Conflict - Gallery name already exists                  |
| 500         | Internal Server Error - Server error                    |

## Validation Rules

### Gallery Name

- Required when creating
- 2-100 characters
- Must be unique

### Owner

- Required when creating
- 2-50 characters

### Handling

- Required when creating
- 2-100 characters

### Folder Name

- Optional (defaults to "General")
- 2-50 characters
- Must reference an existing active folder

### Media Files

- Maximum 20 files per gallery
- Supported formats: Images (jpg, jpeg, png, gif, webp)
- File size validation applied
- Files are processed and stored with unique names

## Folder Integration

1. **Default Folder**: All galleries without a specified folder are assigned to "General"
2. **Folder Validation**: folderName must reference an existing active gallery folder
3. **Folder Filtering**: Galleries can be filtered by folder name using the `folderName` query parameter
4. **Statistics**: Gallery statistics include breakdown by folder

## File Upload Notes

1. **File Processing**: Files are automatically processed and stored in the `public/media/gallery/` directory
2. **File Validation**: Files are validated for type, size, and format
3. **URL Generation**: File URLs are automatically generated based on the BASE_URL environment variable
4. **File Replacement**: When updating gallery media, existing files are deleted unless `keepExistingMedia=true`

## Search Functionality

The search functionality performs text search across:

- Gallery name
- Owner name
- Handling information
- Folder name

Search is case-insensitive and supports partial matches.
