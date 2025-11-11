# Authentication API - Registration Endpoint Documentation

## Overview

This documentation provides detailed specifications for the updated user registration endpoint. All fields are now required for user registration to ensure complete user profile creation.

## Endpoint Information

### POST /api/auth/register

**Description:** Register a new user account with complete profile information.

**Access Level:** Public

**Content-Type:** `application/json`

---

## Request Body Structure

### Required Fields

All fields marked below are **REQUIRED** and must be provided in the request body:

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string",
  "role": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  }
}
```

### Field Specifications

#### User Basic Information

| Field         | Type     | Required | Description               | Validation Rules                                                                                                                |
| ------------- | -------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string` | ✅ Yes   | User's full name          | • Min length: 2 characters<br>• Max length: 50 characters<br>• Automatically trimmed                                            |
| `email`       | `string` | ✅ Yes   | User's email address      | • Must be valid email format<br>• Automatically converted to lowercase<br>• Automatically trimmed<br>• Must be unique in system |
| `password`    | `string` | ✅ Yes   | User's password           | • Min length: 6 characters<br>• Max length: 128 characters                                                                      |
| `phoneNumber` | `string` | ✅ Yes   | User's phone number       | • Must match pattern: `/^[\d\s\-\+\(\)]+$/`<br>• Automatically trimmed                                                          |
| `role`        | `string` | ✅ Yes   | User's role in the system | • Must be one of: `"admin"`, `"endUser"`<br>• Default: `"endUser"` if not specified                                             |

#### Address Information (All Required)

| Field             | Type     | Required | Description     | Validation Rules                                     |
| ----------------- | -------- | -------- | --------------- | ---------------------------------------------------- |
| `address.street`  | `string` | ✅ Yes   | Street address  | • Min length: 1 character<br>• Automatically trimmed |
| `address.city`    | `string` | ✅ Yes   | City name       | • Min length: 1 character<br>• Automatically trimmed |
| `address.state`   | `string` | ✅ Yes   | State/Province  | • Min length: 1 character<br>• Automatically trimmed |
| `address.zipCode` | `string` | ✅ Yes   | Postal/ZIP code | • Min length: 1 character<br>• Automatically trimmed |
| `address.country` | `string` | ✅ Yes   | Country name    | • Min length: 1 character<br>• Automatically trimmed |

---

## Request Examples

### Complete Valid Request

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "phoneNumber": "+1 (555) 123-4567",
  "role": "endUser",
  "address": {
    "street": "123 Main Street, Apt 4B",
    "city": "New York",
    "state": "New York",
    "zipCode": "10001",
    "country": "United States"
  }
}
```

### Admin User Registration

```json
{
  "name": "Admin User",
  "email": "admin@company.com",
  "password": "AdminPassword123",
  "phoneNumber": "+1-800-555-0199",
  "role": "admin",
  "address": {
    "street": "456 Business Ave",
    "city": "San Francisco",
    "state": "California",
    "zipCode": "94105",
    "country": "United States"
  }
}
```

---

## Response Formats

### Success Response (201 Created)

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1 (555) 123-4567",
      "role": "endUser",
      "address": {
        "street": "123 Main Street, Apt 4B",
        "city": "New York",
        "state": "New York",
        "zipCode": "10001",
        "country": "United States"
      },
      "status": "active",
      "deleted": false,
      "deletedAt": null,
      "createdAt": "2025-11-11T10:30:00.000Z",
      "updatedAt": "2025-11-11T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

#### Validation Errors (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["name: Name must be at least 2 characters long", "email: Please enter a valid email address", "address.street: Street is required", "address.city: City is required"]
}
```

#### Email Already Exists (400 Bad Request)

```json
{
  "status": "error",
  "message": "User with this email already exists"
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "status": "error",
  "message": "Registration failed. Please try again."
}
```

---

## Frontend Integration Guide

### JavaScript/TypeScript Example

```typescript
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: "admin" | "endUser";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface RegisterResponse {
  status: "success" | "error";
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

async function registerUser(userData: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result: RegisterResponse = await response.json();

    if (response.status === 201 && result.status === "success") {
      // Store token for authenticated requests
      localStorage.setItem("authToken", result.data!.token);
      return result;
    } else {
      throw new Error(result.message || "Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}
```

### React Hook Example

```tsx
import { useState } from "react";

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: "admin" | "endUser";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export function useRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (formData: RegistrationFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      // Store authentication token
      localStorage.setItem("authToken", result.data.token);

      return result.data.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}
```

---

## Form Validation Guidelines

### Frontend Validation Recommendations

Implement client-side validation to improve user experience:

```typescript
function validateRegistrationForm(data: RegistrationFormData): string[] {
  const errors: string[] = [];

  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  if (data.name && data.name.length > 50) {
    errors.push("Name cannot exceed 50 characters");
  }

  // Email validation
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("Please enter a valid email address");
  }

  // Password validation
  if (!data.password || data.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  if (data.password && data.password.length > 128) {
    errors.push("Password cannot exceed 128 characters");
  }

  // Phone number validation
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!data.phoneNumber || !phoneRegex.test(data.phoneNumber)) {
    errors.push("Please enter a valid phone number");
  }

  // Address validation
  if (!data.address.street?.trim()) errors.push("Street address is required");
  if (!data.address.city?.trim()) errors.push("City is required");
  if (!data.address.state?.trim()) errors.push("State is required");
  if (!data.address.zipCode?.trim()) errors.push("ZIP code is required");
  if (!data.address.country?.trim()) errors.push("Country is required");

  return errors;
}
```

---

## Security Considerations

### Password Security

- Passwords are automatically hashed using bcrypt with salt rounds of 12
- Original passwords are never stored in the database
- Password is excluded from all API responses

### Email Security

- Emails are automatically converted to lowercase
- Duplicate email addresses are prevented at the database level
- Email format validation is enforced

### Token Security

- JWT tokens are signed with a secret key
- Tokens include user ID, email, and role information
- Default token expiration is 7 days (configurable via JWT_EXPIRES_IN)

### Data Validation

- All input data is validated and sanitized using Zod schemas
- SQL injection protection through Mongoose ODM
- XSS protection through data sanitization

---

## Migration Notes for Existing Frontend

### Required Changes

1. **Update Registration Forms:**

   - Add phone number input field
   - Add complete address form section with all 5 required address fields
   - Update form validation to include new required fields

2. **Update API Calls:**

   - Include `phoneNumber` in registration request
   - Include complete `address` object with all required fields
   - Handle new validation error responses

3. **Update Type Definitions:**
   - Add `phoneNumber: string` to user registration interface
   - Make `address` required instead of optional
   - Ensure all address sub-fields are required

### Backward Compatibility

⚠️ **Breaking Change Warning:** This update introduces breaking changes to the registration API. Existing registration forms will fail validation until updated to include the new required fields.

---

## Testing

### Test Cases to Implement

1. **Valid Registration:**

   - Test with all required fields provided
   - Verify successful user creation and token generation

2. **Validation Errors:**

   - Test with missing required fields
   - Test with invalid email format
   - Test with short password
   - Test with invalid phone number format
   - Test with missing address fields

3. **Duplicate Email:**

   - Test registration with existing email address
   - Verify proper error response

4. **Edge Cases:**
   - Test with very long names/passwords
   - Test with special characters in address fields
   - Test with different phone number formats

---

## Support

For any questions or issues regarding the registration API:

1. Check the validation error messages in the API response
2. Ensure all required fields are properly formatted
3. Verify that the email address is unique in your system
4. Contact the backend development team for technical support

**Last Updated:** November 11, 2025
**API Version:** 1.0.0
