# Product API Documentation

This document provides comprehensive API specifications for all product-related endpoints in the Pluto Koi Backend system.

## Base URL

```
{{BASE_URL}}/api/product
```

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Product Data Model

### Product Schema

```typescript
interface IProduct {
  _id: string;
  productName: string;
  productPrice: number;
  productType: "Produk" | "Koi Store";
  productCategory: {
    _id: string;
    name: string;
    description?: string;
  };
  stock: number;
  isActive: boolean;
  media: Array<{
    fileUrl: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Endpoints

### 1. Get All Products

**GET** `/api/product`

Retrieves a paginated list of products with filtering options.

#### Query Parameters

| Parameter  | Type    | Required | Default | Description                                      |
| ---------- | ------- | -------- | ------- | ------------------------------------------------ |
| `page`     | number  | No       | 1       | Page number for pagination                       |
| `limit`    | number  | No       | 10      | Number of items per page                         |
| `isActive` | boolean | No       | -       | Filter by product status (true/false)            |
| `search`   | string  | No       | -       | Search term for product name (max 100 chars)     |
| `category` | string  | No       | -       | Filter by category ObjectId                      |
| `type`     | string  | No       | -       | Filter by product type ("Produk" or "Koi Store") |

#### Example Request

```bash
GET /api/product?page=1&limit=10&category=672abc123def456789012345&type=Produk&isActive=true
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "672def123abc456789012345",
        "productName": "Premium Koi Food",
        "productPrice": 45.99,
        "productType": "Produk",
        "productCategory": {
          "_id": "672abc123def456789012345",
          "name": "Pakan Ikan",
          "description": "Fish food and nutrition products"
        },
        "stock": 100,
        "isActive": true,
        "media": [
          {
            "fileUrl": "http://localhost:3000/media/products/1699123456789-koi-food.jpg"
          }
        ],
        "createdAt": "2024-11-08T10:30:00.000Z",
        "updatedAt": "2024-11-08T10:30:00.000Z"
      }
    ],
    "metadata": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "statistics": {
      "totalProducts": 25,
      "activeProducts": 20,
      "inactiveProducts": 5,
      "averagePrice": 65,
      "priceRange": {
        "min": 15,
        "max": 150
      }
    }
  }
}
```

---

### 2. Get Featured Products

**GET** `/api/product/featured`

Retrieves active products sorted by creation date (newest first).

#### Query Parameters

| Parameter | Type   | Required | Default | Description                           |
| --------- | ------ | -------- | ------- | ------------------------------------- |
| `limit`   | number | No       | 10      | Number of products to return (max 50) |

#### Example Request

```bash
GET /api/product/featured?limit=5
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Featured products retrieved successfully",
  "data": [
    {
      "_id": "672def123abc456789012345",
      "productName": "Premium Koi Food",
      "productPrice": 45.99,
      "productType": "Produk",
      "productCategory": {
        "_id": "672abc123def456789012345",
        "name": "Pakan Ikan"
      },
      "stock": 100,
      "isActive": true,
      "media": [],
      "createdAt": "2024-11-08T10:30:00.000Z",
      "updatedAt": "2024-11-08T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Products by Price Range

**GET** `/api/product/price-range`

Retrieves active products within a specified price range.

#### Query Parameters

| Parameter  | Type   | Required | Default | Description                |
| ---------- | ------ | -------- | ------- | -------------------------- |
| `minPrice` | number | Yes      | -       | Minimum price (≥ 0)        |
| `maxPrice` | number | Yes      | -       | Maximum price (≥ minPrice) |

#### Example Request

```bash
GET /api/product/price-range?minPrice=20&maxPrice=100
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "672def123abc456789012345",
      "productName": "Premium Koi Food",
      "productPrice": 45.99,
      "productType": "Produk",
      "productCategory": {
        "_id": "672abc123def456789012345",
        "name": "Pakan Ikan"
      },
      "isActive": true,
      "media": [],
      "createdAt": "2024-11-08T10:30:00.000Z",
      "updatedAt": "2024-11-08T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Create Product

**POST** `/api/product`

Creates a new product with optional media upload.

**Note**: This endpoint accepts `multipart/form-data` for file uploads.

#### Form Data Fields

| Field             | Type    | Required | Description                           |
| ----------------- | ------- | -------- | ------------------------------------- |
| `productName`     | string  | Yes      | Product name (max 200 chars)          |
| `productPrice`    | number  | Yes      | Product price (> 0)                   |
| `productType`     | string  | Yes      | Product type: "Produk" or "Koi Store" |
| `productCategory` | string  | Yes      | Category ObjectId                     |
| `stock`           | number  | Yes      | Product stock quantity (≥ 0)          |
| `isActive`        | boolean | No       | Product status (default: true)        |
| `media`           | file[]  | No       | Product images/media files            |

#### Example Request

```bash
POST /api/product
Content-Type: multipart/form-data

productName=Premium Koi Food
productPrice=45.99
productType=Produk
productCategory=672abc123def456789012345
stock=100
isActive=true
media=@koi-food-1.jpg
media=@koi-food-2.jpg
```

#### Success Response (201 Created)

```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "_id": "672def123abc456789012345",
    "productName": "Premium Koi Food",
    "productPrice": 45.99,
    "productType": "Produk",
    "productCategory": "672abc123def456789012345",
    "stock": 100,
    "isActive": true,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/products/1699123456789-koi-food-1.jpg"
      },
      {
        "fileUrl": "http://localhost:3000/media/products/1699123456790-koi-food-2.jpg"
      }
    ],
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T10:30:00.000Z"
  }
}
```

---

### 5. Get Product by ID

**GET** `/api/product/:id`

Retrieves a specific product by its ID.

#### Path Parameters

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | string | Yes      | Product ObjectId |

#### Example Request

```bash
GET /api/product/672def123abc456789012345
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Product retrieved successfully",
  "data": {
    "_id": "672def123abc456789012345",
    "productName": "Premium Koi Food",
    "productPrice": 45.99,
    "productType": "Produk",
    "productCategory": {
      "_id": "672abc123def456789012345",
      "name": "Pakan Ikan",
      "description": "Fish food and nutrition products"
    },
    "stock": 100,
    "isActive": true,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/products/1699123456789-koi-food.jpg"
      }
    ],
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T10:30:00.000Z"
  }
}
```

---

### 6. Update Product

**PUT** `/api/product/:id`

Updates an existing product by ID with optional media upload.

**Note**: This endpoint accepts `multipart/form-data` for file uploads.

#### Path Parameters

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | string | Yes      | Product ObjectId |

#### Form Data Fields

| Field               | Type    | Required | Description                               |
| ------------------- | ------- | -------- | ----------------------------------------- |
| `productName`       | string  | No       | Product name (max 200 chars)              |
| `productPrice`      | number  | No       | Product price (> 0)                       |
| `productType`       | string  | No       | Product type: "Produk" or "Koi Store"     |
| `productCategory`   | string  | No       | Category ObjectId                         |
| `stock`             | number  | No       | Product stock quantity (≥ 0)              |
| `isActive`          | boolean | No       | Product status                            |
| `keepExistingMedia` | boolean | No       | Keep existing media when adding new files |
| `media`             | file[]  | No       | New product images/media files            |

#### Example Request

```bash
PUT /api/product/672def123abc456789012345
Content-Type: multipart/form-data

productName=Premium Koi Food Updated
productPrice=49.99
keepExistingMedia=true
media=@new-image.jpg
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": {
    "_id": "672def123abc456789012345",
    "productName": "Premium Koi Food Updated",
    "productPrice": 49.99,
    "productType": "Produk",
    "productCategory": "672abc123def456789012345",
    "stock": 100,
    "isActive": true,
    "media": [
      {
        "fileUrl": "http://localhost:3000/media/products/1699123456789-koi-food.jpg"
      },
      {
        "fileUrl": "http://localhost:3000/media/products/1699123456800-new-image.jpg"
      }
    ],
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T11:45:00.000Z"
  }
}
```

---

### 7. Toggle Product Status

**PATCH** `/api/product/:id/status`

Toggles the active status of a product (active ↔ inactive).

#### Path Parameters

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | string | Yes      | Product ObjectId |

#### Example Request

```bash
PATCH /api/product/672def123abc456789012345/status
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Product deactivated successfully",
  "data": {
    "_id": "672def123abc456789012345",
    "productName": "Premium Koi Food",
    "productPrice": 45.99,
    "productType": "Produk",
    "productCategory": "672abc123def456789012345",
    "stock": 100,
    "isActive": false,
    "media": [],
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T11:50:00.000Z"
  }
}
```

---

### 8. Delete Product (Soft Delete)

**DELETE** `/api/product/:id`

Soft deletes a product by setting its status to inactive.

#### Path Parameters

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | string | Yes      | Product ObjectId |

#### Example Request

```bash
DELETE /api/product/672def123abc456789012345
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Product deleted successfully",
  "data": null
}
```

---

### 9. Permanently Delete Product (Admin Only)

**DELETE** `/api/product/:id/permanent`

**Authentication**: Admin access required

Permanently deletes a product from the database.

#### Path Parameters

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | string | Yes      | Product ObjectId |

#### Example Request

```bash
DELETE /api/product/672def123abc456789012345/permanent
Authorization: Bearer <admin_token>
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Product permanently deleted successfully",
  "data": null
}
```

---

## Error Responses

### Common Error Formats

#### Validation Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["productName: Product name is required", "productPrice: Product price must be greater than 0"]
}
```

#### Not Found Error (404 Not Found)

```json
{
  "success": false,
  "message": "Product not found"
}
```

#### Conflict Error (409 Conflict)

```json
{
  "success": false,
  "message": "Product with this name already exists"
}
```

#### Unauthorized Error (401 Unauthorized)

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

#### Forbidden Error (403 Forbidden)

```json
{
  "success": false,
  "message": "Admin access required for permanent deletion"
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to create product"
}
```

---

## File Upload Guidelines

### Supported File Types

- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Maximum file size: 5MB per file
- Maximum files per request: 10

### File Processing

- Files are automatically resized and optimized
- Original filename is preserved with timestamp prefix
- Files are stored in `public/media/products/` directory
- URLs are returned as absolute paths

---

## Rate Limiting

- **Standard endpoints**: 100 requests per 15 minutes per IP
- **File upload endpoints**: 10 requests per 15 minutes per IP
- **Admin endpoints**: 50 requests per 15 minutes per IP

---

## Examples

### Complete Product Creation Example

```bash
curl -X POST \
  http://localhost:3000/api/product \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "productName=Premium Koi Pellets" \
  -F "productPrice=75.50" \
  -F "productType=Produk" \
  -F "productCategory=672abc123def456789012345" \
  -F "stock=50" \
  -F "isActive=true" \
  -F "media=@product-image-1.jpg" \
  -F "media=@product-image-2.jpg"
```

### Product Search with Filters Example

```bash
curl -X GET \
  "http://localhost:3000/api/product?search=koi&category=672abc123def456789012345&type=Produk&isActive=true&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Changelog

### Version 1.2.0 (Current)

- Added `stock` field as mandatory field for product creation
- Stock validation: must be >= 0
- Stock field is optional for update operations
- Updated all response examples to include stock field

### Version 1.1.0

- Added `productType` and `productCategory` as mandatory fields
- Added filtering by category and type
- Enhanced validation with Zod schemas
- Added category population in responses
- Improved error handling and responses

### Version 1.0.0

- Initial product CRUD operations
- Basic pagination and search functionality
- File upload support for product media
