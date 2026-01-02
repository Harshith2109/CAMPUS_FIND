# CampusFind API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Token).

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "department": "Computer Science",
  "role": "user"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "9876543210",
    "department": "Computer Science"
  }
}
```

### Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Get Profile
**GET** `/auth/profile`

Get current user's profile.

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "9876543210",
    "department": "Computer Science",
    "createdAt": "2025-12-29T08:00:00.000Z"
  }
}
```

### Update Profile
**PUT** `/auth/profile`

Update user profile information.

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9999999999",
  "department": "Electronics"
}
```

**Response:** `200 OK`

---

## Item Endpoints

### Get All Items
**GET** `/items`

Get list of items with optional filters.

**Query Parameters:**
- `type` - Filter by type (lost/found)
- `category` - Filter by category
- `status` - Filter by status (active/claimed/returned/archived)
- `search` - Text search in title, description, location
- `location` - Filter by location
- `dateFrom` - Filter items from date (YYYY-MM-DD)
- `dateTo` - Filter items to date (YYYY-MM-DD)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**
```
GET /items?type=lost&category=Electronics&page=1&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "lost",
      "title": "iPhone 13 Pro",
      "description": "Lost my iPhone in the cafeteria",
      "category": "Electronics",
      "location": "Cafeteria",
      "date": "2025-12-26T00:00:00.000Z",
      "images": ["1735467890123-iphone.jpg"],
      "color": "Blue",
      "brand": "Apple",
      "status": "active",
      "reportedBy": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "matchedItems": ["507f1f77bcf86cd799439013"],
      "createdAt": "2025-12-27T10:30:00.000Z"
    }
  ]
}
```

### Get Item by ID
**GET** `/items/:id`

Get detailed information about a specific item.

**Response:** `200 OK`
```json
{
  "success": true,
  "item": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "lost",
    "title": "iPhone 13 Pro",
    "description": "Lost my iPhone in the cafeteria. Blue color with cracked screen protector.",
    "category": "Electronics",
    "location": "Cafeteria",
    "date": "2025-12-26T00:00:00.000Z",
    "images": ["1735467890123-iphone.jpg"],
    "color": "Blue",
    "brand": "Apple",
    "identifyingFeatures": "Cracked screen protector, custom wallpaper",
    "status": "active",
    "reportedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    },
    "matchedItems": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Blue iPhone Found",
        "type": "found",
        "category": "Electronics",
        "location": "Cafeteria",
        "images": ["1735467890124-found-iphone.jpg"]
      }
    ],
    "claimRequests": [],
    "createdAt": "2025-12-27T10:30:00.000Z"
  }
}
```

### Create Item
**POST** `/items`

Report a lost or found item.

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Form Data:**
- `type` (required) - "lost" or "found"
- `title` (required) - Item title
- `description` (required) - Detailed description
- `category` (required) - Item category
- `location` (required) - Where item was lost/found
- `date` (required) - Date when lost/found
- `color` - Item color
- `brand` - Item brand
- `identifyingFeatures` - Unique features
- `images` - Array of image files (max 5, 5MB each)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Item reported successfully",
  "item": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "lost",
    "title": "iPhone 13 Pro",
    "matchedItems": ["507f1f77bcf86cd799439013"]
  }
}
```

### Update Item
**PUT** `/items/:id`

Update item details (owner or admin only).

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Response:** `200 OK`

### Delete Item
**DELETE** `/items/:id`

Delete an item (owner or admin only).

**Auth Required:** Yes

**Response:** `200 OK`

### Get My Items
**GET** `/items/user/my-items`

Get items reported by current user.

**Auth Required:** Yes

**Response:** `200 OK`

### Get Matches
**GET** `/items/:id/matches`

Get matched items for a specific item with match scores.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "matches": [
    {
      "item": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Blue iPhone Found",
        "type": "found",
        "category": "Electronics"
      },
      "score": 85,
      "quality": "High"
    }
  ]
}
```

### Get Item Statistics
**GET** `/items/stats`

Get overall item statistics.

**Response:** `200 OK`
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "lost": 75,
    "found": 75,
    "claimed": 45,
    "returned": 30,
    "matched": 98,
    "matchRate": "65.33"
  }
}
```

---

## Claim Endpoints

### Create Claim
**POST** `/claims`

Submit a claim for a found item.

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Form Data:**
- `itemId` (required) - ID of item being claimed
- `proofDescription` (required) - Description proving ownership
- `proofImages` - Array of proof images (max 3)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "claim": {
    "_id": "507f1f77bcf86cd799439020",
    "item": "507f1f77bcf86cd799439011",
    "claimedBy": "507f1f77bcf86cd799439012",
    "status": "pending",
    "proofDescription": "This is my wallet. I can describe the contents...",
    "createdAt": "2025-12-29T10:00:00.000Z"
  }
}
```

### Get Claims
**GET** `/claims`

Get claims (filtered by user role).

**Auth Required:** Yes

**Query Parameters:**
- `status` - Filter by status (pending/approved/rejected)
- `itemId` - Filter by item ID
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

### Get Claim by ID
**GET** `/claims/:id`

Get detailed claim information.

**Auth Required:** Yes

**Response:** `200 OK`

### Update Claim Status
**PATCH** `/claims/:id`

Approve or reject a claim (staff/admin only).

**Auth Required:** Yes (Staff/Admin)

**Request Body:**
```json
{
  "status": "approved",
  "verificationNotes": "Verified ownership through ID card"
}
```

**Response:** `200 OK`

### Get My Claims
**GET** `/claims/user/my-claims`

Get claims submitted by current user.

**Auth Required:** Yes

**Response:** `200 OK`

### Delete Claim
**DELETE** `/claims/:id`

Delete a pending claim (owner only).

**Auth Required:** Yes

**Response:** `200 OK`

---

## Notification Endpoints

### Get Notifications
**GET** `/notifications`

Get user's notifications.

**Auth Required:** Yes

**Query Parameters:**
- `limit` - Number of notifications (default: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "unreadCount": 2,
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "user": "507f1f77bcf86cd799439012",
      "type": "match",
      "title": "Potential Match Found!",
      "message": "We found a potential match for your lost item: iPhone 13 Pro",
      "relatedItem": "507f1f77bcf86cd799439011",
      "read": false,
      "createdAt": "2025-12-29T10:00:00.000Z"
    }
  ]
}
```

### Mark as Read
**PATCH** `/notifications/:id/read`

Mark a notification as read.

**Auth Required:** Yes

**Response:** `200 OK`

### Mark All as Read
**PATCH** `/notifications/read-all`

Mark all notifications as read.

**Auth Required:** Yes

**Response:** `200 OK`

### Get Unread Count
**GET** `/notifications/unread-count`

Get count of unread notifications.

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 3
}
```

---

## Admin Endpoints

### Get Dashboard Statistics
**GET** `/admin/stats`

Get comprehensive dashboard statistics.

**Auth Required:** Yes (Admin)

**Response:** `200 OK`
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 500,
      "byRole": [
        { "_id": "user", "count": 480 },
        { "_id": "staff", "count": 15 },
        { "_id": "admin", "count": 5 }
      ]
    },
    "items": {
      "total": 150,
      "active": 75,
      "claimed": 45,
      "byType": [
        { "_id": "lost", "count": 75 },
        { "_id": "found", "count": 75 }
      ],
      "matchRate": "65.33"
    },
    "claims": {
      "total": 100,
      "pending": 25,
      "approved": 60,
      "rejected": 15,
      "approvalRate": "60.00"
    }
  }
}
```

### Get All Users
**GET** `/admin/users`

Get list of all users.

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `role` - Filter by role
- `search` - Search by name, email, department
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

### Update User Role
**PATCH** `/admin/users/:id/role`

Change user's role.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "role": "staff"
}
```

**Response:** `200 OK`

### Delete User
**DELETE** `/admin/users/:id`

Delete a user account.

**Auth Required:** Yes (Admin)

**Response:** `200 OK`

### Get All Items (Admin)
**GET** `/admin/items`

Get all items with admin view.

**Auth Required:** Yes (Admin)

**Response:** `200 OK`

### Update Item Status
**PATCH** `/admin/items/:id/status`

Update item status (moderate).

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "status": "archived"
}
```

**Response:** `200 OK`

### Get Recent Activity
**GET** `/admin/activity`

Get recent system activity.

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `limit` - Number of activities (default: 50)

**Response:** `200 OK`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'user' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## File Upload

- **Max file size**: 5MB per image
- **Allowed formats**: JPEG, JPG, PNG, GIF
- **Max files per request**: 5 for items, 3 for claims
- **Storage**: Local filesystem in `uploads/` directory

## Notes

- All dates are in ISO 8601 format
- All IDs are MongoDB ObjectIds
- Pagination starts at page 1
- Default page limit is 20 items
- Timestamps are in UTC

---

**Last Updated**: December 2025
