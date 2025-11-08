# Category API Documentation

This document provides comprehensive API specifications for all category-related endpoints in the Pluto Koi Backend system.

## Base URL

```
{{BASE_URL}}/api/categories
```

## Authentication

Admin-only endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <admin_token>
```

## Category Data Model

### Category Schema

```typescript
interface ICategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Endpoints

### 1. Get All Categories

**GET** `/api/categories`

**Access**: Public

Retrieves a paginated list of categories with filtering options.

#### Query Parameters

| Parameter  | Type    | Required | Default | Description                                   |
| ---------- | ------- | -------- | ------- | --------------------------------------------- |
| `page`     | number  | No       | 1       | Page number for pagination                    |
| `limit`    | number  | No       | 10      | Number of items per page                      |
| `isActive` | boolean | No       | -       | Filter by category status (true/false)        |
| `search`   | string  | No       | -       | Search term for category name (max 100 chars) |

#### Example Request

```bash
GET /api/categories?page=1&limit=10&isActive=true&search=Pakan
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "_id": "672abc123def456789012345",
        "name": "Pakan Ikan",
        "description": "Fish food and nutrition products",
        "isActive": true,
        "createdAt": "2024-11-08T09:00:00.000Z",
        "updatedAt": "2024-11-08T09:00:00.000Z"
      },
      {
        "_id": "672abc123def456789012346",
        "name": "Pond Attachment",
        "description": "Equipment and accessories for pond maintenance",
        "isActive": true,
        "createdAt": "2024-11-08T09:01:00.000Z",
        "updatedAt": "2024-11-08T09:01:00.000Z"
      }
    ],
    "metadata": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "pages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "statistics": {
      "totalCategories": 2,
      "activeCategories": 2,
      "inactiveCategories": 0
    }
  }
}
```

---

### 2. Get Active Categories

**GET** `/api/categories/active`

**Access**: Public

Retrieves all active categories (useful for dropdown/select components).

#### Example Request

```bash
GET /api/categories/active
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Active categories retrieved successfully",
  "data": [
    {
      "_id": "672abc123def456789012345",
      "name": "Pakan Ikan",
      "description": "Fish food and nutrition products",
      "isActive": true,
      "createdAt": "2024-11-08T09:00:00.000Z",
      "updatedAt": "2024-11-08T09:00:00.000Z"
    },
    {
      "_id": "672abc123def456789012346",
      "name": "Pond Attachment",
      "description": "Equipment and accessories for pond maintenance",
      "isActive": true,
      "createdAt": "2024-11-08T09:01:00.000Z",
      "updatedAt": "2024-11-08T09:01:00.000Z"
    }
  ]
}
```

---

### 3. Create Category

**POST** `/api/categories`

**Access**: Private (Admin only)

Creates a new category.

#### Request Body

| Field         | Type    | Required | Description                           |
| ------------- | ------- | -------- | ------------------------------------- |
| `name`        | string  | Yes      | Category name (max 100 chars, unique) |
| `description` | string  | No       | Category description (max 500 chars)  |
| `isActive`    | boolean | No       | Category status (default: true)       |

#### Example Request

```bash
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Koi Medicine",
  "description": "Medical treatments and supplements for koi fish",
  "isActive": true
}
```

#### Success Response (201 Created)

```json
{
  "status": "success",
  "message": "Category created successfully",
  "data": {
    "_id": "672abc123def456789012347",
    "name": "Koi Medicine",
    "description": "Medical treatments and supplements for koi fish",
    "isActive": true,
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T10:30:00.000Z"
  }
}
```

#### Error Responses

**Validation Error (400 Bad Request)**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["name: Category name is required"]
}
```

**Conflict Error (409 Conflict)**

```json
{
  "success": false,
  "message": "Category with this name already exists"
}
```

---

### 4. Get Category by ID

**GET** `/api/categories/:id`

**Access**: Public

Retrieves a specific category by its ID.

#### Path Parameters

| Parameter | Type   | Required | Description                                 |
| --------- | ------ | -------- | ------------------------------------------- |
| `id`      | string | Yes      | Category ObjectId (24-character hex string) |

#### Example Request

```bash
GET /api/categories/672abc123def456789012345
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Category retrieved successfully",
  "data": {
    "_id": "672abc123def456789012345",
    "name": "Pakan Ikan",
    "description": "Fish food and nutrition products",
    "isActive": true,
    "createdAt": "2024-11-08T09:00:00.000Z",
    "updatedAt": "2024-11-08T09:00:00.000Z"
  }
}
```

#### Error Responses

**Not Found Error (404 Not Found)**

```json
{
  "success": false,
  "message": "Category not found"
}
```

**Invalid ID Error (400 Bad Request)**

```json
{
  "success": false,
  "message": "Parameter validation failed",
  "errors": ["id: Category ID must be a valid ObjectId"]
}
```

---

### 5. Update Category

**PUT** `/api/categories/:id`

**Access**: Private (Admin only)

Updates an existing category by ID.

#### Path Parameters

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `id`      | string | Yes      | Category ObjectId |

#### Request Body

| Field         | Type    | Required | Description                           |
| ------------- | ------- | -------- | ------------------------------------- |
| `name`        | string  | No       | Category name (max 100 chars, unique) |
| `description` | string  | No       | Category description (max 500 chars)  |
| `isActive`    | boolean | No       | Category status                       |

**Note**: At least one field must be provided for update.

#### Example Request

```bash
PUT /api/categories/672abc123def456789012345
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Premium Fish Food",
  "description": "High-quality nutrition products for all types of fish"
}
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Category updated successfully",
  "data": {
    "_id": "672abc123def456789012345",
    "name": "Premium Fish Food",
    "description": "High-quality nutrition products for all types of fish",
    "isActive": true,
    "createdAt": "2024-11-08T09:00:00.000Z",
    "updatedAt": "2024-11-08T11:45:00.000Z"
  }
}
```

#### Error Responses

**Validation Error (400 Bad Request)**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["At least one field must be provided for update"]
}
```

**Conflict Error (409 Conflict)**

```json
{
  "success": false,
  "message": "Category with this name already exists"
}
```

---

### 6. Toggle Category Status

**PATCH** `/api/categories/:id/status`

**Access**: Private (Admin only)

Toggles the active status of a category (active ↔ inactive).

#### Path Parameters

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `id`      | string | Yes      | Category ObjectId |

#### Example Request

```bash
PATCH /api/categories/672abc123def456789012345/status
Authorization: Bearer <admin_token>
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Category deactivated successfully",
  "data": {
    "_id": "672abc123def456789012345",
    "name": "Pakan Ikan",
    "description": "Fish food and nutrition products",
    "isActive": false,
    "createdAt": "2024-11-08T09:00:00.000Z",
    "updatedAt": "2024-11-08T11:50:00.000Z"
  }
}
```

---

### 7. Delete Category (Soft Delete)

**DELETE** `/api/categories/:id`

**Access**: Private (Admin only)

Soft deletes a category by setting its status to inactive.

#### Path Parameters

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `id`      | string | Yes      | Category ObjectId |

#### Example Request

```bash
DELETE /api/categories/672abc123def456789012345
Authorization: Bearer <admin_token>
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Category deleted successfully",
  "data": null
}
```

---

### 8. Permanently Delete Category

**DELETE** `/api/categories/:id/permanent`

**Access**: Private (Admin only)

Permanently deletes a category from the database.

**Warning**: This action cannot be undone and may affect related products.

#### Path Parameters

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `id`      | string | Yes      | Category ObjectId |

#### Example Request

```bash
DELETE /api/categories/672abc123def456789012345/permanent
Authorization: Bearer <admin_token>
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Category permanently deleted successfully",
  "data": null
}
```

---

## Common Error Responses

### Authentication Errors

**Unauthorized Error (401 Unauthorized)**

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Forbidden Error (403 Forbidden)**

```json
{
  "success": false,
  "message": "Admin access required"
}
```

**Invalid Token Error (401 Unauthorized)**

```json
{
  "success": false,
  "message": "Invalid token"
}
```

### Validation Errors

**Missing Required Fields (400 Bad Request)**

```json
{
  "success": false,
  "message": "Missing required field: name"
}
```

**Field Length Validation (400 Bad Request)**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["name: Category name cannot exceed 100 characters", "description: Description cannot exceed 500 characters"]
}
```

### Server Errors

**Internal Server Error (500 Internal Server Error)**

```json
{
  "success": false,
  "message": "Failed to create category"
}
```

---

## Business Rules

### Category Name Rules

- **Uniqueness**: Category names must be unique (case-insensitive)
- **Length**: 1-100 characters
- **Trimming**: Leading and trailing whitespace is automatically removed
- **Indexing**: Full-text search is enabled for category names

### Default Categories

The system automatically creates two default categories:

1. **"Pakan Ikan"** - Fish food and nutrition products
2. **"Pond Attachment"** - Equipment and accessories for pond maintenance

### Soft Delete Behavior

- Soft deleted categories (`isActive: false`) are excluded from active category lists
- Products linked to soft-deleted categories remain functional but may show category as inactive
- Soft-deleted categories can be reactivated using the toggle status endpoint

### Hard Delete Considerations

- **Data Integrity**: Consider the impact on products that reference this category
- **Cascading Effects**: Products may need category reassignment before permanent deletion
- **Audit Trail**: Hard deletion removes all traces from the system

---

## Usage Examples

### Complete Category Management Workflow

#### 1. Create a New Category

```bash
curl -X POST \
  http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Water Treatment",
    "description": "Products for maintaining water quality in ponds"
  }'
```

#### 2. List All Active Categories

```bash
curl -X GET \
  http://localhost:3000/api/categories/active
```

#### 3. Update Category

```bash
curl -X PUT \
  http://localhost:3000/api/categories/672abc123def456789012345 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Advanced water treatment solutions for koi ponds"
  }'
```

#### 4. Search Categories

```bash
curl -X GET \
  "http://localhost:3000/api/categories?search=water&isActive=true"
```

#### 5. Deactivate Category

```bash
curl -X PATCH \
  http://localhost:3000/api/categories/672abc123def456789012345/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Rate Limiting

- **Public endpoints**: 100 requests per 15 minutes per IP
- **Admin endpoints**: 50 requests per 15 minutes per authenticated user
- **Bulk operations**: Special rate limiting may apply for batch operations

---

## Data Relationships

### Category ↔ Product Relationship

- **One-to-Many**: One category can have multiple products
- **Required Reference**: All products must have a valid category
- **Population**: Product queries can populate category information
- **Cascade Considerations**: Deleting categories affects related products

### Example Product with Category Population

```json
{
  "_id": "672def123abc456789012345",
  "productName": "Premium Koi Pellets",
  "productCategory": {
    "_id": "672abc123def456789012345",
    "name": "Pakan Ikan",
    "description": "Fish food and nutrition products"
  }
}
```

---

## Testing Guidelines

### Unit Tests

- Validation schema testing
- Controller method testing
- Service layer testing
- Repository operations testing

### Integration Tests

- Full API endpoint testing
- Authentication middleware testing
- Error handling testing
- Database operations testing

### Test Data

```javascript
const testCategories = [
  {
    name: "Test Category 1",
    description: "Test description for category 1",
    isActive: true,
  },
  {
    name: "Test Category 2",
    description: "Test description for category 2",
    isActive: false,
  },
];
```

---

## Changelog

### Version 1.1.0 (Current)

- Added comprehensive validation with Zod schemas
- Implemented full CRUD operations with admin authentication
- Added pagination and search functionality
- Enhanced error handling and response consistency
- Added automatic seeding of default categories

### Version 1.0.0

- Initial category model and basic CRUD operations
- Basic validation and error handling
- Simple category management functionality
