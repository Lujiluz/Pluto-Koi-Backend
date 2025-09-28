# 📊 Logging Middleware Documentation

## Overview

Comprehensive logging system for the Pluto Koi Backend API with request/response tracking, authentication logging, error monitoring, and performance analysis.

## Features

- ✅ **Request/Response Logging** - Automatic HTTP request and response logging
- ✅ **Authentication Logging** - Specialized logging for auth events
- ✅ **Error Logging** - Unhandled error capture and logging
- ✅ **Performance Monitoring** - Slow request detection
- ✅ **Development Logging** - Verbose logging for development
- ✅ **Request ID Tracking** - UUID-based request correlation
- ✅ **Sensitive Data Protection** - Automatic sanitization of passwords, tokens
- ✅ **Structured Logging** - JSON-formatted logs with context
- ✅ **Log Level Control** - Configurable log levels (ERROR, WARN, INFO, DEBUG)

## Logger Class

### Log Levels

```typescript
enum LogLevel {
  ERROR = "ERROR", // System errors, exceptions
  WARN = "WARN", // Warnings, 4xx responses
  INFO = "INFO", // General information, successful operations
  DEBUG = "DEBUG", // Detailed debugging information
}
```

### Configuration

Set log level via environment variable:

```env
LOG_LEVEL=INFO  # ERROR | WARN | INFO | DEBUG
NODE_ENV=development  # Enables development logging
```

### Usage Examples

```typescript
import { logger } from "#utils/logger.js";

// Basic logging
logger.info("User created successfully");
logger.error("Database connection failed");
logger.warn("Slow query detected");
logger.debug("Processing user data");

// Contextual logging
logger.info("User login", { userId: "123", email: "user@example.com" });
logger.error("Authentication failed", {
  reason: "Invalid password",
  attempts: 3,
  ip: "192.168.1.1",
});

// Specialized logging methods
logger.auth("Login successful", { userId: "123" });
logger.database("User query executed", { table: "users", duration: "45ms" });
```

## Middleware Components

### 1. Main Logging Middleware (`loggingMiddleware`)

Automatically logs all HTTP requests and responses.

**Features:**

- Generates unique request ID (UUID)
- Logs request details (method, URL, headers, body)
- Logs response details (status code, response time, content length)
- Sanitizes sensitive data (passwords, tokens)
- Attaches user information if authenticated

**Example Output:**

```
[2024-01-01T00:00:00.000Z] INFO: POST /api/auth/login | Context: {
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "body": {"email": "user@example.com", "password": "[REDACTED]"}
}

[2024-01-01T00:00:01.200Z] INFO: POST /api/auth/login - 200 (1200ms) | Context: {
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "statusCode": 200,
  "responseTime": 1200,
  "userId": "user123"
}
```

### 2. Authentication Logging (`authLoggingMiddleware`)

Specialized logging for authentication events.

**Events Logged:**

- User registration (success/failure)
- User login (success/failure)
- User logout
- Token verification

**Example Output:**

```
[2024-01-01T00:00:00.000Z] INFO: AUTH: User login successful | Context: {
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "ip": "192.168.1.1",
  "userId": "user123",
  "success": true
}
```

### 3. Error Logging (`errorLoggingMiddleware`)

Captures unhandled errors and exceptions.

**Features:**

- Full error stack traces
- Request context preservation
- Sensitive data sanitization

**Example Output:**

```
[2024-01-01T00:00:00.000Z] ERROR: Unhandled error: Database connection timeout | Context: {
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "url": "/api/users",
  "userId": "user123",
  "stack": "Error: Database connection timeout\n    at..."
}
```

### 4. Performance Logging (`performanceLoggingMiddleware`)

Monitors and logs slow requests.

**Configuration:**

```typescript
// Log requests slower than 1000ms
app.use(performanceLoggingMiddleware(1000));
```

**Example Output:**

```
[2024-01-01T00:00:00.000Z] WARN: Slow request detected (2500ms > 1000ms) | Context: {
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "GET",
  "url": "/api/users",
  "responseTime": 2500,
  "threshold": 1000
}
```

### 5. Development Logging (`developmentLoggingMiddleware`)

Verbose logging for development environments.

**Features:**

- Only active when `NODE_ENV=development`
- Logs detailed request information
- Includes headers, cookies, session data

### 6. Skip Logging (`skipLogging`)

Excludes certain routes from logging.

**Usage:**

```typescript
// Skip logging for health checks and static files
app.use(skipLogging(["/health", "/favicon.ico", "/robots.txt"]));
```

## Integration

### Main Application Setup

```typescript
// src/main.ts
import { skipLogging, errorLoggingMiddleware, performanceLoggingMiddleware, developmentLoggingMiddleware } from "#middleware/logging.middleware.js";

// Trust proxy for accurate IP addresses
app.set("trust proxy", true);

// Logging middleware (early in middleware stack)
app.use(skipLogging(["/health", "/favicon.ico"]));
app.use(performanceLoggingMiddleware(1000));
app.use(developmentLoggingMiddleware);

// ... other middleware ...

// Error logging (after routes)
app.use(errorLoggingMiddleware);
```

### Route-Specific Logging

```typescript
// src/routes/auth.routes.ts
import { authLoggingMiddleware } from "#middleware/logging.middleware.js";

const router = Router();
router.use(authLoggingMiddleware); // Apply to all auth routes
```

## Security Features

### Sensitive Data Sanitization

The logger automatically redacts sensitive information:

**Protected Fields:**

- `password`
- `token`
- `secret`
- `key`
- `authorization`

**Before:**

```json
{
  "email": "user@example.com",
  "password": "secretpassword123",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**After (Logged):**

```json
{
  "email": "user@example.com",
  "password": "[REDACTED]",
  "token": "[REDACTED]"
}
```

### Header Sanitization

Authorization headers are automatically sanitized:

```
"authorization": "Bearer [REDACTED]"
```

## Log Format

### Standard Log Entry

```
[TIMESTAMP] LEVEL: MESSAGE | Context: CONTEXT_JSON
```

### Example

```
[2024-01-01T00:00:00.000Z] INFO: POST /api/auth/login | Context: {
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0 (compatible; API Client)",
  "userId": "user123",
  "responseTime": 245
}
```

## Monitoring and Analysis

### Request Correlation

Every request gets a unique ID for tracing across logs:

```
Request ID: 550e8400-e29b-41d4-a716-446655440000
```

### Performance Metrics

- Response times for all requests
- Slow request detection and alerting
- Database operation timing

### Error Tracking

- Unhandled exceptions with full stack traces
- Authentication failures
- Validation errors
- Database errors

## Environment Configuration

### Development

```env
LOG_LEVEL=DEBUG
NODE_ENV=development
```

- Verbose logging
- All request details
- Full error stack traces

### Production

```env
LOG_LEVEL=INFO
NODE_ENV=production
```

- Essential logging only
- Sanitized sensitive data
- Performance focused

### Testing

```env
LOG_LEVEL=ERROR
NODE_ENV=test
```

- Minimal logging
- Errors only

## Best Practices

### 1. Use Contextual Logging

```typescript
// Good
logger.info("User created", { userId, email, role });

// Bad
logger.info(`User ${userId} created with email ${email}`);
```

### 2. Use Appropriate Log Levels

```typescript
logger.error("Database connection failed"); // System error
logger.warn("Slow query detected"); // Performance issue
logger.info("User logged in"); // Normal operation
logger.debug("Processing user data"); // Development info
```

### 3. Include Request Context

```typescript
const context = {
  requestId: req.logContext?.requestId,
  userId: req.user?.id,
  operation: "updateProfile",
};
logger.info("Profile updated", context);
```

## Troubleshooting

### Common Issues

1. **Missing Request IDs**

   - Ensure `loggingMiddleware` is applied early
   - Check middleware order

2. **Sensitive Data in Logs**

   - Verify sanitization is working
   - Check field names match protected list

3. **Performance Impact**
   - Monitor log level settings
   - Consider async logging for high traffic

### Debug Mode

Enable debug logging to see all request details:

```env
LOG_LEVEL=DEBUG
```

## Future Enhancements

- **Log Aggregation**: Integration with ELK stack, Splunk
- **Metrics Export**: Prometheus metrics
- **Alerting**: Real-time error notifications
- **Log Rotation**: File-based logging with rotation
- **Async Logging**: Non-blocking log operations
- **Custom Formatters**: JSON, XML, custom formats
