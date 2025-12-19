# F5: Platform Admin - API Design

## Overview

Super admin APIs for platform-wide management. All endpoints require `is_super_admin = TRUE`.

## Base URL

```
/api/v1/admin
```

## Authentication

All admin endpoints require:
- Valid JWT token
- User must have `is_super_admin = TRUE`
- Uses service-role key to bypass RLS

## Dashboard Endpoints

### GET /api/v1/admin/dashboard

Get platform dashboard stats.

**Response (200):**
```json
{
  "stats": {
    "total_users": 15420,
    "total_organizations": 342,
    "total_attractions": 890,
    "active_seasons": 156,
    "tickets_sold_today": 4521,
    "revenue_today": 112525
  },
  "growth": {
    "users_7d": 245,
    "users_30d": 1024,
    "orgs_7d": 12,
    "orgs_30d": 45
  },
  "health": {
    "api": "healthy",
    "database": "healthy",
    "redis": "healthy",
    "stripe": "healthy",
    "supabase": "healthy"
  },
  "recent_activity": [
    {
      "type": "org_created",
      "org_name": "New Attraction LLC",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## User Management

### GET /api/v1/admin/users

List all users.

**Query Parameters:**
- `page`, `limit` - Pagination
- `search` - Search by email/name
- `is_super_admin` - Filter by admin status
- `created_after`, `created_before` - Date filters
- `has_orgs` - Has organization memberships

**Response (200):**
```json
{
  "data": [
    {
      "id": "user_uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_super_admin": false,
      "email_verified": true,
      "created_at": "2024-01-01T00:00:00Z",
      "last_login_at": "2024-01-15T12:00:00Z",
      "org_count": 2,
      "organizations": [
        {"id": "org_uuid", "name": "Scary Attractions", "role": "owner"}
      ]
    }
  ],
  "meta": {
    "total": 15420,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /api/v1/admin/users/:userId

Get user details.

**Response (200):**
```json
{
  "id": "user_uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar_url": "https://...",
  "timezone": "America/New_York",
  "is_super_admin": false,
  "email_verified": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z",
  "last_login_at": "2024-01-15T12:00:00Z",
  "organizations": [
    {
      "id": "org_uuid",
      "name": "Scary Attractions LLC",
      "role": "owner",
      "is_owner": true,
      "joined_at": "2024-01-01T00:00:00Z"
    }
  ],
  "audit_summary": {
    "recent_actions": 45,
    "last_action_at": "2024-01-15T11:30:00Z"
  }
}
```

---

### PATCH /api/v1/admin/users/:userId

Update user.

**Request:**
```json
{
  "is_super_admin": true,
  "email_verified": true
}
```

**Response (200):** Updated user object

---

### DELETE /api/v1/admin/users/:userId

Delete user (soft delete).

**Request:**
```json
{
  "confirm": true,
  "reason": "User requested deletion"
}
```

**Response (200):**
```json
{
  "message": "User deleted",
  "id": "user_uuid"
}
```

---

### POST /api/v1/admin/users/:userId/impersonate

Generate impersonation token.

**Response (200):**
```json
{
  "token": "jwt_token",
  "expires_at": "2024-01-15T13:00:00Z",
  "warning": "All actions will be logged"
}
```

---

## Organization Management

### GET /api/v1/admin/organizations

List all organizations.

**Query Parameters:**
- `page`, `limit` - Pagination
- `search` - Search by name/slug
- `status` - Filter by status
- `stripe_connected` - Has Stripe connected
- `created_after`, `created_before` - Date filters

**Response (200):**
```json
{
  "data": [
    {
      "id": "org_uuid",
      "name": "Scary Attractions LLC",
      "slug": "scary-attractions",
      "status": "active",
      "owner": {
        "id": "user_uuid",
        "email": "owner@example.com",
        "name": "John Doe"
      },
      "member_count": 45,
      "attraction_count": 3,
      "stripe_connected": true,
      "total_revenue": 125000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 342,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /api/v1/admin/organizations/:orgId

Get organization details.

**Response (200):**
```json
{
  "id": "org_uuid",
  "name": "Scary Attractions LLC",
  "slug": "scary-attractions",
  "status": "active",
  "email": "contact@scaryattractions.com",
  "phone": "+1234567890",
  "address": {...},
  "timezone": "America/New_York",
  "settings": {...},
  "stripe_account_id": "acct_xxx",
  "stripe_onboarding_complete": true,
  "created_at": "2024-01-01T00:00:00Z",
  "members": [
    {
      "id": "user_uuid",
      "email": "owner@example.com",
      "name": "John Doe",
      "role": "owner",
      "is_owner": true
    }
  ],
  "attractions": [
    {
      "id": "attraction_uuid",
      "name": "Terror Trail",
      "status": "active"
    }
  ],
  "stats": {
    "total_tickets_sold": 12500,
    "total_revenue": 312500,
    "active_staff": 45
  }
}
```

---

### PATCH /api/v1/admin/organizations/:orgId

Update organization.

**Request:**
```json
{
  "status": "suspended",
  "notes": "Payment issues"
}
```

---

### POST /api/v1/admin/organizations/:orgId/suspend

Suspend organization.

**Request:**
```json
{
  "reason": "Terms of service violation",
  "notify_owner": true
}
```

---

### POST /api/v1/admin/organizations/:orgId/reactivate

Reactivate suspended organization.

---

### DELETE /api/v1/admin/organizations/:orgId

Delete organization.

**Request:**
```json
{
  "confirm_slug": "scary-attractions",
  "reason": "Owner requested deletion"
}
```

---

## Feature Flags

### GET /api/v1/admin/feature-flags

List all feature flags.

**Response (200):**
```json
{
  "flags": [
    {
      "id": "flag_uuid",
      "key": "new_checkout_flow",
      "name": "New Checkout Flow",
      "description": "Updated checkout experience with one-page flow",
      "enabled": false,
      "rollout_percentage": 25,
      "org_count": 5,
      "user_count": 12,
      "updated_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

---

### POST /api/v1/admin/feature-flags

Create feature flag.

**Request:**
```json
{
  "key": "virtual_queue_v2",
  "name": "Virtual Queue V2",
  "description": "New virtual queue system with SMS notifications",
  "enabled": false
}
```

---

### PATCH /api/v1/admin/feature-flags/:flagId

Update feature flag.

**Request:**
```json
{
  "enabled": true,
  "rollout_percentage": 50,
  "org_ids": ["org_uuid_1", "org_uuid_2"]
}
```

---

### DELETE /api/v1/admin/feature-flags/:flagId

Delete feature flag.

---

## Platform Settings

### GET /api/v1/admin/settings

Get all platform settings.

**Response (200):**
```json
{
  "settings": {
    "maintenance_mode": {
      "value": {"enabled": false, "message": null},
      "description": "Platform maintenance mode",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "registration_enabled": {
      "value": true,
      "description": "Allow new user registrations",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### PATCH /api/v1/admin/settings/:key

Update setting.

**Request:**
```json
{
  "value": {"enabled": true, "message": "Scheduled maintenance in progress"}
}
```

---

### POST /api/v1/admin/settings/maintenance

Toggle maintenance mode.

**Request:**
```json
{
  "enabled": true,
  "message": "Scheduled maintenance until 3:00 AM EST",
  "allow_admins": true
}
```

---

## Announcements

### GET /api/v1/admin/announcements

List announcements.

**Response (200):**
```json
{
  "announcements": [
    {
      "id": "ann_uuid",
      "title": "New Feature: Virtual Queue",
      "content": "We're excited to announce...",
      "type": "feature",
      "starts_at": "2024-01-15T00:00:00Z",
      "expires_at": "2024-01-22T00:00:00Z",
      "is_dismissible": true,
      "view_count": 1250,
      "dismiss_count": 890
    }
  ]
}
```

---

### POST /api/v1/admin/announcements

Create announcement.

**Request:**
```json
{
  "title": "Scheduled Maintenance",
  "content": "We will be performing maintenance...",
  "type": "maintenance",
  "target_roles": ["owner", "admin"],
  "starts_at": "2024-01-20T00:00:00Z",
  "expires_at": "2024-01-20T06:00:00Z",
  "is_dismissible": false
}
```

---

### DELETE /api/v1/admin/announcements/:announcementId

Delete announcement.

---

## Audit Logs

### GET /api/v1/admin/audit-logs

Search audit logs.

**Query Parameters:**
- `page`, `limit` - Pagination
- `actor_id` - Filter by actor
- `org_id` - Filter by organization
- `action` - Filter by action
- `resource_type` - Filter by resource type
- `start_date`, `end_date` - Date range

**Response (200):**
```json
{
  "data": [
    {
      "id": "log_uuid",
      "actor": {
        "id": "user_uuid",
        "email": "admin@example.com",
        "name": "Admin User"
      },
      "actor_type": "user",
      "action": "user.update",
      "resource_type": "user",
      "resource_id": "target_user_uuid",
      "org_id": null,
      "changes": {
        "is_super_admin": {"from": false, "to": true}
      },
      "ip_address": "192.168.1.1",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 12500
  }
}
```

---

### GET /api/v1/admin/audit-logs/export

Export audit logs.

**Query Parameters:**
- Same as search, plus `format` (csv/json)

**Response:** File download

---

## System Health

### GET /api/v1/admin/health

Get system health status.

**Response (200):**
```json
{
  "status": "healthy",
  "services": {
    "api": {
      "status": "healthy",
      "latency_ms": 12,
      "last_check": "2024-01-15T12:00:00Z"
    },
    "database": {
      "status": "healthy",
      "latency_ms": 5,
      "connections": 25,
      "max_connections": 100
    },
    "redis": {
      "status": "healthy",
      "latency_ms": 2,
      "memory_used_mb": 128
    },
    "stripe": {
      "status": "healthy",
      "latency_ms": 150
    },
    "supabase_auth": {
      "status": "healthy",
      "latency_ms": 45
    },
    "supabase_storage": {
      "status": "healthy",
      "latency_ms": 35
    }
  },
  "metrics": {
    "requests_per_minute": 450,
    "error_rate": 0.02,
    "avg_response_time_ms": 85
  }
}
```

---

### GET /api/v1/admin/health/history

Get health history.

**Query Parameters:**
- `service` - Specific service
- `hours` - Lookback period (default: 24)

**Response (200):**
```json
{
  "service": "api",
  "data_points": [
    {
      "timestamp": "2024-01-15T11:00:00Z",
      "status": "healthy",
      "latency_ms": 12
    }
  ]
}
```

---

## Rate Limiting

### GET /api/v1/admin/rate-limits

Get rate limit rules.

**Response (200):**
```json
{
  "rules": [
    {
      "id": "rule_uuid",
      "name": "Login Rate Limit",
      "endpoint_pattern": "/api/v1/auth/login",
      "requests_per_minute": 5,
      "burst_limit": 10,
      "applies_to": "all",
      "enabled": true
    }
  ]
}
```

---

### POST /api/v1/admin/rate-limits

Create rate limit rule.

**Request:**
```json
{
  "name": "Ticket Purchase Limit",
  "endpoint_pattern": "/api/v1/*/tickets/purchase",
  "requests_per_minute": 10,
  "requests_per_hour": 100,
  "applies_to": "authenticated"
}
```

---

### PATCH /api/v1/admin/rate-limits/:ruleId

Update rate limit rule.

---

### DELETE /api/v1/admin/rate-limits/:ruleId

Delete rate limit rule.

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| ADMIN_REQUIRED | 403 | Must be super admin |
| ADMIN_ACTION_FORBIDDEN | 403 | Cannot perform on self |
| ADMIN_CONFIRMATION_REQUIRED | 400 | Destructive action needs confirmation |
| ADMIN_AUDIT_FAILED | 500 | Failed to log audit event |
| SETTING_NOT_FOUND | 404 | Platform setting not found |
| FLAG_NOT_FOUND | 404 | Feature flag not found |

## Webhooks

Admin actions trigger these webhook events:

| Event | Payload |
|-------|---------|
| `admin.user.updated` | user_id, changes, admin_id |
| `admin.user.deleted` | user_id, admin_id |
| `admin.org.suspended` | org_id, reason, admin_id |
| `admin.org.deleted` | org_id, admin_id |
| `admin.setting.changed` | key, old_value, new_value |
| `admin.flag.toggled` | flag_key, enabled |
