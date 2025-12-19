# API Design Template

Use this template when designing APIs for each feature.

---

# Feature: [Feature Name] API

## Overview

Brief description of the API endpoints for this feature.

---

## Base URL

```
/api/v1/[resource]
```

---

## Authentication

All endpoints require authentication via Supabase JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### List Resources

```
GET /api/v1/resources
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | `number` | No | Page number (default: 1) |
| `limit` | `number` | No | Items per page (default: 20, max: 100) |
| `sort` | `string` | No | Sort field (default: `created_at`) |
| `order` | `string` | No | Sort order: `asc` or `desc` (default: `desc`) |
| `search` | `string` | No | Search query |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "field": "value",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**Permissions:** `resource:read`

---

### Get Resource

```
GET /api/v1/resources/:id
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "field": "value",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Permissions:** `resource:read`

---

### Create Resource

```
POST /api/v1/resources
```

**Request Body:**

```json
{
  "field": "value",
  "optional_field": "value"
}
```

**Validation:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `field` | `string` | Yes | 1-255 characters |
| `optional_field` | `string` | No | Max 1000 characters |

**Response:** `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "field": "value",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Permissions:** `resource:create`

---

### Update Resource

```
PATCH /api/v1/resources/:id
```

**Request Body:**

```json
{
  "field": "new_value"
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "field": "new_value",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Permissions:** `resource:update`

---

### Delete Resource

```
DELETE /api/v1/resources/:id
```

**Response:** `204 No Content`

**Permissions:** `resource:delete`

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": ["Validation error message"]
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Permissions Matrix

| Role | List | Get | Create | Update | Delete |
|------|------|-----|--------|--------|--------|
| Owner | Y | Y | Y | Y | Y |
| Admin | Y | Y | Y | Y | Y |
| Manager | Y | Y | Y | Y | N |
| Staff | Y | Y | N | N | N |

---

## Rate Limiting

| Endpoint | Rate Limit |
|----------|------------|
| `GET /resources` | 100/min |
| `POST /resources` | 30/min |
| `PATCH /resources/:id` | 60/min |
| `DELETE /resources/:id` | 30/min |

---

## Webhooks (if applicable)

### `resource.created`

```json
{
  "event": "resource.created",
  "data": {
    "id": "uuid",
    "field": "value"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### `resource.updated`

```json
{
  "event": "resource.updated",
  "data": {
    "id": "uuid",
    "changes": {
      "field": {
        "old": "old_value",
        "new": "new_value"
      }
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Checklist

- [ ] All CRUD endpoints defined
- [ ] Request/response schemas documented
- [ ] Validation rules specified
- [ ] Error codes documented
- [ ] Permissions matrix complete
- [ ] Rate limits defined
- [ ] Webhooks documented (if applicable)
