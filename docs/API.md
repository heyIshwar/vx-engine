# VX Engine API Documentation

This document provides detailed information about the VX Engine REST API endpoints.

## Base URL

```
http://localhost:3008
```

## Authentication

VX Engine uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "name": "ERROR_TYPE",
    "message": "Error description"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

### POST /auth/logout

Logout user (invalidate token).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### POST /auth/refresh

Refresh JWT token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here"
  },
  "message": "Token refreshed successfully"
}
```

## User Management Endpoints

All user endpoints require authentication.

### GET /user/profile

Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /user/profile

Update user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "+1234567890"
    }
  },
  "message": "Profile updated successfully"
}
```

### DELETE /user/account

Delete user account.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## File Management Endpoints

### POST /file/upload

Upload files to AWS S3.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
files: [File objects]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file_id",
        "filename": "document.pdf",
        "url": "https://s3.amazonaws.com/bucket/file_path",
        "size": 1024,
        "mimeType": "application/pdf"
      }
    ]
  },
  "message": "Files uploaded successfully"
}
```

### GET /file/:id

Get file details.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file_id",
      "filename": "document.pdf",
      "url": "https://s3.amazonaws.com/bucket/file_path",
      "size": 1024,
      "mimeType": "application/pdf",
      "uploadedBy": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### DELETE /file/:id

Delete file.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### GET /file/presigned-url

Get presigned URL for direct S3 upload.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
filename=document.pdf&contentType=application/pdf
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/presigned-url",
    "fileId": "file_id"
  }
}
```

## Sample Module Endpoints

### GET /sample

Get sample data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
page=1&limit=10&sort=createdAt&order=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "sample_id",
        "name": "Sample Item",
        "description": "Sample description",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### POST /sample

Create sample data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "New Sample",
  "description": "Sample description",
  "category": "test"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "sample_id",
      "name": "New Sample",
      "description": "Sample description",
      "category": "test",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Sample created successfully"
}
```

### GET /sample/:id

Get specific sample item.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "sample_id",
      "name": "Sample Item",
      "description": "Sample description",
      "category": "test",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /sample/:id

Update sample item.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Updated Sample",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "sample_id",
      "name": "Updated Sample",
      "description": "Updated description",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Sample updated successfully"
}
```

### DELETE /sample/:id

Delete sample item.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Sample deleted successfully"
}
```

## Notification Endpoints

### GET /notification

Get user notifications.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
page=1&limit=10&read=false
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "title": "Notification Title",
        "message": "Notification message",
        "type": "info",
        "read": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "unreadCount": 5
  }
}
```

### POST /notification/send

Send push notification.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "userId": "target_user_id",
  "title": "Notification Title",
  "message": "Notification message",
  "type": "info"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

### PUT /notification/:id/read

Mark notification as read.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid request parameters |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Access denied |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 422  | Unprocessable Entity - Validation error |
| 500  | Internal Server Error - Server error |

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **File upload endpoints**: 10 requests per minute
- **Other endpoints**: 100 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10, max: 100) - Items per page
- `sort` (default: createdAt) - Sort field
- `order` (default: desc) - Sort order (asc/desc)

**Response:**
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Filtering

Many endpoints support filtering using query parameters:

```
GET /sample?category=test&name=sample&createdAt[gte]=2024-01-01
```

**Supported operators:**
- `eq` - equals
- `ne` - not equals
- `gt` - greater than
- `gte` - greater than or equal
- `lt` - less than
- `lte` - less than or equal
- `in` - in array
- `nin` - not in array

## Webhooks

VX Engine supports webhooks for real-time notifications:

### POST /webhook/register

Register a webhook endpoint.

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["user.created", "file.uploaded"],
  "secret": "webhook_secret"
}
```

### Webhook Events

- `user.created` - New user registration
- `user.updated` - User profile update
- `user.deleted` - User account deletion
- `file.uploaded` - File upload completed
- `file.deleted` - File deleted
- `notification.sent` - Notification sent

## SDK and Libraries

Official SDKs are available for:

- **JavaScript/Node.js**: `npm install vx-engine-sdk`
- **Python**: `pip install vx-engine-sdk`
- **PHP**: `composer require vx-engine/sdk`

Example usage:
```javascript
const VXEngine = require('vx-engine-sdk');

const client = new VXEngine({
  baseUrl: 'http://localhost:3008',
  apiKey: 'your-api-key'
});

const user = await client.users.getProfile();
```

## Testing

Use the following test credentials for development:

**Test User:**
- Email: `test@vxengine.com`
- Password: `test123456`

**API Test Endpoint:**
```
GET /throwError
```
This endpoint throws a test error for debugging purposes.

## Support

For API support:
- Documentation: This file
- Issues: GitHub repository issues
- Email: support@vxengine.com 