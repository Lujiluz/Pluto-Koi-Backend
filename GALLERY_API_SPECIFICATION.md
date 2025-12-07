# Gallery API Specification

## Overview

The Gallery API provides endpoints for managing image galleries. Galleries are divided into **two types** with different form fields:

1. **Exclusive Product Gallery** (`exclusive`): For exclusive/premium fish products
   - Required fields: `owner`, `fishCode` (kode ikan), `fishType` (jenis ikan)
2. **Regular Gallery** (`regular`): For general gallery content
   - Required fields: `owner`, `handling` (penangan)

Each gallery belongs to a folder (default: "General") and can contain multiple media files. Galleries can be organized, filtered, and managed through various endpoints.

## Base URL

```
/api/gallery
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Gallery Types

### 1. Exclusive Product Gallery (`exclusive`)

Used for exclusive/premium fish products. Form fields:

- `galleryName` - Name of the gallery
- `galleryType` - Must be `"exclusive"`
- `owner` - Owner/breeder of the fish
- `fishCode` - Unique fish identification code (kode ikan)
- `fishType` - Type/species of fish (jenis ikan)
- `folderName` - Optional folder name
- `media` - Photos/media files

### 2. Regular Gallery (`regular`)

Used for general gallery content. Form fields:

- `galleryName` - Name of the gallery
- `galleryType` - Must be `"regular"` (default)
- `owner` - Owner of the gallery
- `handling` - Handler/team responsible (penangan)
- `folderName` - Optional folder name
- `media` - Photos/media files

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

Creates a new gallery with optional media files. Form fields differ based on gallery type.

**Endpoint:** `POST /api/gallery`

**Content-Type:** `multipart/form-data`

#### For Exclusive Product Gallery:

**Form Fields:**

- `galleryName` (required, 2-100 chars) - Name of the gallery
- `galleryType` (required) - Must be `"exclusive"`
- `owner` (required, 2-50 chars) - Owner/breeder of the fish
- `fishCode` (required for exclusive, 2-50 chars) - Fish identification code
- `fishType` (required for exclusive, 2-100 chars) - Type/species of fish
- `folderName` (optional, 2-50 chars, default: "General") - Folder name
- `isActive` (optional, default: true) - Active status
- `media` (optional) - Array of media files (max 20 files)

**Example Request (Exclusive):**

```bash
POST /api/gallery
Content-Type: multipart/form-data

galleryName=Premium Kohaku Collection
galleryType=exclusive
owner=Sakai Fish Farm
fishCode=KOH-2024-001
fishType=Kohaku
folderName=Premium
isActive=true
media=@fish1.jpg
media=@fish2.png
```

**Response (201 Created):**

```json
{
  "status": "success",
  "message": "Gallery created successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "galleryName": "Premium Kohaku Collection",
    "galleryType": "exclusive",
    "owner": "Sakai Fish Farm",
    "fishCode": "KOH-2024-001",
    "fishType": "Kohaku",
    "folderName": "Premium",
    "isActive": true,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/gallery/fish1.jpg"
      },
      {
        "fileUrl": "http://localhost:3000/media/gallery/fish2.png"
      }
    ],
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z"
  }
}
```

#### For Regular Gallery:

**Form Fields:**

- `galleryName` (required, 2-100 chars) - Name of the gallery
- `galleryType` (optional, default: "regular") - Must be `"regular"`
- `owner` (required, 2-50 chars) - Owner of the gallery
- `handling` (required for regular, 2-100 chars) - Handler/team information
- `folderName` (optional, 2-50 chars, default: "General") - Folder name
- `isActive` (optional, default: true) - Active status
- `media` (optional) - Array of media files (max 20 files)

**Example Request (Regular):**

```bash
POST /api/gallery
Content-Type: multipart/form-data

galleryName=Product Showcase
galleryType=regular
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
    "_id": "674d1234567890abcdef5678",
    "galleryName": "Product Showcase",
    "galleryType": "regular",
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

- `400 Bad Request` - Validation errors, file validation errors, missing required fields for gallery type
- `409 Conflict` - Gallery name already exists

---

### 2. Get All Galleries

Retrieves galleries with pagination, filtering, and statistics.

**Endpoint:** `GET /api/gallery`

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page
- `isActive` (optional) - Filter by active status (true/false)
- `search` (optional, max 100 chars) - Text search in gallery name, owner, handling, fishCode, fishType, folderName
- `owner` (optional, max 50 chars) - Filter by owner name (partial match)
- `folderName` (optional, max 50 chars) - Filter by folder name
- `galleryType` (optional) - Filter by gallery type (`exclusive` or `regular`)

**Example Request:**

```
GET /api/gallery?page=1&limit=10&galleryType=exclusive&isActive=true
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
        "galleryName": "Premium Kohaku Collection",
        "galleryType": "exclusive",
        "owner": "Sakai Fish Farm",
        "fishCode": "KOH-2024-001",
        "fishType": "Kohaku",
        "folderName": "Premium",
        "isActive": true,
        "media": [
          {
            "fileUrl": "http://localhost:3000/media/gallery/fish1.jpg"
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
          "owner": "Sakai Fish Farm",
          "count": 3
        }
      ],
      "galleriesByFolder": [
        {
          "folderName": "Premium",
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

**Response (200 OK) - Exclusive Gallery:**

```json
{
  "status": "success",
  "message": "Gallery retrieved successfully",
  "data": {
    "_id": "674d1234567890abcdef1234",
    "galleryName": "Premium Kohaku Collection",
    "galleryType": "exclusive",
    "owner": "Sakai Fish Farm",
    "fishCode": "KOH-2024-001",
    "fishType": "Kohaku",
    "folderName": "Premium",
    "isActive": true,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/gallery/fish1.jpg"
      }
    ],
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z"
  }
}
```

**Response (200 OK) - Regular Gallery:**

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

Updates an existing gallery with optional media file replacement. When updating, you can change the gallery type and its associated fields.

**Endpoint:** `PUT /api/gallery/{galleryId}`

**Content-Type:** `multipart/form-data`

**Parameters:**

- `galleryId` (required) - MongoDB ObjectId of the gallery

**Form Fields:** (All optional)

- `galleryName` (optional, 2-100 chars) - Name of the gallery
- `galleryType` (optional) - Gallery type (`exclusive` or `regular`)
- `owner` (optional, 2-50 chars) - Owner of the gallery
- `fishCode` (optional, 2-50 chars) - Fish code (for exclusive type, set to null to clear)
- `fishType` (optional, 2-100 chars) - Fish type (for exclusive type, set to null to clear)
- `handling` (optional, 2-100 chars) - Handling information (for regular type, set to null to clear)
- `folderName` (optional, 2-50 chars) - Folder name
- `isActive` (optional) - Active status
- `media` (optional) - Array of media files (replaces all existing media)
- `keepExistingMedia` (optional, default: true) - Whether to keep existing media

**Example Request (Update Exclusive Gallery):**

```bash
PUT /api/gallery/674d1234567890abcdef1234
Content-Type: multipart/form-data

galleryName=Updated Kohaku Collection
fishCode=KOH-2024-002
fishType=Tancho Kohaku
folderName=Premium
media=@new_fish.jpg
keepExistingMedia=false
```

**Example Request (Update Regular Gallery):**

```bash
PUT /api/gallery/674d1234567890abcdef1234
Content-Type: multipart/form-data

galleryName=Updated Product Showcase
handling=New Marketing Team
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
    "galleryName": "Updated Kohaku Collection",
    "galleryType": "exclusive",
    "owner": "Sakai Fish Farm",
    "fishCode": "KOH-2024-002",
    "fishType": "Tancho Kohaku",
    "folderName": "Premium",
    "isActive": true,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/gallery/new_fish.jpg"
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

| Status Code | Description                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------- |
| 400         | Bad Request - Validation errors, file validation errors, missing required fields for gallery type |
| 401         | Unauthorized - Missing or invalid authentication token                                            |
| 403         | Forbidden - Insufficient permissions                                                              |
| 404         | Not Found - Gallery not found                                                                     |
| 409         | Conflict - Gallery name already exists                                                            |
| 500         | Internal Server Error - Server error                                                              |

## Validation Rules

### Gallery Type

- Optional when creating (defaults to "regular")
- Valid values: `exclusive` or `regular`
- Determines which fields are required

### Gallery Name

- Required when creating
- 2-100 characters
- Must be unique

### Owner

- Required when creating (both types)
- 2-50 characters

### Fish Code (Exclusive Type Only)

- **Required** when galleryType is `exclusive`
- 2-50 characters
- Represents the unique fish identification code (kode ikan)

### Fish Type (Exclusive Type Only)

- **Required** when galleryType is `exclusive`
- 2-100 characters
- Represents the type/species of fish (jenis ikan)

### Handling (Regular Type Only)

- **Required** when galleryType is `regular`
- 2-100 characters
- Represents the handler/team responsible (penangan)

### Folder Name

- Optional (defaults to "General")
- 2-50 characters
- Must reference an existing active folder

### Media Files

- Maximum 20 files per gallery
- Supported formats: Images (jpg, jpeg, png, gif, webp)
- File size validation applied
- Files are processed and stored with unique names

## Gallery Type Form Summary

### Exclusive Product Form (`galleryType: "exclusive"`)

| Field       | Required | Description                          |
| ----------- | -------- | ------------------------------------ |
| galleryName | ✅ Yes   | Name of the gallery                  |
| galleryType | ✅ Yes   | Must be `"exclusive"`                |
| owner       | ✅ Yes   | Owner/breeder name                   |
| fishCode    | ✅ Yes   | Fish identification code (kode ikan) |
| fishType    | ✅ Yes   | Fish type/species (jenis)            |
| folderName  | ❌ No    | Folder name (default: "General")     |
| isActive    | ❌ No    | Active status (default: true)        |
| media       | ❌ No    | Media files                          |

### Regular Gallery Form (`galleryType: "regular"`)

| Field       | Required | Description                      |
| ----------- | -------- | -------------------------------- |
| galleryName | ✅ Yes   | Name of the gallery              |
| galleryType | ❌ No    | `"regular"` (default)            |
| owner       | ✅ Yes   | Owner name                       |
| handling    | ✅ Yes   | Handler/team (penangan)          |
| folderName  | ❌ No    | Folder name (default: "General") |
| isActive    | ❌ No    | Active status (default: true)    |
| media       | ❌ No    | Media files                      |

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
- Handling information (for regular type)
- Fish code (for exclusive type)
- Fish type (for exclusive type)
- Folder name

Search is case-insensitive and supports partial matches.
