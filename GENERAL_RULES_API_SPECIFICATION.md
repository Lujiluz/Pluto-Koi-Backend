# General Rules API Documentation

This document provides comprehensive API specifications for general rules management endpoints in the Pluto Koi Backend system.

## Base URL

```
{{BASE_URL}}/api/general-rules
```

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## General Rules Data Model

### General Rules Schema

```typescript
interface IGeneralRules {
  _id: string;
  content: string;
}
```

## Overview

The General Rules API manages application-wide rules and regulations. This is designed as a singleton pattern where typically only one set of general rules exists in the system at any time.

---

## Endpoints

### 1. Get General Rules

**GET** `/api/general-rules`

**Access**: Private (Authenticated users)

Retrieves the current general rules for the application.

#### Headers

```
Authorization: Bearer <token>
```

#### Example Request

```bash
GET /api/general-rules
Authorization: Bearer YOUR_TOKEN
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Berhasil mendapatkan data peraturan umum",
  "data": {
    "_id": "672abc123def456789012345",
    "content": "1. All users must comply with the platform's terms of service.\n2. Fraudulent activities are strictly prohibited.\n3. Users are responsible for the accuracy of their information.\n4. The platform reserves the right to suspend accounts that violate these rules.\n5. All transactions must be conducted through official channels."
  }
}
```

#### Error Responses

**Not Found Error (404 Not Found)**

```json
{
  "success": false,
  "message": "General rules not found"
}
```

**Unauthorized Error (401 Unauthorized)**

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Server Error (500 Internal Server Error)**

```json
{
  "success": false,
  "message": "Failed to retrieve general rules"
}
```

---

### 2. Create General Rules

**POST** `/api/general-rules`

**Access**: Private (Authenticated users)

Creates new general rules for the application.

#### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

| Field     | Type   | Required | Description                                            |
| --------- | ------ | -------- | ------------------------------------------------------ |
| `content` | string | Yes      | The content of the general rules (minimum 1 character) |

#### Example Request

```bash
POST /api/general-rules
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "content": "1. All users must comply with the platform's terms of service.\n2. Fraudulent activities are strictly prohibited.\n3. Users are responsible for the accuracy of their information.\n4. The platform reserves the right to suspend accounts that violate these rules.\n5. All transactions must be conducted through official channels."
}
```

#### Success Response (201 Created)

```json
{
  "status": "success",
  "message": "Berhasil membuat peraturan umum",
  "data": {
    "_id": "672abc123def456789012345",
    "content": "1. All users must comply with the platform's terms of service.\n2. Fraudulent activities are strictly prohibited.\n3. Users are responsible for the accuracy of their information.\n4. The platform reserves the right to suspend accounts that violate these rules.\n5. All transactions must be conducted through official channels."
  }
}
```

#### Error Responses

**Validation Error (400 Bad Request)**

```json
{
  "success": false,
  "message": "Validation failed: content: Content is required"
}
```

**Empty Content Error (400 Bad Request)**

```json
{
  "success": false,
  "message": "Validation failed: content: Content is required"
}
```

**Server Error (500 Internal Server Error)**

```json
{
  "success": false,
  "message": "Failed to create general rules"
}
```

---

### 3. Update General Rules

**PUT** `/api/general-rules/:id`

**Access**: Private (Authenticated users)

Updates existing general rules by ID.

#### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `id`      | string | Yes      | General Rules ObjectId |

#### Request Body

| Field     | Type   | Required | Description                              |
| --------- | ------ | -------- | ---------------------------------------- |
| `content` | string | Yes      | The updated content of the general rules |

#### Example Request

```bash
PUT /api/general-rules/672abc123def456789012345
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "content": "Updated Rules:\n1. All users must comply with the platform's terms of service.\n2. Fraudulent activities are strictly prohibited and will result in immediate account suspension.\n3. Users are responsible for the accuracy of their information.\n4. The platform reserves the right to suspend accounts that violate these rules.\n5. All transactions must be conducted through official channels.\n6. Users must verify their identity before participating in auctions."
}
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Berhasil memperbarui peraturan umum",
  "data": {
    "_id": "672abc123def456789012345",
    "content": "Updated Rules:\n1. All users must comply with the platform's terms of service.\n2. Fraudulent activities are strictly prohibited and will result in immediate account suspension.\n3. Users are responsible for the accuracy of their information.\n4. The platform reserves the right to suspend accounts that violate these rules.\n5. All transactions must be conducted through official channels.\n6. Users must verify their identity before participating in auctions."
  }
}
```

#### Error Responses

**Not Found Error (404 Not Found)**

```json
{
  "success": false,
  "message": "General rules not found"
}
```

**Validation Error (400 Bad Request)**

```json
{
  "success": false,
  "message": "Validation failed: content: Content is required"
}
```

**Server Error (500 Internal Server Error)**

```json
{
  "success": false,
  "message": "Failed to update general rules"
}
```

---

## Authentication

### Token Requirements

- **Valid JWT Token**: All endpoints require a valid JWT token
- **Token Location**: Must be provided in the Authorization header
- **Token Format**: `Bearer <token>`

### Authentication Errors

**Missing Token (401 Unauthorized)**

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Invalid Token (401 Unauthorized)**

```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Expired Token (401 Unauthorized)**

```json
{
  "success": false,
  "message": "Token expired"
}
```

---

## Business Logic

### Singleton Pattern

- **Single Instance**: The system is designed to maintain only one set of general rules at a time
- **Global Scope**: Rules apply to all users and operations within the platform
- **Version Control**: Updates overwrite existing rules rather than creating new versions

### Content Format

- **Plain Text**: Rules are stored as plain text strings
- **Formatting**: Line breaks (`\n`) are preserved for formatting
- **Length**: No explicit maximum length limit (depends on database constraints)
- **Validation**: Content cannot be empty or null

### Access Control

- **Read Access**: All authenticated users can read general rules
- **Write Access**: All authenticated users can create/update rules (consider implementing admin-only access for production)

---

## Usage Examples

### Complete General Rules Management Workflow

#### 1. Get Current Rules

```bash
curl -X GET \
  http://localhost:3000/api/general-rules \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2. Create Initial Rules

```bash
curl -X POST \
  http://localhost:3000/api/general-rules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "1. Respect all users\n2. No spam or fraudulent activity\n3. Follow platform guidelines\n4. Report any issues to support"
  }'
```

#### 3. Update Existing Rules

```bash
curl -X PUT \
  http://localhost:3000/api/general-rules/672abc123def456789012345 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated General Rules:\n1. Respect all users and maintain professional conduct\n2. No spam, fraudulent activity, or misrepresentation\n3. Follow all platform guidelines and terms of service\n4. Report any issues or violations to our support team\n5. Users must verify their identity for certain operations"
  }'
```

---

## Integration Guidelines

### Frontend Integration

#### Displaying Rules

```javascript
// Fetch and display general rules
async function fetchGeneralRules() {
  try {
    const response = await fetch("/api/general-rules", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const result = await response.json();

    if (result.status === "success") {
      // Display rules with preserved formatting
      document.getElementById("rules-content").innerHTML = result.data.content.replace(/\n/g, "<br>");
    }
  } catch (error) {
    console.error("Failed to fetch rules:", error);
  }
}
```

#### Admin Rules Management

```javascript
// Update general rules (admin interface)
async function updateGeneralRules(rulesId, newContent) {
  try {
    const response = await fetch(`/api/general-rules/${rulesId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: newContent,
      }),
    });

    const result = await response.json();

    if (result.status === "success") {
      alert("Rules updated successfully!");
      // Refresh rules display
      fetchGeneralRules();
    }
  } catch (error) {
    console.error("Failed to update rules:", error);
  }
}
```

### Mobile App Integration

#### React Native Example

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";

const fetchGeneralRules = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await fetch("YOUR_API_URL/api/general-rules", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching rules:", error);
    throw error;
  }
};
```

---

## Security Considerations

### Input Validation

- **XSS Prevention**: Sanitize content before displaying in web interfaces
- **Content Length**: Consider implementing reasonable length limits
- **Special Characters**: Handle special characters and formatting safely

### Access Control Recommendations

- **Admin Only**: Consider restricting create/update operations to admin users only
- **Audit Trail**: Implement logging for rules changes
- **Approval Workflow**: Consider implementing approval processes for rules changes

### Example Enhanced Security

```javascript
// Recommended: Admin-only access check
router.post("/", authenticateToken, requireAdmin, validateGeneralRules, generalRulesController.createRules);
router.put("/:id", authenticateToken, requireAdmin, validateGeneralRules, generalRulesController.updateRules);
```

---

## Error Handling

### Client-Side Error Handling

```javascript
async function handleGeneralRulesAPI(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      switch (response.status) {
        case 401:
          // Handle authentication error
          redirectToLogin();
          break;
        case 404:
          // Handle not found
          showMessage("Rules not found");
          break;
        case 500:
          // Handle server error
          showMessage("Server error occurred");
          break;
        default:
          showMessage(data.message || "An error occurred");
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    showMessage("Network error occurred");
    return null;
  }
}
```

---

## Rate Limiting

- **Standard endpoints**: 100 requests per 15 minutes per authenticated user
- **Create/Update operations**: 10 requests per 15 minutes per authenticated user
- **Read operations**: 200 requests per 15 minutes per authenticated user

---

## Testing

### Unit Test Examples

#### Service Testing

```javascript
describe("GeneralRulesService", () => {
  it("should retrieve general rules successfully", async () => {
    const result = await generalRulesService.getRules();
    expect(result.status).toBe("success");
    expect(result.data).toHaveProperty("content");
  });

  it("should create general rules successfully", async () => {
    const rulesData = { content: "Test rules content" };
    const result = await generalRulesService.createRules(rulesData);
    expect(result.status).toBe("success");
    expect(result.data.content).toBe("Test rules content");
  });
});
```

#### API Testing

```javascript
describe("General Rules API", () => {
  it("GET /api/general-rules should return rules", async () => {
    const response = await request(app).get("/api/general-rules").set("Authorization", `Bearer ${validToken}`).expect(200);

    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("content");
  });
});
```

---

## Changelog

### Version 1.0.0 (Current)

- Initial implementation of general rules management
- Basic CRUD operations for rules
- Authentication required for all operations
- Zod validation for input data
- Singleton pattern for rules management
- Comprehensive error handling

### Future Enhancements (Roadmap)

- Admin-only access for create/update operations
- Version history for rules changes
- Audit trail and change logging
- Rich text formatting support
- Multi-language rules support
- Approval workflow for rules changes
