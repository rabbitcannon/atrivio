# F2: Organizations - API Design

## Overview

Organization management endpoints including creation, member management, and invitations.

## Base URL

```
/api/v1/organizations
```

## Organization Endpoints

### POST /api/v1/organizations

Create a new organization. Creator becomes owner.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Scary Attractions LLC",
  "slug": "scary-attractions",
  "email": "contact@scaryattractions.com",
  "phone": "+1234567890",
  "website": "https://scaryattractions.com",
  "address": {
    "line1": "123 Spooky Lane",
    "line2": "Suite 666",
    "city": "Salem",
    "state": "MA",
    "postal_code": "01970",
    "country": "US"
  },
  "timezone": "America/New_York"
}
```

**Response (201):**
```json
{
  "id": "org_uuid",
  "name": "Scary Attractions LLC",
  "slug": "scary-attractions",
  "email": "contact@scaryattractions.com",
  "phone": "+1234567890",
  "website": "https://scaryattractions.com",
  "address": {
    "line1": "123 Spooky Lane",
    "line2": "Suite 666",
    "city": "Salem",
    "state": "MA",
    "postal_code": "01970",
    "country": "US"
  },
  "timezone": "America/New_York",
  "status": "active",
  "stripe_onboarding_complete": false,
  "membership": {
    "role": "owner",
    "is_owner": true
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `400` - Invalid input (name too short, invalid slug)
- `409` - Slug already taken

---

### GET /api/v1/organizations

List organizations current user belongs to.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": [
    {
      "id": "org_uuid",
      "name": "Scary Attractions LLC",
      "slug": "scary-attractions",
      "logo_url": "https://...",
      "role": "owner",
      "status": "active",
      "stripe_onboarding_complete": true
    },
    {
      "id": "org_uuid2",
      "name": "Another Attraction",
      "slug": "another-attraction",
      "logo_url": null,
      "role": "manager",
      "status": "active",
      "stripe_onboarding_complete": false
    }
  ]
}
```

---

### GET /api/v1/organizations/:orgId

Get organization details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "org_uuid",
  "name": "Scary Attractions LLC",
  "slug": "scary-attractions",
  "logo_url": "https://...",
  "email": "contact@scaryattractions.com",
  "phone": "+1234567890",
  "website": "https://scaryattractions.com",
  "address": {
    "line1": "123 Spooky Lane",
    "line2": "Suite 666",
    "city": "Salem",
    "state": "MA",
    "postal_code": "01970",
    "country": "US"
  },
  "timezone": "America/New_York",
  "status": "active",
  "settings": {},
  "stripe_onboarding_complete": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z",
  "membership": {
    "role": "owner",
    "is_owner": true,
    "joined_at": "2024-01-01T00:00:00Z"
  },
  "stats": {
    "member_count": 15,
    "attraction_count": 3
  }
}
```

---

### PATCH /api/v1/organizations/:orgId

Update organization details.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Request:**
```json
{
  "name": "Super Scary Attractions LLC",
  "email": "new@scaryattractions.com",
  "settings": {
    "require_2fa": true,
    "default_ticket_limit": 100
  }
}
```

**Response (200):** Updated organization object

---

### DELETE /api/v1/organizations/:orgId

Delete organization (soft delete).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Response (200):**
```json
{
  "message": "Organization scheduled for deletion",
  "deleted_at": "2024-01-20T00:00:00Z"
}
```

---

### POST /api/v1/organizations/:orgId/logo

Upload organization logo.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Required Role:** `owner` or `admin`

**Response (200):**
```json
{
  "logo_url": "https://storage.supabase.co/..."
}
```

---

## Member Management Endpoints

### GET /api/v1/organizations/:orgId/members

List organization members.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `role` - Filter by role
- `status` - Filter by status (default: active)
- `search` - Search by name/email

**Response (200):**
```json
{
  "data": [
    {
      "id": "membership_uuid",
      "user": {
        "id": "user_uuid",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_url": "https://..."
      },
      "role": "owner",
      "is_owner": true,
      "status": "active",
      "joined_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "membership_uuid2",
      "user": {
        "id": "user_uuid2",
        "email": "jane@example.com",
        "first_name": "Jane",
        "last_name": "Smith",
        "avatar_url": null
      },
      "role": "manager",
      "is_owner": false,
      "status": "active",
      "invited_by": {
        "id": "user_uuid",
        "name": "John Doe"
      },
      "joined_at": "2024-01-05T00:00:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "by_role": {
      "owner": 1,
      "admin": 2,
      "manager": 3,
      "actor": 9
    }
  }
}
```

---

### PATCH /api/v1/organizations/:orgId/members/:memberId

Update member role.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Request:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "id": "membership_uuid",
  "role": "admin",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

**Errors:**
- `403` - Cannot promote to admin (owner only)
- `403` - Cannot modify owner
- `403` - Cannot demote self if last admin

---

### DELETE /api/v1/organizations/:orgId/members/:memberId

Remove member from organization.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Response (200):**
```json
{
  "message": "Member removed successfully"
}
```

**Errors:**
- `403` - Cannot remove owner

---

## Invitation Endpoints

### POST /api/v1/organizations/:orgId/invitations

Invite user to organization.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Request:**
```json
{
  "email": "newuser@example.com",
  "role": "actor"
}
```

**Response (201):**
```json
{
  "id": "invitation_uuid",
  "email": "newuser@example.com",
  "role": "actor",
  "expires_at": "2024-01-22T00:00:00Z",
  "invited_by": {
    "id": "user_uuid",
    "name": "John Doe"
  }
}
```

**Errors:**
- `400` - Invalid email
- `403` - Cannot invite to higher role than self
- `409` - User already member or pending invitation

---

### GET /api/v1/organizations/:orgId/invitations

List pending invitations.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Response (200):**
```json
{
  "data": [
    {
      "id": "invitation_uuid",
      "email": "pending@example.com",
      "role": "actor",
      "expires_at": "2024-01-22T00:00:00Z",
      "invited_by": {
        "id": "user_uuid",
        "name": "John Doe"
      },
      "created_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

---

### DELETE /api/v1/organizations/:orgId/invitations/:invitationId

Cancel pending invitation.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Response (200):**
```json
{
  "message": "Invitation cancelled"
}
```

---

### POST /api/v1/invitations/accept

Accept invitation (public endpoint with token).

**Request:**
```json
{
  "token": "invitation_token"
}
```

**Response (200):**
```json
{
  "message": "Invitation accepted",
  "organization": {
    "id": "org_uuid",
    "name": "Scary Attractions LLC",
    "slug": "scary-attractions"
  },
  "role": "actor"
}
```

**Errors:**
- `400` - Invalid or expired token
- `409` - Already a member

---

### GET /api/v1/invitations/:token

Get invitation details (public endpoint for preview).

**Response (200):**
```json
{
  "organization": {
    "name": "Scary Attractions LLC",
    "logo_url": "https://..."
  },
  "role": "actor",
  "invited_by": "John Doe",
  "expires_at": "2024-01-22T00:00:00Z"
}
```

---

## Switch Organization Context

### POST /api/v1/organizations/:orgId/switch

Set active organization for session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Switched to organization",
  "organization": {
    "id": "org_uuid",
    "name": "Scary Attractions LLC",
    "slug": "scary-attractions"
  },
  "role": "owner",
  "permissions": [
    "org:update",
    "member:invite",
    "attraction:create",
    ...
  ]
}
```

---

## Error Responses

```json
{
  "error": {
    "code": "ORG_SLUG_TAKEN",
    "message": "This organization slug is already in use",
    "status": 409
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| ORG_NOT_FOUND | 404 | Organization doesn't exist |
| ORG_SLUG_TAKEN | 409 | Slug already in use |
| ORG_FORBIDDEN | 403 | No permission for action |
| ORG_OWNER_PROTECTED | 403 | Cannot modify owner |
| MEMBER_NOT_FOUND | 404 | Member doesn't exist |
| MEMBER_ALREADY_EXISTS | 409 | User already a member |
| INVITATION_EXPIRED | 400 | Invitation has expired |
| INVITATION_INVALID | 400 | Invalid invitation token |
| INVITATION_ALREADY_EXISTS | 409 | Pending invitation exists |
| ROLE_ESCALATION | 403 | Cannot assign higher role |

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| POST /organizations | 5/hour per user |
| POST /invitations | 50/hour per org |
| All other endpoints | 100/minute per user |

## Webhooks

Events emitted for integrations:

| Event | Payload |
|-------|---------|
| `organization.created` | Full org object |
| `organization.updated` | Updated fields |
| `organization.deleted` | org_id, deleted_at |
| `member.joined` | org_id, user_id, role |
| `member.removed` | org_id, user_id |
| `member.role_changed` | org_id, user_id, old_role, new_role |
| `invitation.sent` | org_id, email, role |
| `invitation.accepted` | org_id, user_id, role |
