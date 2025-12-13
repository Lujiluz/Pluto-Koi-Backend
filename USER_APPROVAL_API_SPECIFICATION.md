# User Registration Approval - API Specification

## Overview

API specification untuk fitur approval registrasi user. Dokumen ini ditujukan sebagai acuan untuk frontend developer.

**Base URL:** `{BACKEND_URL}/api`

---

## Authentication

Beberapa endpoint memerlukan authentication via JWT Bearer Token.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Register User

Mendaftarkan user baru. End user akan mendapat status `pending` dan harus menunggu approval admin.

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```typescript
interface RegisterRequest {
  name: string; // min: 2, max: 50 chars
  email: string; // valid email format
  password: string; // min: 6, max: 128 chars
  phoneNumber: string; // valid phone format (digits, spaces, +, -, (), allowed)
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}
```

**Example Request:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "phoneNumber": "+6281234567890",
  "address": {
    "street": "Jl. Sudirman No. 123",
    "city": "Jakarta",
    "state": "DKI Jakarta",
    "zipCode": "12190",
    "country": "Indonesia"
  }
}
```

**Success Response (201):**

```typescript
interface RegisterResponse {
  status: "success";
  message: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      phoneNumber: string;
      role: "endUser";
      status: "active";
      approvalStatus: "pending";
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      createdAt: string;
      updatedAt: string;
    };
    // Note: token is NOT provided for pending users
  };
}
```

**Example Success Response:**

```json
{
  "status": "success",
  "message": "Registration successful! Your account is pending approval. You will receive an email once approved.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+6281234567890",
      "role": "endUser",
      "status": "active",
      "approvalStatus": "pending",
      "address": {
        "street": "Jl. Sudirman No. 123",
        "city": "Jakarta",
        "state": "DKI Jakarta",
        "zipCode": "12190",
        "country": "Indonesia"
      },
      "createdAt": "2025-12-12T10:30:00.000Z",
      "updatedAt": "2025-12-12T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status | Condition            | Response                                                                  |
| ------ | -------------------- | ------------------------------------------------------------------------- |
| 400    | Email already exists | `{ "status": "error", "message": "User with this email already exists" }` |
| 400    | Validation error     | `{ "success": false, "message": "Validation failed", "errors": [...] }`   |

---

### 2. Login

Login user. Hanya user dengan `approvalStatus: "approved"` yang bisa login.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**

```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Example Request:**

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**

```typescript
interface LoginResponse {
  status: "success";
  message: "Login successful";
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      phoneNumber: string;
      role: string;
      status: string;
      approvalStatus: "approved";
      // ... other fields
    };
    token: string; // JWT token
  };
}
```

**Error Responses:**

| Status | Condition           | Response                                                                                                                |
| ------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 401    | Invalid credentials | `{ "status": "error", "message": "Invalid email or password" }`                                                         |
| 403    | Account pending     | `{ "status": "error", "message": "Your account is pending approval. Please wait for admin approval." }`                 |
| 403    | Account rejected    | `{ "status": "error", "message": "Your registration has been rejected. Please contact support for more information." }` |
| 403    | Account banned      | `{ "status": "error", "message": "Your account has been blocked. Please contact support." }`                            |
| 403    | Account deleted     | `{ "status": "error", "message": "This account has been deleted" }`                                                     |

---

### 3. Get All Users (Admin)

Mendapatkan daftar semua user dengan berbagai filter termasuk approval status.

**Endpoint:** `GET /user`

**Access:** Private (Admin only)

**Request Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max: 100) |
| status | string | - | Filter by status: `active`, `inactive`, `banned` |
| approvalStatus | string | - | Filter by approval status: `pending`, `approved`, `rejected` |
| search | string | - | Search by name, email, or phone |

**Example Requests:**

```
# Get all users
GET /api/user?page=1&limit=10

# Get only pending users (waiting for approval)
GET /api/user?approvalStatus=pending

# Get approved users only
GET /api/user?approvalStatus=approved

# Get banned users
GET /api/user?status=banned

# Combine filters
GET /api/user?approvalStatus=approved&status=active&search=john
```

**Success Response (200):**

```typescript
interface GetUsersResponse {
  status: "success";
  message: "Users retrieved successfully";
  data: {
    statistics: {
      totalUsers: number;
      totalUsersTrend: number;
      totalDeletedUsers: number;
      totalDeletedUsersTrend: number;
      totalBlockedUsers: number;
      totalBlockedUsersTrend: number;
    };
    users: Array<{
      _id: string;
      name: string;
      email: string;
      phoneNumber: string;
      role: string;
      status: "active" | "inactive" | "banned";
      approvalStatus: "pending" | "approved" | "rejected";
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      createdAt: string;
    }>;
    metadata: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}
```

**Example Response:**

```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": {
    "statistics": {
      "totalUsers": 150,
      "totalUsersTrend": 5.2,
      "totalDeletedUsers": 10,
      "totalDeletedUsersTrend": 0,
      "totalBlockedUsers": 3,
      "totalBlockedUsersTrend": -2.5
    },
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+6281234567890",
        "role": "endUser",
        "status": "active",
        "approvalStatus": "pending",
        "address": {
          "street": "Jl. Sudirman No. 123",
          "city": "Jakarta",
          "state": "DKI Jakarta",
          "zipCode": "12190",
          "country": "Indonesia"
        },
        "createdAt": "2025-12-12T10:30:00.000Z"
      }
    ],
    "metadata": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 150,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 4. Approve User (Admin)

Approve registrasi user. Akan mengirim email ke user dengan link verifikasi.

**Endpoint:** `PATCH /user/:id/approve`

**Access:** Private (Admin only)

**Request Headers:**

```
Authorization: Bearer <admin_token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID (MongoDB ObjectId) |

**Example Request:**

```
PATCH /api/user/507f1f77bcf86cd799439011/approve
```

**Success Response (200):**

```typescript
interface ApproveUserResponse {
  status: "success";
  message: "User approved successfully. Verification email has been sent.";
  data: {
    _id: string;
    name: string;
    email: string;
    approvalStatus: "pending"; // Still pending until user clicks email link
    approvalToken: string;
    approvalTokenExpiry: string;
    approvedAt: string;
    approvedBy: string;
    // ... other user fields
  };
}
```

**Error Responses:**

| Status | Condition                      | Response                                                       |
| ------ | ------------------------------ | -------------------------------------------------------------- |
| 400    | User already approved/rejected | `{ "status": "error", "message": "User is already approved" }` |
| 404    | User not found                 | `{ "status": "error", "message": "User not found" }`           |

---

### 5. Reject User (Admin)

Reject registrasi user. Akan mengirim email notifikasi ke user.

**Endpoint:** `PATCH /user/:id/reject`

**Access:** Private (Admin only)

**Request Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID (MongoDB ObjectId) |

**Request Body (Optional):**

```typescript
interface RejectUserRequest {
  reason?: string; // max: 500 chars
}
```

**Example Request:**

```json
{
  "reason": "Incomplete documentation provided. Please re-register with valid information."
}
```

**Success Response (200):**

```typescript
interface RejectUserResponse {
  status: "success";
  message: "User rejected successfully. Notification email has been sent.";
  data: {
    _id: string;
    name: string;
    email: string;
    approvalStatus: "rejected";
    rejectedAt: string;
    rejectedBy: string;
    rejectionReason: string | null;
    // ... other user fields
  };
}
```

**Error Responses:**

| Status | Condition                      | Response                                                       |
| ------ | ------------------------------ | -------------------------------------------------------------- |
| 400    | User already approved/rejected | `{ "status": "error", "message": "User is already rejected" }` |
| 404    | User not found                 | `{ "status": "error", "message": "User not found" }`           |

---

### 6. Verify Approval Token (Email Webhook)

Endpoint yang dipanggil ketika user klik link verifikasi di email. **Ini bukan API call biasa, melainkan redirect endpoint.**

**Endpoint:** `GET /auth/verify-approval/:token`

**Access:** Public

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| token | string | Approval token dari email |

**Behavior:**

Endpoint ini akan **redirect** browser ke frontend URL:

| Condition             | Redirect URL                                              |
| --------------------- | --------------------------------------------------------- |
| Success               | `{FRONTEND_URL}/login?verified=true`                      |
| Invalid/Expired Token | `{FRONTEND_URL}/approval-error?error=invalid_token`       |
| Verification Failed   | `{FRONTEND_URL}/approval-error?error=verification_failed` |
| Missing Token         | `{FRONTEND_URL}/approval-error?error=missing_token`       |

> **Note:** Redirect paths dapat dikonfigurasi via environment variables `APPROVAL_SUCCESS_REDIRECT_PATH` dan `APPROVAL_ERROR_REDIRECT_PATH`

---

## Approval Status Enum

```typescript
enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}
```

---

## Email Notifications

Sistem akan mengirim email pada kondisi berikut:

| Event          | Recipient | Email Content                                      |
| -------------- | --------- | -------------------------------------------------- |
| User registers | User      | Notification bahwa registrasi pending approval     |
| Admin approves | User      | Link verifikasi untuk aktivasi akun (valid 24 jam) |
| Admin rejects  | User      | Notification penolakan beserta alasan (jika ada)   |

---

## Next.js Frontend Implementation Guide

### 1. Setup API Client

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: unknown) => apiRequest<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
};
```

### 2. Auth Service

```typescript
// services/auth.service.ts
import { api } from "@/lib/api";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  approvalStatus: "pending" | "approved" | "rejected";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: User;
  token?: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    return api.post<AuthResponse>("/auth/register", data);
  },

  login: async (data: LoginData) => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};
```

### 3. User Management Service (Admin)

```typescript
// services/user.service.ts
import { api } from "@/lib/api";

interface PendingUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  approvalStatus: "pending";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
}

interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UserStatistics {
  totalUsers: number;
  totalUsersTrend: number;
  totalDeletedUsers: number;
  totalDeletedUsersTrend: number;
  totalBlockedUsers: number;
  totalBlockedUsersTrend: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: "active" | "inactive" | "banned";
  approvalStatus: "pending" | "approved" | "rejected";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
}

interface GetUsersResponse {
  statistics: UserStatistics;
  users: User[];
  metadata: PaginationMetadata;
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "banned";
  approvalStatus?: "pending" | "approved" | "rejected";
  search?: string;
}

export const userService = {
  /**
   * Get all users with optional filters
   * Use approvalStatus='pending' to get pending users for approval
   */
  getUsers: async (params: GetUsersParams = {}) => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.status) searchParams.append("status", params.status);
    if (params.approvalStatus) searchParams.append("approvalStatus", params.approvalStatus);
    if (params.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    return api.get<GetUsersResponse>(`/user${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Shortcut to get only pending users
   */
  getPendingUsers: async (page = 1, limit = 10, search?: string) => {
    return userService.getUsers({ page, limit, approvalStatus: "pending", search });
  },

  approveUser: async (userId: string) => {
    return api.patch(`/user/${userId}/approve`);
  },

  rejectUser: async (userId: string, reason?: string) => {
    return api.patch(`/user/${userId}/reject`, reason ? { reason } : undefined);
  },
};
```

### 4. Registration Page Component

```tsx
// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.register(formData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-bold text-green-800 mb-2">Registration Successful! 🎉</h2>
        <p className="text-green-700">Your account is pending approval. You will receive an email once your account has been approved by our admin team.</p>
        <p className="text-sm text-green-600 mt-4">This usually takes 1-2 business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Form fields here */}
      <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded mb-3" required />

      <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border rounded mb-3" required />

      <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 border rounded mb-3" required minLength={6} />

      <input type="tel" placeholder="Phone Number" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full p-2 border rounded mb-3" required />

      <h3 className="font-semibold mt-4 mb-2">Address</h3>

      <input
        type="text"
        placeholder="Street"
        value={formData.address.street}
        onChange={(e) =>
          setFormData({
            ...formData,
            address: { ...formData.address, street: e.target.value },
          })
        }
        className="w-full p-2 border rounded mb-3"
        required
      />

      {/* Add other address fields similarly */}

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded font-semibold disabled:opacity-50">
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
```

### 5. Login Page with Approval Status Handling

```tsx
// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check if user just verified their account
    if (searchParams.get("verified") === "true") {
      setVerified(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.login(formData);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";

      // Handle specific approval-related errors
      if (message.includes("pending approval")) {
        setError("Your account is still pending approval. Please wait for admin approval.");
      } else if (message.includes("rejected")) {
        setError("Your registration was rejected. Please contact support.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      {verified && <div className="bg-green-50 text-green-700 p-3 rounded mb-4">✅ Your account has been verified! You can now login.</div>}

      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border rounded mb-3" required />

        <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 border rounded mb-3" required />

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded font-semibold disabled:opacity-50">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
```

### 6. Approval Error Page

```tsx
// app/approval-error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  invalid_token: "The verification link is invalid or has expired. Please contact support.",
  verification_failed: "Account verification failed. Please try again or contact support.",
  missing_token: "Invalid verification link. Please check your email for the correct link.",
};

export default function ApprovalErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "unknown";
  const message = errorMessages[error] || "An unknown error occurred.";

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg">
      <h1 className="text-xl font-bold text-red-800 mb-2">Verification Failed ❌</h1>
      <p className="text-red-700 mb-4">{message}</p>

      <div className="space-y-2">
        <Link href="/login" className="block text-center bg-blue-600 text-white p-2 rounded">
          Go to Login
        </Link>
        <Link href="/contact" className="block text-center bg-gray-200 text-gray-700 p-2 rounded">
          Contact Support
        </Link>
      </div>
    </div>
  );
}
```

### 7. Admin Pending Users Dashboard

```tsx
// app/admin/pending-users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services/user.service";

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  approvalStatus: "pending" | "approved" | "rejected";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
}

export default function PendingUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      // Use getUsers with approvalStatus filter instead of separate endpoint
      const response = await userService.getUsers({
        page,
        limit: 10,
        approvalStatus: "pending",
        search: search || undefined,
      });
      setUsers(response.data?.users || []);
      setTotalItems(response.data?.metadata.totalItems || 0);
    } catch (error) {
      console.error("Failed to fetch pending users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, [page, search]);

  const handleApprove = async (userId: string) => {
    if (!confirm("Are you sure you want to approve this user?")) return;

    setActionLoading(userId);
    try {
      await userService.approveUser(userId);
      // Remove from list after approval
      setUsers(users.filter((u) => u._id !== userId));
      setTotalItems((prev) => prev - 1);
      alert("User approved successfully! Verification email has been sent.");
    } catch (error) {
      alert("Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.userId) return;

    setActionLoading(rejectModal.userId);
    try {
      await userService.rejectUser(rejectModal.userId, rejectReason || undefined);
      // Remove from list after rejection
      setUsers(users.filter((u) => u._id !== rejectModal.userId));
      setTotalItems((prev) => prev - 1);
      setRejectModal({ open: false, userId: null });
      setRejectReason("");
      alert("User rejected successfully!");
    } catch (error) {
      alert("Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Pending Approvals
          <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">{totalItems}</span>
        </h1>

        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="p-2 border rounded w-64" />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No pending users found</div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-gray-500 text-sm">{user.phoneNumber}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {user.address.street}, {user.address.city}, {user.address.state}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleApprove(user._id)} disabled={actionLoading === user._id} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                    {actionLoading === user._id ? "..." : "Approve"}
                  </button>
                  <button onClick={() => setRejectModal({ open: true, userId: user._id })} disabled={actionLoading === user._id} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject User</h2>
            <textarea placeholder="Reason for rejection (optional)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full p-2 border rounded mb-4 h-24" maxLength={500} />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setRejectModal({ open: false, userId: null });
                  setRejectReason("");
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading !== null} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 8. Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Error Codes Reference

| HTTP Status | Error Type   | Common Causes                                             |
| ----------- | ------------ | --------------------------------------------------------- |
| 400         | Bad Request  | Validation errors, invalid input                          |
| 401         | Unauthorized | Invalid credentials, missing/invalid token                |
| 403         | Forbidden    | Account pending/rejected/banned, insufficient permissions |
| 404         | Not Found    | User not found                                            |
| 500         | Server Error | Internal server error                                     |

---

## Notes

1. **Token Expiry:** Approval token di email valid selama 24 jam
2. **Email Delivery:** Pastikan backend SMTP sudah dikonfigurasi
3. **Admin Detection:** Gunakan `role === 'admin'` untuk menentukan akses admin
4. **Real-time Updates:** Consider implementing WebSocket untuk notifikasi real-time pending users
