# Testing Zod Validation

## Test the Registration Endpoint

### Valid Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Invalid Registration - Missing Fields

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "invalid-email",
    "password": "123"
  }'
```

Expected Response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["name: Name is required", "email: Please enter a valid email address", "password: Password must be at least 6 characters long"]
}
```

### Invalid Registration - Long Name

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "This is a very long name that exceeds the fifty character limit and should be rejected",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login Validation Tests

### Valid Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Invalid Login - Bad Email Format

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "password123"
  }'
```

### Invalid Login - Missing Password

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

## Zod Features Implemented

1. **Automatic Type Conversion**: Email addresses are automatically converted to lowercase
2. **String Trimming**: Names and emails are automatically trimmed of whitespace
3. **Detailed Error Messages**: Specific error messages for each validation rule
4. **Type Safety**: Full TypeScript integration with inferred types
5. **Schema Composition**: Easy to extend with additional validation rules

## Benefits of Using Zod

- ✅ **Type Safety**: Compile-time type checking with TypeScript
- ✅ **Runtime Validation**: Validates data at runtime
- ✅ **Automatic Sanitization**: Trims, converts case, etc.
- ✅ **Detailed Error Messages**: Clear validation error descriptions
- ✅ **Schema Composition**: Easy to create complex validation rules
- ✅ **Performance**: Fast validation with minimal overhead
- ✅ **Maintainability**: Single source of truth for validation logic
