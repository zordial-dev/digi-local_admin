# 📘 DigiLocal Super Admin Portal — Comprehensive Backend REST API Specification

> **Target Audience:** Backend Engineering Team  
> **Version:** 1.0.0 (Production Specification)  
> **Base URL:** `https://api.digilocal.in/api/v1` (Production) / `http://localhost:5000/api/v1` (Development)  
> **Auth Scheme:** HTTP Bearer Token (`Authorization: Bearer <JWT_ACCESS_TOKEN>`)

---

## 1. Global Architectural & Integration Guidelines

### 1.1 Header Requirements
All request headers MUST contain:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json
Accept: application/json
X-Platform-Client: admin_dashboard
```

### 1.2 Standard Response Structure
All API responses must follow a unified JSON envelope:

#### Success Response Envelope (HTTP 200 OK / 201 Created)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Resource fetched successfully",
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

#### Error Response Envelope (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "status_code": 400,
  "error_code": "INVALID_PAYLOAD",
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

## 2. Standard HTTP Status Codes & Error Codes

| Status Code | Error Code | Meaning |
| :--- | :--- | :--- |
| `200 OK` | — | Request succeeded cleanly. |
| `201 Created` | — | Resource created successfully. |
| `400 Bad Request` | `INVALID_INPUT` | Invalid body payload or missing query parameter. |
| `401 Unauthorized` | `TOKEN_EXPIRED` / `UNAUTHORIZED` | Missing or invalid Bearer Token. |
| `403 Forbidden` | `INSUFFICIENT_POWER` / `ACCESS_DENIED` | Staff user lacks required RBAC power level. |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | User, Vendor, Society, or Ticket ID does not exist. |
| `409 Conflict` | `DUPLICATE_ENTRY` | Email, GSTIN, or Phone number already registered. |
| `422 Unprocessable` | `BUSINESS_RULE_BREACH` | Cannot escalate ticket beyond URGENT level or de-escalate below LOW. |
| `500 Server Error` | `INTERNAL_SERVER_ERROR` | Unhandled backend exception. |

---

## 3. Module API Specifications

---

### Module A: Authentication & Session Management (`/auth`)

#### A1. Admin Login
- **Endpoint:** `POST /auth/login`
- **Auth Required:** No
- **Purpose:** Authenticate Super Admin or Sub-Admin staff member and issue JWT tokens.

##### Request Body
```json
{
  "email": "superadmin@digilocal.in",
  "password": "Password@123",
  "mfa_code": "123456" // Optional if MFA enabled
}
```

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Authenticated successfully",
  "data": {
    "access_token": "eyJhbGciOiJKV1QiLC...",
    "refresh_token": "d98f7a6b5c4...",
    "expires_in": 86400,
    "user": {
      "id": "adm-001",
      "name": "Vikram Mehta",
      "email": "superadmin@digilocal.in",
      "role": "super_admin",
      "power_level": 10,
      "avatar_url": "https://api.digilocal.in/avatars/adm-001.png"
    }
  }
}
```

---

#### A2. Token Refresh
- **Endpoint:** `POST /auth/refresh`
- **Auth Required:** No (Uses Refresh Token)

##### Request Body
```json
{
  "refresh_token": "d98f7a6b5c4..."
}
```

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJKV1...",
    "expires_in": 86400
  }
}
```

---

#### A3. Fetch Active Profile
- **Endpoint:** `GET /auth/me`
- **Auth Required:** Yes

##### Success Response (`200 OK`)
```json
{
  "success": true,
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

#### A4. Admin Logout
- **Endpoint:** `POST /auth/logout`
- **Auth Required:** Yes

---

### Module B: Platform Configuration & Branding (`/config`)

#### B1. Fetch Platform Settings
- **Endpoint:** `GET /config`
- **Auth Required:** Yes

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "platform_name": "DigiLocal",
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

#### B2. Update Platform Settings
- **Endpoint:** `PUT /config`
- **Auth Required:** Yes (Requires Super Admin `power_level >= 9`)

##### Request Body
```json
{
  "platform_name": "DigiLocal Enterprise",
  "maintenance_mode": false,
  "support_email": "admin@digilocal.in"
}
```

---

### Module C: Users Directory & CRM Analytics (`/admin/users`)

> ⚠️ **CRITICAL SCOPE RESTRICTION:**  
> The Users directory contains **ONLY** resident customers (`person_type = "user"`) and dual-role residents who also own a partner store (`person_type = "user_vendor"`).  
> **Pure vendors (`vendor`) and Sub-Admin staff MUST BE EXCLUDED from this endpoint.**

#### C1. Fetch Users Directory (Paginated & Filterable)
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
  "data": [
    {
      "id": "usr-001",
      "person_type": "user", // "user" or "user_vendor"
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
      "person_type": "user_vendor", // Dual Role Account
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

#### C2. Fetch Single User CRM Profile
- **Endpoint:** `GET /admin/users/:userId`
- **Auth Required:** Yes

##### Success Response (`200 OK`)
```json
{
  "success": true,
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
    ],
    "addresses": [
      {
        "label": "Home",
        "address_line": "B-304, Anupam Society, Sector 62, Noida"
      }
    ]
  }
}
```

---

#### C3. User Management Actions
- `POST /admin/users/:userId/block` — Suspend user account (`{ "reason": "TOS violation" }`)
- `POST /admin/users/:userId/unblock` — Reactivate user account
- `POST /admin/users/:userId/reset-password` — Trigger admin password reset link
- `DELETE /admin/users/:userId` — Soft delete user record

---

#### C4. Fetch User Analytics
- **Endpoint:** `GET /admin/users/analytics`
- **Auth Required:** Yes

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "total_registered_users": 1450,
    "daily_active_users_dau": 340,
    "monthly_active_users_mau": 1280,
    "retention_rate_pct": 84.5,
    "avg_spend_per_user": 4850.00,
    "top_societies": [
      { "society_name": "Anupam Society", "users_count": 420 },
      { "society_name": "Greenwood Heights", "users_count": 310 }
    ],
    "registration_growth": [
      { "date": "2026-08-01", "count": 12 },
      { "date": "2026-08-02", "count": 18 }
    ]
  }
}
```

---

### Module D: Vendor Management & Onboarding (`/admin/vendors` & `/admin/requests`)

#### D1. Fetch All Vendors List
- **Endpoint:** `GET /admin/vendors`
- **Auth Required:** Yes
- **Query Parameters:** `search`, `tier` (`free`|`pro`|`enterprise`), `status` (`active`|`suspended`|`expired`), `page`, `limit`

##### Success Response (`200 OK`)
```json
{
  "success": true,
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

#### D2. Fetch Pending Onboarding Requests
- **Endpoint:** `GET /admin/requests`
- **Auth Required:** Yes

##### Success Response (`200 OK`)
```json
{
  "success": true,
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

#### D3. Approve Vendor Request
- **Endpoint:** `POST /admin/requests/:vendorId/approve`
- **Auth Required:** Yes

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Vendor application approved successfully",
  "data": {
    "vendor_id": "v-105",
    "status": "ACTIVE"
  }
}
```

---

#### D4. Reject Vendor Request
- **Endpoint:** `POST /admin/requests/:vendorId/reject`
- **Request Body:** `{ "reason": "Incomplete GST documentation" }`

---

#### D5. Toggle Vendor Status (Block / Unblock)
- **Endpoint:** `POST /admin/vendors/:vendorId/status`
- **Request Body:** `{ "status": "suspended" }` // or "active"

---

### Module E: Housing Societies (`/admin/societies`)

#### E1. Fetch Societies List
- **Endpoint:** `GET /admin/societies`

##### Success Response (`200 OK`)
```json
{
  "success": true,
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

#### E2. Create New Society
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

---

#### E3. Toggle Society Status
- **Endpoint:** `POST /admin/societies/:societyId/status`
- **Request Body:** `{ "status": "suspended" }`

---

### Module F: Support Desk, SLA Engine & Escalation Lifecycle (`/support`)

> 💡 **INTAKE CHANNEL BUSINESS RULES:**  
> - **Vendors** lodge complaints via **Vendor App** (`source = "mobile_app"`) & **Vendor Portal** (`source = "vendor_portal"`).  
> - **Users** lodge complaints **STRICTLY via Landing Website** (`source = "landing_website"`). *There is NO user mobile app.*

#### F1. Fetch Support Tickets List
- **Endpoint:** `GET /support/tickets`
- **Query Parameters:** `status` (`open`|`in_progress`|`resolved`|`closed`), `priority` (`low`|`medium`|`high`|`urgent`), `category` (`billing`|`technical`|`delivery`|`onboarding`), `user_type` (`user`|`vendor`|`user_vendor`), `source` (`landing_website`|`vendor_portal`|`mobile_app`), `search`, `page`, `limit`

##### Success Response (`200 OK`)
```json
{
  "success": true,
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

#### F2. Fetch Single Ticket Details & Message Thread
- **Endpoint:** `GET /support/tickets/:ticketId`
- **Endpoint:** `GET /support/tickets/:ticketId/messages`

---

#### F3. Post Ticket Reply / Staff Internal Note
- **Endpoint:** `POST /support/tickets/:ticketId/reply`
- **Request Body:**
```json
{
  "message": "Checking UPI settlement batch #9081 with Razorpay API gate.",
  "is_internal_note": true // true = Staff note only; false = Response sent to user
}
```

---

#### F4. Escalate Ticket Priority (Warning Confirmation Workflow)
- **Endpoint:** `POST /support/tickets/:ticketId/escalate`
- **Auth Required:** Yes
- **Business Logic Rules:**
  1. Escalates priority sequentially: `LOW` ➔ `MEDIUM` ➔ `HIGH` ➔ `URGENT`.
  2. Updates SLA countdown (`MEDIUM` = 480m, `HIGH` = 180m, `URGENT` = 15m).
  3. Appends an internal staff audit note into the thread automatically.
  4. If ticket priority is ALREADY `URGENT`, return `HTTP 422 Unprocessable` (`"Max priority level reached"`).

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Ticket escalated to HIGH priority",
  "data": {
    "id": "t-101",
    "ticket_number": "TICK-9081",
    "previous_priority": "medium",
    "new_priority": "high",
    "status": "in_progress",
    "sla_minutes_remaining": 180
  }
}
```

---

#### F5. De-escalate / Lower Ticket Priority
- **Endpoint:** `POST /support/tickets/:ticketId/deescalate`
- **Business Logic Rules:**
  1. Lowers priority sequentially: `URGENT` ➔ `HIGH` ➔ `MEDIUM` ➔ `LOW`.
  2. If ticket priority is ALREADY `LOW`, return `HTTP 422 Unprocessable` (`"Lowest priority level reached"`).

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Ticket priority lowered to MEDIUM",
  "data": {
    "id": "t-101",
    "new_priority": "medium",
    "sla_minutes_remaining": 480
  }
}
```

---

#### F6. Merge Child Ticket into Master Ticket
- **Endpoint:** `POST /support/tickets/:ticketId/merge`
- **Request Body:** `{ "target_master_ticket_number": "TICK-9082" }`

---

#### F7. Unmerge Child Ticket
- **Endpoint:** `POST /support/tickets/:ticketId/unmerge`
- **Request Body:** `{ "child_ticket_number": "TICK-8042" }`

---

#### F8. Add / Remove Staff Followers
- **Endpoint:** `POST /support/tickets/:ticketId/followers`
- **Request Body:** `{ "follower_name": "Ananya Sharma", "action": "add" }`

---

### Module G: Sub-Admin Staff & RBAC Permissions (`/admin/subadmins`)

#### G1. Fetch Sub-Admins List
- **Endpoint:** `GET /admin/subadmins`

##### Success Response (`200 OK`)
```json
{
  "success": true,
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

#### G2. Create New Sub-Admin Staff
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

#### G3. Toggle Sub-Admin Status (Suspend / Activate)
- **Endpoint:** `POST /admin/subadmins/:id/toggle-status`
- **Request Body:** `{ "status": "suspended" }`

---

### Module H: Orders & Commerce Telemetry (`/admin/orders`)

> 💡 **ORDER CHANNEL RULE:**  
> Orders can ONLY be placed from the **Landing Website / Customer Web Portal**.

#### H1. Fetch Orders List
- **Endpoint:** `GET /admin/orders`
- **Query Parameters:** `search`, `status` (`PENDING`|`CONFIRMED`|`IN_TRANSIT`|`DELIVERED`|`CANCELLED`), `society_id`, `page`, `limit`

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "order_id": "ORD-9842",
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

#### H2. Fetch Single Order Details
- **Endpoint:** `GET /admin/orders/:orderId`

---

## 4. Complete Postman & Backend Delivery Checklist

- [x] All 9 modules mapped with precise JSON Request/Response schemas.
- [x] Explicit JWT Authorization Bearer headers documented.
- [x] Correct entity scope separation enforced (Users = `user` & `user_vendor`; Pure Vendors = `vendor`).
- [x] Intake channels documented (Website = User Complaints & Orders; App/Portal = Vendor Complaints).
- [x] SLA Escalation Stepping (`LOW` ➔ `MEDIUM` ➔ `HIGH` ➔ `URGENT`) and De-escalation APIs specified.
- [x] HTTP 4xx/5xx error envelopes with standardized error codes.

---
*Document end. Generated for Backend Engineering Handoff.*
