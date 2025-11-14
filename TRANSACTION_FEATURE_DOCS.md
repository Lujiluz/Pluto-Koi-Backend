# Transaction History Feature Documentation

## Overview

This feature allows users to purchase products with two different flows:

1. **Guest Purchase**: Users who are not logged in can purchase by providing their complete information
2. **User Purchase**: Logged-in users can purchase using their saved profile information

## Architecture

### Database Models

#### User Model Updates

- Added `phoneNumber` field to store user's phone number (required)
- Added `address` field to store user's complete address information:
  - `street`: String
  - `city`: String
  - `state`: String
  - `zipCode`: String
  - `country`: String

#### Transaction Model

Located: `src/models/transaction.model.ts`

**Key Fields:**

- `userId`: Reference to User (optional - null for guest purchases)
- `productId`: Reference to Product
- `productName`: Snapshot of product name at time of purchase
- `productPrice`: Snapshot of product price at time of purchase
- `quantity`: Number of items purchased
- `totalAmount`: Calculated total (price × quantity)
- `buyerInfo`: Complete buyer information
  - `name`: Buyer's name
  - `email`: Buyer's email
  - `phoneNumber`: Buyer's phone number
  - `address`: Complete address object
- `paymentProof`: URL to uploaded payment proof image
- `paymentStatus`: PENDING | VERIFIED | REJECTED
- `status`: PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REJECTED
- `adminNotes`: Optional notes from admin

**Indexes:**

- userId, productId, status, paymentStatus, createdAt, buyerInfo.email

### API Endpoints

#### Public Endpoints

1. **Create Guest Purchase**

   ```
   POST /api/transaction/guest-purchase
   Content-Type: multipart/form-data

   Body:
   - name: string (required)
   - email: string (required, valid email)
   - phoneNumber: string (required)
   - address: object (required)
     - street: string
     - city: string
     - state: string
     - zipCode: string
     - country: string
   - productId: string (required)
   - quantity: number (default: 1)
   - paymentProof: file (required, image)

   Response: 201 Created
   {
     "success": true,
     "message": "Transaction created successfully. Your purchase is pending confirmation.",
     "data": { transaction object }
   }
   ```

2. **Track Order by Email**

   ```
   POST /api/transaction/track
   Content-Type: application/json

   Body:
   {
     "email": "user@example.com"
   }

   Query Parameters:
   - page: number (default: 1)
   - limit: number (default: 10)

   Response: 200 OK
   {
     "success": true,
     "message": "Transactions retrieved successfully",
     "data": [transaction objects],
     "pagination": {
       "total": number,
       "page": number,
       "pages": number,
       "limit": number
     }
   }
   ```

#### Private Endpoints (Requires Authentication)

3. **Create User Purchase**

   ```
   POST /api/transaction/user-purchase
   Headers: Authorization: Bearer <token>
   Content-Type: multipart/form-data

   Body:
   - productId: string (required)
   - quantity: number (default: 1)
   - paymentProof: file (required, image)

   Response: 201 Created
   {
     "success": true,
     "message": "Transaction created successfully. Your purchase is pending confirmation.",
     "data": { transaction object }
   }

   Note: User must have complete address information in their profile
   ```

4. **Get My Transactions**

   ```
   GET /api/transaction/my-transactions
   Headers: Authorization: Bearer <token>

   Query Parameters:
   - page: number (default: 1)
   - limit: number (default: 10)

   Response: 200 OK
   {
     "success": true,
     "message": "Your transactions retrieved successfully",
     "data": [transaction objects],
     "metadata": {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
   }
   ```

5. **Get Transaction by ID**

   ```
   GET /api/transaction/:id
   Headers: Authorization: Bearer <token>

   Response: 200 OK
   {
     "success": true,
     "message": "Transaction retrieved successfully",
     "data": { transaction object }
   }

   Access: Owner or Admin only
   ```

#### Admin Endpoints (Requires Admin Role)

6. **Get All Transactions**

   ```
   GET /api/transaction
   Headers: Authorization: Bearer <token>

   Query Parameters:
   - status: TransactionStatus (optional)
   - paymentStatus: PaymentStatus (optional)
   - userId: string (optional)
   - productId: string (optional)
   - page: number (default: 1)
   - limit: number (default: 10, max: 100)

   Response: 200 OK
   {
     "success": true,
     "message": "Transactions retrieved successfully",
     "data": [transaction objects],
     "pagination": { ... }
   }
   ```

7. **Update Transaction Status**

   ```
   PATCH /api/transaction/:id
   Headers: Authorization: Bearer <token>
   Content-Type: application/json

   Body:
   {
     "status": "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "rejected",
     "paymentStatus": "pending" | "verified" | "rejected",
     "adminNotes": "Optional notes"
   }

   Note: At least one field must be provided

   Response: 200 OK
   {
     "success": true,
     "message": "Transaction updated successfully",
     "data": { updated transaction object }
   }
   ```

8. **Delete Transaction**

   ```
   DELETE /api/transaction/:id
   Headers: Authorization: Bearer <token>

   Response: 200 OK
   {
     "success": true,
     "message": "Transaction deleted successfully"
   }
   ```

9. **Get Transaction Statistics**

   ```
   GET /api/transaction/statistics/all
   Headers: Authorization: Bearer <token>

   Response: 200 OK
   {
     "success": true,
     "message": "Transaction statistics retrieved successfully",
     "data": {
       "total": number,
       "byStatus": {
         "pending": number,
         "confirmed": number,
         ...
       },
       "byPaymentStatus": {
         "pending": number,
         "verified": number,
         "rejected": number
       },
       "totalRevenue": number
     }
   }
   ```

## Purchase Flows

### Guest Purchase Flow

1. User fills out form with:
   - Name
   - Email
   - Phone number
   - Complete address (street, city, state, zipCode, country)
   - Selects product and quantity
   - Uploads payment proof image
2. System validates product availability
3. System calculates total amount
4. Transaction is created with status "pending"
5. User receives confirmation (can track with email)

### Logged-in User Purchase Flow

1. User must have complete address and phone number in profile (if not, update profile first)
2. User selects product and quantity
3. User uploads payment proof image
4. System retrieves user's name, email, phone number, and address from profile
5. System validates product availability
6. System calculates total amount
7. Transaction is created with status "pending"
8. User can view in "My Transactions"

## Transaction Status Workflow

### Payment Status

- **PENDING**: Payment proof uploaded, awaiting admin verification
- **VERIFIED**: Admin confirmed payment is valid
- **REJECTED**: Admin rejected payment proof

### Transaction Status

- **PENDING**: Transaction created, awaiting payment verification
- **CONFIRMED**: Payment verified, order confirmed
- **PROCESSING**: Order is being prepared
- **SHIPPED**: Order has been shipped
- **DELIVERED**: Order delivered to customer
- **CANCELLED**: Transaction cancelled (by user or admin)
- **REJECTED**: Transaction rejected (invalid payment, out of stock, etc.)

## File Upload

### Payment Proof

- **Location**: `public/media/transactions/`
- **Accepted formats**: JPEG, JPG, PNG, GIF, WebP
- **Max file size**: 10MB
- **Field name**: `paymentProof`
- **Storage format**: `{uuid}-{timestamp}.{extension}`

## Validation

All endpoints use Zod validation schemas for:

- Input sanitization
- Type checking
- Required field validation
- Email format validation
- Enum validation for status fields

## Security Features

1. **Authentication**: JWT-based authentication for user endpoints
2. **Authorization**:
   - Users can only view their own transactions
   - Admins can view and manage all transactions
3. **Role-based access control**: Admin-only endpoints protected
4. **Input validation**: All inputs validated and sanitized
5. **File upload restrictions**: File type and size limits enforced

## Error Handling

Common error responses:

- **400 Bad Request**: Validation errors, missing required fields
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Transaction/Product/User not found
- **500 Internal Server Error**: Server-side errors

## Usage Examples

### Example 1: Guest Purchase

```javascript
const formData = new FormData();
formData.append("name", "John Doe");
formData.append("email", "john@example.com");
formData.append("phoneNumber", "+1234567890");
formData.append("address[street]", "123 Main St");
formData.append("address[city]", "New York");
formData.append("address[state]", "NY");
formData.append("address[zipCode]", "10001");
formData.append("address[country]", "USA");
formData.append("productId", "507f1f77bcf86cd799439011");
formData.append("quantity", "2");
formData.append("paymentProof", fileInput.files[0]);

const response = await fetch("http://localhost:3000/api/transaction/guest-purchase", {
  method: "POST",
  body: formData,
});
```

### Example 2: Logged-in User Purchase

```javascript
const formData = new FormData();
formData.append("productId", "507f1f77bcf86cd799439011");
formData.append("quantity", "1");
formData.append("paymentProof", fileInput.files[0]);

const response = await fetch("http://localhost:3000/api/transaction/user-purchase", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${authToken}`,
  },
  body: formData,
});
```

### Example 3: Track Order by Email

```javascript
const response = await fetch("http://localhost:3000/api/transaction/track?page=1&limit=10", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "john@example.com",
  }),
});
```

### Example 4: Admin Update Status

```javascript
const response = await fetch("http://localhost:3000/api/transaction/507f1f77bcf86cd799439011", {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    status: "confirmed",
    paymentStatus: "verified",
    adminNotes: "Payment verified via bank statement",
  }),
});
```

## Database Queries Performance

Indexed fields for optimal query performance:

- Transaction lookup by ID: O(1)
- User transactions: Indexed on `userId`
- Email-based tracking: Indexed on `buyerInfo.email`
- Status filtering: Indexed on `status` and `paymentStatus`
- Recent transactions: Indexed on `createdAt` (descending)

## Future Enhancements

Potential improvements:

1. Email notifications for status updates
2. SMS notifications
3. Invoice generation (PDF)
4. Payment gateway integration
5. Inventory management integration
6. Shipping tracking integration
7. Return/refund management
8. Transaction history export (CSV/Excel)
9. Analytics dashboard
10. Multi-currency support

## Testing Recommendations

1. **Unit Tests**: Test all service methods
2. **Integration Tests**: Test API endpoints
3. **File Upload Tests**: Test payment proof uploads
4. **Validation Tests**: Test all validation schemas
5. **Authorization Tests**: Test role-based access
6. **Edge Cases**:
   - Missing address in user profile
   - Invalid product ID
   - Out of stock products
   - Large file uploads
   - Concurrent purchases

## Maintenance Notes

- Payment proof images should be backed up regularly
- Consider archiving old transactions (>1 year)
- Monitor storage usage for uploaded images
- Regular cleanup of orphaned payment proof images
- Review and optimize database indexes periodically
