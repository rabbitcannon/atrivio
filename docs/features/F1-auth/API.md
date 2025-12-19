# F1: Authentication & Users - API Design

## Overview

Authentication endpoints wrapping Supabase Auth with additional profile management.

## Base URL

```
/api/v1/auth
/api/v1/users
```

## Authentication Endpoints

### POST /api/v1/auth/register

Register a new user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_verified": false
  },
  "message": "Confirmation email sent"
}
```

**Errors:**
- `400` - Invalid email format or weak password
- `409` - Email already registered

---

### POST /api/v1/auth/login

Authenticate with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "display_name": "John Doe",
      "avatar_url": null
    }
  },
  "session": {
    "access_token": "jwt...",
    "refresh_token": "uuid",
    "expires_at": 1703980800
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Email not verified

---

### POST /api/v1/auth/magic-link

Send a magic link for passwordless authentication.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Magic link sent to email"
}
```

---

### POST /api/v1/auth/logout

End current session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### POST /api/v1/auth/refresh

Refresh access token.

**Request:**
```json
{
  "refresh_token": "uuid"
}
```

**Response (200):**
```json
{
  "session": {
    "access_token": "jwt...",
    "refresh_token": "uuid",
    "expires_at": 1703980800
  }
}
```

---

### POST /api/v1/auth/forgot-password

Initiate password reset flow.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

---

### POST /api/v1/auth/reset-password

Complete password reset with token.

**Request:**
```json
{
  "token": "reset-token",
  "password": "newSecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

## User/Profile Endpoints

### GET /api/v1/users/me

Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "display_name": "John Doe",
  "avatar_url": "https://...",
  "phone": "+1234567890",
  "timezone": "America/New_York",
  "email_verified": true,
  "is_super_admin": false,
  "created_at": "2024-01-01T00:00:00Z",
  "memberships": [
    {
      "org_id": "uuid",
      "org_name": "Scary Attractions LLC",
      "role": "owner"
    }
  ]
}
```

---

### PATCH /api/v1/users/me

Update current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "display_name": "Johnny",
  "phone": "+1234567890",
  "timezone": "America/Los_Angeles"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Smith",
  "display_name": "Johnny",
  "phone": "+1234567890",
  "timezone": "America/Los_Angeles",
  "updated_at": "2024-01-02T00:00:00Z"
}
```

---

### POST /api/v1/users/me/avatar

Upload profile avatar.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request:** Form data with `avatar` file field

**Response (200):**
```json
{
  "avatar_url": "https://storage.supabase.co/..."
}
```

---

### DELETE /api/v1/users/me/avatar

Remove profile avatar.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "avatar_url": null
}
```

---

### POST /api/v1/users/me/change-password

Change password for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "current_password": "oldPassword123!",
  "new_password": "newPassword456!"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

## Super Admin Endpoints

### GET /api/v1/users

List all users (super admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search by email or name
- `is_super_admin` - Filter by super admin status

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_super_admin": false,
      "email_verified": true,
      "created_at": "2024-01-01T00:00:00Z",
      "last_login_at": "2024-01-15T12:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

---

### GET /api/v1/users/:id

Get user by ID (super admin only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Same as GET /users/me

---

### PATCH /api/v1/users/:id

Update user (super admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "is_super_admin": true
}
```

**Response (200):** Updated user object

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "status": 401
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| AUTH_INVALID_CREDENTIALS | 401 | Wrong email/password |
| AUTH_EMAIL_NOT_VERIFIED | 403 | Email confirmation required |
| AUTH_TOKEN_EXPIRED | 401 | Access token expired |
| AUTH_TOKEN_INVALID | 401 | Malformed or invalid token |
| AUTH_EMAIL_EXISTS | 409 | Email already registered |
| AUTH_WEAK_PASSWORD | 400 | Password doesn't meet requirements |
| USER_NOT_FOUND | 404 | User doesn't exist |
| USER_FORBIDDEN | 403 | No permission for this action |

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| /auth/login | 5/minute per IP |
| /auth/register | 3/minute per IP |
| /auth/forgot-password | 3/minute per email |
| /auth/magic-link | 3/minute per email |
| All other endpoints | 100/minute per user |

## Security Considerations

1. **Password Requirements:**
   - Minimum 8 characters
   - At least 1 uppercase, 1 lowercase, 1 number
   - No common passwords (checked against list)

2. **Token Security:**
   - Access tokens expire in 1 hour
   - Refresh tokens expire in 7 days
   - Tokens invalidated on password change

3. **Brute Force Protection:**
   - Account lockout after 5 failed attempts
   - Progressive delays between attempts
   - CAPTCHA after 3 failures (frontend)
