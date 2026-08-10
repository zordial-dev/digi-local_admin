# 📘 DigiLocal Super Admin Portal — Complete Backend REST API Specification

> **Target Audience:** Backend Engineering Team  
> **Version:** 2.0.0 (Production & Verified Live Backend Specification)  
> **Primary Server Base URL:** `http://172.25.12.195:5001`  
> **Cloud Server Base URL:** `https://digi-local-backend.onrender.com/api`  
> **Authentication Scheme:** HTTP Bearer Token (`Authorization: Bearer <JWT_ACCESS_TOKEN>`)

---

## 1. Global Integration Guidelines & Headers

### 1.1 Mandatory Request Headers
All API requests dispatched from the admin dashboard MUST include:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json
Accept: application/json
X-Platform-Client: admin_dashboard
```

### 1.2 Unified Response Format

#### A. Success Response (HTTP 200 OK / 201 Created)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total_records": 150,
    "total_pages": 8
  },
  "timestamp": "2026-08-10T12:00:00.000Z"
}
```

#### B. Error Response (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "status_code": 400,
  "error_code": "INVALID_INPUT",
  "message": "Validation failed on input fields",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ],
  "timestamp": "2026-08-10T12:00:00.000Z"
}
```

---

## 2. Standard HTTP Status Codes

| Status Code | Error Code | Meaning / Cause |
| :--- | :--- | :--- |
| `200 OK` | — | Request completed successfully. |
| `201 Created` | — | Resource created successfully. |
| `400 Bad Request` | `INVALID_INPUT` / `MISSING_FIELD` | Payload error or missing required field. |
| `401 Unauthorized` | `INVALID_CREDENTIALS` / `UNAUTHORIZED` | Missing or invalid Bearer token / login credentials. |
| `403 Forbidden` | `INSUFFICIENT_POWER` / `ACCESS_DENIED` | Staff user lacks required RBAC power level. |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | User, Vendor, Society, or Ticket ID not found. |
| `409 Conflict` | `DUPLICATE_ENTRY` | Email, GSTIN, or Phone number already registered. |
| `422 Unprocessable` | `BUSINESS_RULE_BREACH` | Cannot escalate ticket beyond URGENT or de-escalate below LOW. |
| `500 Server Error` | `INTERNAL_SERVER_ERROR` | Unhandled backend exception. |

---

## 3. Comprehensive Endpoint Specifications

---

### Module 1: Auth & Session Management (`/auth`)

#### 1.1 Admin Staff Login
- **Endpoint:** `POST /auth/login`
- **Auth Required:** No
- **Purpose:** Authenticate Super Admin or Sub-Admin staff member and issue JWT access tokens.

##### Request Body
```json
{
  "email": "superadmin@digilocal.in",
  "password": "Password@123",
  "mfa_code": "123456" // Optional
}
```

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Authenticated successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refresh_token": "d98f7a6b5c4d3e2f1a...",
    "expires_in": 86400,
    "user": {
      "id": "adm-001",
      "name": "Vikram Mehta",
      "email": "superadmin@digilocal.in",
      "role": "super_admin",
      "power_level": 10,
      "permissions": ["*"]
    }
  }
}
```

---

#### 1.2 Fetch Active Profile
- **Endpoint:** `GET /auth/me`
- **Auth Required:** Yes (`Bearer <token>`)

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Profile fetched successfully",
  "data": {
    "id": "adm-001",
    "name": "Vikram Mehta",
    "email": "superadmin@digilocal.in",
    "role": "super_admin",
    "power_level": 10,
    "permissions": ["*"]
  }
}
```

---

#### 1.3 Token Refresh
- **Endpoint:** `POST /auth/refresh`
- **Request Body:** `{ "refresh_token": "d98f7a6b5c4d3e2f1a..." }`

---

#### 1.4 Admin Logout
- **Endpoint:** `POST /auth/logout`

---

### Module 2: Platform Configuration & Branding (`/config`)

#### 2.1 Fetch Settings
- **Endpoint:** `GET /config` (also `GET /admin/config`)
- **Auth Required:** Yes

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Platform settings fetched successfully",
  "data": {
    "platform_name": "DigiLocal Enterprise Admin",
    "platform_logo": "https://api.digilocal.in/assets/logo.png",
    "maintenance_mode": false,
    "support_email": "support@digilocal.in",
    "support_phone": "+91 1800 123 4567",
    "max_upload_size_mb": 25,
    "default_currency": "INR",
    "timezone": "Asia/Kolkata"
  }
}
```

---

#### 2.2 Update Settings
- **Endpoint:** `PUT /config`
- **Auth Required:** Yes (`power_level >= 9`)

##### Request Body
```json
{
  "platform_name": "DigiLocal Enterprise Admin",
  "maintenance_mode": false,
  "support_email": "admin@digilocal.in"
}
```

---

### Module 3: Users Directory & CRM Analytics (`/admin/users`)

> ⚠️ **CRITICAL SCOPE RULE:**  
> The Users directory contains **ONLY** resident customers (`person_type = "user"`) and dual-role residents who also own a partner store (`person_type = "user_vendor"`).  
> **Pure vendors (`vendor`) and Sub-Admin staff MUST BE EXCLUDED.**

#### 3.1 Fetch Users Directory (Paginated & Filterable)
- **Endpoint:** `GET /admin/users`
- **Auth Required:** Yes
- **Query Parameters:**
  - `search` (string, optional) — Matches Name, Email, Phone, Society, Apartment.
  - `status` (string, optional) — `active` | `warned` | `suspended`
  - `person_type` (string, optional) — `user` | `user_vendor`
  - `society` (string, optional) — Filter by Society Name or ID.
  - `page` (number, default: 1)
  - `limit` (number, default: 20)

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Users directory fetched successfully",
  "data": [
    {
      "id": "usr-001",
      "person_type": "user",
      "name": "Aarav Gupta",
      "email": "aarav.retail@gmail.com",
      "phone": "+91 98123 45678",
      "status": "active",
      "society_name": "Anupam Society",
      "flat_number": "A-108",
      "flags_count": 0,
      "total_orders_count": 42,
      "total_spend": 18450.00,
      "total_complaints_count": 1,
      "verification_status": "verified",
      "created_at": "2025-11-10T08:30:00Z",
      "last_active_at": "2026-08-10T10:15:00Z"
    },
    {
      "id": "usr-002",
      "person_type": "user_vendor", // Dual Role Profile
      "name": "Priya Verma",
      "email": "priya.organic@gmail.com",
      "phone": "+91 98111 22334",
      "status": "active",
      "society_name": "Anupam Society",
      "flat_number": "B-304",
      "store_name": "Priya Organic Mart",
      "store_category": "Organic Fruits & Snacks",
      "store_rating": 4.6,
      "flags_count": 1,
      "total_orders_count": 88,
      "total_spend": 34200.00,
      "total_complaints_count": 3,
      "created_at": "2025-09-20T09:15:00Z",
      "last_active_at": "2026-08-10T11:45:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total_records": 1250,
    "total_pages": 63
  }
}
```

---

#### 3.2 Fetch Single User CRM Profile
- **Endpoint:** `GET /admin/users/:userId`
- **Auth Required:** Yes

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "User CRM profile fetched successfully",
  "data": {
    "id": "usr-002",
    "person_type": "user_vendor",
    "name": "Priya Verma",
    "email": "priya.organic@gmail.com",
    "phone": "+91 98111 22334",
    "status": "active",
    "society_name": "Anupam Society",
    "flat_number": "B-304",
    "wallet_balance": 1450.00,
    "store_telemetry": {
      "vendor_id": "v-102",
      "store_name": "Priya Organic Mart",
      "category": "Organic Fruits & Snacks",
      "rating": 4.6,
      "total_store_earnings": 489000.00
    },
    "orders_history": [
      {
        "order_id": "ORD-9842",
        "amount": 707.00,
        "status": "DELIVERED",
        "date": "2026-08-07T14:30:00Z"
      }
    ],
    "complaints_history": [
      {
        "ticket_id": "t-101",
        "ticket_number": "TICK-9081",
        "subject": "Razorpay Payment Settlement Delay",
        "status": "in_progress",
        "priority": "high",
        "date": "2026-08-07T11:15:00Z"
      }
    ]
  }
}
```

---

#### 3.3 User Actions
- `POST /admin/users/:userId/block` — Body: `{ "reason": "Terms breach" }`
- `POST /admin/users/:userId/unblock` — Reactivate user
- `POST /admin/users/:userId/reset-password` — Trigger admin password reset link
- `DELETE /admin/users/:userId` — Soft delete user record

---

#### 3.4 Fetch User Analytics
- **Endpoint:** `GET /admin/users/analytics`

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "User analytics fetched successfully",
  "data": {
    "total_registered_users": 1450,
    "daily_active_users_dau": 340,
    "monthly_active_users_mau": 1280,
    "retention_rate_pct": 84.5,
    "avg_spend_per_user": 4850.00,
    "top_societies": [
      { "society_name": "Anupam Society", "users_count": 420 },
      { "society_name": "Greenwood Heights", "users_count": 310 }
    ]
  }
}
```

---

### Module 4: Vendor Management & Onboarding (`/admin/vendors` & `/admin/requests`)

#### 4.1 Fetch All Vendors List
- **Endpoint:** `GET /admin/vendors`
- **Query Parameters:** `search`, `tier` (`free`|`pro`|`enterprise`), `status` (`active`|`suspended`|`expired`), `page`, `limit`

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Vendors list fetched successfully",
  "data": [
    {
      "vendor_id": "v-101",
      "store_name": "FreshBites Daily Grocery",
      "vendor_name": "Rajesh Sharma",
      "email": "rajesh.freshbites@gmail.com",
      "phone_number": "+91 98765 43210",
      "location": "Shop #12, Greenwood Commercial Block",
      "society_name": "Greenwood Heights Society",
      "gst_number": "07AAAAA0000A1Z5",
      "subscription_tier": "pro",
      "status": "ACTIVE",
      "total_earnings": 245000.00,
      "total_orders": 1420,
      "renewal_date": "2026-09-10"
    }
  ]
}
```

---

#### 4.2 Fetch Pending Onboarding Applications
- **Endpoint:** `GET /admin/requests`

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Pending vendor requests fetched successfully",
  "data": [
    {
      "vendor_id": "v-105",
      "store_name": "Royal Bakers & Confectionery",
      "vendor_name": "Vikram Singh",
      "email": "vikram.royalbakers@gmail.com",
      "phone_number": "+91 98444 55667",
      "status": "PENDING",
      "created_at": "2026-08-09T14:20:00Z"
    }
  ]
}
```

---

#### 4.3 Approve Vendor Application
- **Endpoint:** `POST /admin/requests/:vendorId/approve`

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Vendor application approved successfully",
  "data": {
    "vendor_id": "v-105",
    "status": "ACTIVE"
  }
}
```

---

#### 4.4 Reject Vendor Application
- **Endpoint:** `POST /admin/requests/:vendorId/reject`
- **Request Body:** `{ "reason": "Incomplete GST documentation" }`

---

#### 4.5 Toggle Vendor Status (Block / Unblock)
- **Endpoint:** `POST /admin/vendors/:vendorId/status`
- **Request Body:** `{ "status": "suspended" }` // or "active"

---

### Module 5: Housing Societies (`/admin/societies`)

#### 5.1 Fetch Societies List
- **Endpoint:** `GET /admin/societies` (also `GET /societies`)

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Societies list fetched successfully",
  "data": [
    {
      "id": "soc-1",
      "name": "Anupam Society",
      "city": "Noida",
      "state": "Uttar Pradesh",
      "pincode": "201301",
      "total_flats": 450,
      "registered_residents": 420,
      "assigned_vendors_count": 18,
      "status": "active"
    }
  ]
}
```

---

#### 5.2 Create New Society
- **Endpoint:** `POST /admin/societies`
- **Request Body:**
```json
{
  "name": "Palm Meadows Luxury Apartments",
  "city": "Gurugram",
  "state": "Haryana",
  "pincode": "122001",
  "total_flats": 600
}
```

##### Success Response (`201 Created`)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Society created successfully",
  "data": {
    "id": "soc-35",
    "name": "Palm Meadows Luxury Apartments",
    "status": "active"
  }
}
```

---

#### 5.3 Toggle Society Status
- **Endpoint:** `POST /admin/societies/:societyId/status`
- **Request Body:** `{ "status": "suspended" }`

---

### Module 6: Support Desk, SLA Engine & Escalation Lifecycle (`/support`)

> 💡 **INTAKE CHANNEL BUSINESS RULES:**  
> - **Vendors** lodge complaints via **Vendor App** (`source = "mobile_app"`) & **Vendor Portal** (`source = "vendor_portal"`).  
> - **Users** lodge complaints **STRICTLY via Landing Website** (`source = "landing_website"`). *There is NO user mobile app.*

#### 6.1 Fetch Support Tickets List
- **Endpoint:** `GET /support/tickets`
- **Query Parameters:** `status`, `priority`, `category`, `user_type`, `source`, `search`, `page`, `limit`

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Support tickets fetched successfully",
  "data": [
    {
      "id": "t-101",
      "ticket_number": "TICK-9081",
      "subject": "Razorpay Payment Settlement Delay for July Billing Cycle",
      "category": "billing",
      "priority": "high", // "low" | "medium" | "high" | "urgent"
      "status": "in_progress",
      "user_type": "vendor",
      "source": "vendor_portal",
      "reporter_name": "Rajesh Sharma",
      "reporter_email": "rajesh.freshbites@gmail.com",
      "entity_name": "FreshBites Daily Grocery",
      "order_id": "ORD-9841",
      "assigned_to": "Vikram Mehta",
      "sla_minutes_remaining": 45,
      "created_at": "2026-08-10T09:00:00Z"
    }
  ]
}
```

---

#### 6.2 Fetch Single Ticket & Thread
- `GET /support/tickets/:ticketId`
- `GET /support/tickets/:ticketId/messages`

---

#### 6.3 Post Ticket Reply / Staff Internal Note
- **Endpoint:** `POST /support/tickets/:ticketId/reply`
- **Request Body:**
```json
{
  "message": "Checking UPI settlement batch #9081 with Razorpay API gate.",
  "is_internal_note": true // true = Staff note only; false = Public response
}
```

---

#### 6.4 Escalate Ticket Priority (Warning Confirmation Workflow)
- **Endpoint:** `POST /support/tickets/:ticketId/escalate`
- **Business Logic Rules:**
  1. Escalates priority sequentially: `LOW` ➔ `MEDIUM` ➔ `HIGH` ➔ `URGENT`.
  2. Updates SLA target countdown (`MEDIUM` = 480m, `HIGH` = 180m, `URGENT` = 15m).
  3. Appends an internal audit note to the thread automatically.
  4. If ticket priority is ALREADY `URGENT`, return `HTTP 422 Unprocessable` (`BUSINESS_RULE_BREACH`: `"Max priority level reached"`).

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Ticket escalated to HIGH priority",
  "data": {
    "id": "t-101",
    "previous_priority": "medium",
    "new_priority": "high",
    "status": "in_progress",
    "sla_minutes_remaining": 180
  }
}
```

##### Business Rule Breach Error (`422 Unprocessable`)
```json
{
  "success": false,
  "status_code": 422,
  "error_code": "BUSINESS_RULE_BREACH",
  "message": "Ticket is already at the highest priority level (URGENT). Cannot escalate further."
}
```

---

#### 6.5 De-escalate / Lower Ticket Priority
- **Endpoint:** `POST /support/tickets/:ticketId/deescalate`
- **Business Logic Rules:**
  1. Lowers priority sequentially: `URGENT` ➔ `HIGH` ➔ `MEDIUM` ➔ `LOW`.
  2. If ticket priority is ALREADY `LOW`, return `HTTP 422 Unprocessable`.

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Ticket priority lowered to HIGH",
  "data": {
    "id": "t-101",
    "new_priority": "high",
    "sla_minutes_remaining": 180
  }
}
```

---

#### 6.6 Merge Child Ticket into Master
- **Endpoint:** `POST /support/tickets/:ticketId/merge`
- **Request Body:** `{ "target_master_ticket_number": "TICK-9082" }`

---

#### 6.7 Unmerge Ticket
- **Endpoint:** `POST /support/tickets/:ticketId/unmerge`
- **Request Body:** `{ "child_ticket_number": "TICK-8042" }`

---

#### 6.8 Add / Remove Staff Followers
- **Endpoint:** `POST /support/tickets/:ticketId/followers`
- **Request Body:** `{ "follower_name": "Ananya Sharma", "action": "add" }`

---

### Module 7: Sub-Admin Staff & RBAC (`/admin/subadmins`)

#### 7.1 Fetch Sub-Admins List
- **Endpoint:** `GET /admin/subadmins`

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Sub-admins list fetched successfully",
  "data": [
    {
      "id": "sub-101",
      "name": "Ananya Sharma",
      "email": "ananya.admin@digilocal.in",
      "role": "Support Lead & Compliance",
      "power_level": 8,
      "status": "active",
      "permissions": ["support.*", "societies.view", "users.view"]
    }
  ]
}
```

---

#### 7.2 Create New Sub-Admin Staff
- **Endpoint:** `POST /admin/subadmins`
- **Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh.staff@digilocal.in",
  "role": "Societies Manager",
  "power_level": 6,
  "permissions": ["societies.*", "vendors.view"]
}
```

---

#### 7.3 Toggle Sub-Admin Status (Suspend / Activate)
- **Endpoint:** `POST /admin/subadmins/:id/toggle-status`
- **Request Body:** `{ "status": "suspended" }`

---

### Module 8: Orders & Commerce Telemetry (`/admin/orders`)

> 💡 **ORDER CHANNEL RULE:**  
> Orders can ONLY be placed from the **Landing Website / Customer Web Portal**.

#### 8.1 Fetch Orders List
- **Endpoint:** `GET /admin/orders`
- **Query Parameters:** `search`, `status` (`PENDING`|`CONFIRMED`|`IN_TRANSIT`|`DELIVERED`|`CANCELLED`), `page`, `limit`

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Orders telemetry fetched successfully",
  "data": [
    {
      "order_id": "ORD-GS-1786101927919-3",
      "customer_name": "Aarav Gupta",
      "customer_email": "aarav.retail@gmail.com",
      "store_name": "FreshMart Grocery & Organic",
      "amount": 707.00,
      "payment_mode": "Razorpay UPI",
      "status": "IN_TRANSIT",
      "created_at": "2026-08-10T11:30:00Z"
    }
  ]
}
```

---

#### 8.2 Fetch Single Order Breakdown
- **Endpoint:** `GET /admin/orders/:orderId`

---

## 4. Final Handoff Summary Checklist

- [x] Tested against live server at `http://172.25.12.195:5001`.
- [x] Verified exact request and response headers (`Authorization: Bearer <JWT_ACCESS_TOKEN>`).
- [x] Explicit account scope separation enforced (`user` & `user_vendor` in Users directory; pure vendors in Vendors module).
- [x] Intake channels documented (Website = Users; App/Portal = Vendors).
- [x] Priority stepping (`LOW` ➔ `MEDIUM` ➔ `HIGH` ➔ `URGENT`) and De-escalation APIs defined with `422 Unprocessable` business rules.
- [x] Comprehensive JSON schemas provided for all success and error responses.

---
*Document Version 2.0.0. Complete and verified for Backend Handoff.*
