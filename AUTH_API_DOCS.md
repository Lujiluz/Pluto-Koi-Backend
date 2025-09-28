# Authentication API Documentation

## Overview

Complete JWT-based authentication system for the Pluto Koi Backend API with user registration, login, and protected routes.

## Features

- ✅ User registration with validation
- ✅ User login with JWT token generation
- ✅ Password hashing with bcrypt
- ✅ JWT token verification middleware
- ✅ Role-based access control (ADMIN, END_USER)
- ✅ Input validation and sanitization
- ✅ Error handling and logging
- ✅ Clean architecture with separation of concerns

## API Endpoints

### Public Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "endUser",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "endUser",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Endpoints

#### Get User Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "endUser",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Verify Token

```http
GET /api/auth/verify
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "endUser"
    }
  }
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Authentication Headers

For protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token_here>
```

## User Roles

- `admin`: Full system access
- `endUser`: Standard user access (default)

## Validation Rules

### Registration

- **Name**: 2-50 characters, required
- **Email**: Valid email format, unique, required
- **Password**: Minimum 6 characters, required

### Login

- **Email**: Valid email format, required
- **Password**: Required

## Error Responses

### 400 Bad Request - Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Name must be at least 2 characters long", "Please enter a valid email address"]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Access token is required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 409 Conflict - User Exists

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

## JWT Token Details

- **Algorithm**: HS256
- **Expiration**: 7 days (configurable via JWT_EXPIRES_IN)
- **Payload**: userId, email, role
- **Secret**: Set via JWT_SECRET environment variable

## Security Features

1. **Password Hashing**: bcrypt with salt rounds = 12
2. **JWT Signing**: HMAC SHA256 algorithm
3. **Input Validation**: Comprehensive validation and sanitization
4. **CORS Support**: Configurable cross-origin requests
5. **Error Masking**: Generic error messages for security
6. **Token Verification**: Validates token and user existence

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Database
MONGO_URI=your-mongodb-connection-string

# Server
PORT=3000
```

## Usage Examples

### JavaScript/Frontend Integration

```javascript
// Register
const registerResponse = await fetch("/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  }),
});

const registerData = await registerResponse.json();
const token = registerData.data.token;

// Store token (localStorage, sessionStorage, etc.)
localStorage.setItem("authToken", token);

// Use token for protected requests
const profileResponse = await fetch("/api/auth/profile", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### cURL Examples

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Profile (replace TOKEN with actual JWT)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Project Structure

```
src/
├── config/
│   └── database.ts           # Database configuration
├── controllers/
│   └── auth.controller.ts    # HTTP request handlers
├── interfaces/
│   └── auth.interface.ts     # TypeScript interfaces
├── middleware/
│   ├── auth.middleware.ts    # JWT authentication middleware
│   └── errorHandler.ts       # Error handling middleware
├── models/
│   └── user.model.ts         # User model with Mongoose
├── repository/
│   └── user.repository.ts    # Data access layer
├── routes/
│   ├── auth.routes.ts        # Auth route definitions
│   └── index.ts              # Route aggregation
├── services/
│   └── auth.service.ts       # Business logic
├── utils/
│   └── database.ts           # Database utilities
├── validations/
│   └── auth.validation.ts    # Input validation
└── main.ts                   # Application entry point
```

## Testing

Start the server and test the endpoints:

```bash
npm run dev
```

The server will start on `http://localhost:3000` with the following endpoints available:

- Root: `http://localhost:3000/`
- Health: `http://localhost:3000/api/health`
- Auth: `http://localhost:3000/api/auth/*`

## Next Steps

1. **Rate Limiting**: Add rate limiting to prevent brute force attacks
2. **Email Verification**: Implement email verification for new accounts
3. **Password Reset**: Add forgot password functionality
4. **Refresh Tokens**: Implement refresh token mechanism
5. **Account Lockout**: Lock accounts after failed login attempts
6. **Audit Logging**: Log authentication events
7. **Social Login**: Add OAuth integration (Google, Facebook, etc.)
8. **Two-Factor Auth**: Implement 2FA for enhanced security
