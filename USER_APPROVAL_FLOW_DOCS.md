# User Registration Approval Flow Documentation

## Overview

Fitur ini mengimplementasikan flow approval untuk registrasi user. Setiap end user yang mendaftar akan memiliki status `pending` dan harus di-approve oleh admin sebelum bisa login.

## Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   End User      │     │     Admin       │     │    System       │
│   Register      │────▶│   Dashboard     │────▶│   Send Email    │
│   (pending)     │     │   Approve/Reject│     │   to User       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Can      │◀────│   Account       │◀────│   User Click    │
│   Login         │     │   Activated     │     │   Email Link    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Approval Status

User memiliki 3 status approval:

- `pending` - Menunggu approval dari admin
- `approved` - Sudah di-approve dan sudah verifikasi email
- `rejected` - Ditolak oleh admin

## API Endpoints

### 1. User Registration (Public)

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+6281234567890",
  "address": {
    "street": "Jl. Contoh No. 123",
    "city": "Jakarta",
    "state": "DKI Jakarta",
    "zipCode": "12345",
    "country": "Indonesia"
  }
}
```

**Response (End User):**

```json
{
  "status": "success",
  "message": "Registration successful! Your account is pending approval. You will receive an email once approved.",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "approvalStatus": "pending",
      ...
    }
  }
}
```

### 2. Get Pending Users (Admin Only)

```
GET /api/user/pending
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name, email, or phone number

**Response:**

```json
{
  "status": "success",
  "message": "Pending users retrieved successfully",
  "data": {
    "users": [...],
    "metadata": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      ...
    },
    "pendingCount": 5
  }
}
```

### 3. Approve User (Admin Only)

```
PATCH /api/user/:id/approve
```

**Response:**

```json
{
  "status": "success",
  "message": "User approved successfully. Verification email has been sent.",
  "data": {
    "user": {...}
  }
}
```

**Side Effects:**

- Generate approval token (valid 24 hours)
- Send approval email to user with verification link

### 4. Reject User (Admin Only)

```
PATCH /api/user/:id/reject
```

**Request Body (Optional):**

```json
{
  "reason": "Alasan penolakan registrasi"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "User rejected successfully. Notification email has been sent.",
  "data": {
    "user": {...}
  }
}
```

**Side Effects:**

- Update user status to `rejected`
- Send rejection email to user

### 5. Verify Approval Token (Webhook/Public)

```
GET /api/auth/verify-approval/:token
```

**Description:**
Endpoint ini dipanggil ketika user klik link di email approval. Akan redirect ke frontend URL yang sudah dikonfigurasi.

**Success Redirect:**

```
{FRONTEND_URL}{APPROVAL_SUCCESS_REDIRECT_PATH}?verified=true
```

**Error Redirect:**

```
{FRONTEND_URL}{APPROVAL_ERROR_REDIRECT_PATH}?error=invalid_token
```

### 6. Login

```
POST /api/auth/login
```

**Additional Validation:**

- User dengan status `pending` akan mendapat error: "Your account is pending approval. Please wait for admin approval."
- User dengan status `rejected` akan mendapat error: "Your registration has been rejected. Please contact support for more information."

## Email Templates

### 1. Pending Approval Email

Dikirim ke user setelah registrasi. Memberitahu bahwa registrasi sedang diproses.

### 2. Approval Email

Dikirim setelah admin approve. Berisi link untuk aktivasi akun.

### 3. Rejection Email

Dikirim setelah admin reject. Berisi alasan penolakan (jika ada).

## Environment Variables

```env
# URLs Configuration
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Approval Redirect Paths
APPROVAL_SUCCESS_REDIRECT_PATH=/login
APPROVAL_ERROR_REDIRECT_PATH=/approval-error

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@plutokoi.com
SMTP_FROM_NAME=Pluto Koi
```

## Database Schema Changes

### User Model

New fields added:

```typescript
{
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  approvalToken: String | null,
  approvalTokenExpiry: Date | null,
  approvedAt: Date | null,
  approvedBy: String | null,  // Admin user ID
  rejectedAt: Date | null,
  rejectedBy: String | null,  // Admin user ID
  rejectionReason: String | null
}
```

## Notes

1. **Admin users** akan otomatis `approved` saat registrasi
2. **Approval token** valid selama 24 jam
3. **Email service** harus dikonfigurasi dengan benar di `.env`
4. Jika email gagal dikirim, approval/rejection tetap tersimpan tapi user tidak menerima notifikasi

## Testing

Untuk testing email tanpa SMTP server asli, bisa gunakan:

- [Mailtrap](https://mailtrap.io/) - Email testing service
- [Ethereal](https://ethereal.email/) - Fake SMTP service

Contoh konfigurasi Ethereal:

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-user
SMTP_PASS=your-ethereal-pass
```
