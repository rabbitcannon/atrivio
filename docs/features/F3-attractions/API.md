# F3: Attractions - API Design

## Overview

Attraction management endpoints for creating and configuring venues.

## Base URL

```
/api/v1/organizations/:orgId/attractions
```

## Attraction CRUD Endpoints

### POST /api/v1/organizations/:orgId/attractions

Create a new attraction.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "name": "Terror Trail",
  "slug": "terror-trail",
  "type": "haunted_trail",
  "description": "A terrifying journey through the dark woods...",
  "address": {
    "line1": "456 Creepy Road",
    "city": "Salem",
    "state": "MA",
    "postal_code": "01970",
    "country": "US"
  },
  "capacity": 200,
  "min_age": 12,
  "intensity_level": 4,
  "duration_minutes": 45
}
```

**Response (201):**
```json
{
  "id": "attraction_uuid",
  "org_id": "org_uuid",
  "name": "Terror Trail",
  "slug": "terror-trail",
  "type": "haunted_trail",
  "description": "A terrifying journey through the dark woods...",
  "status": "draft",
  "address": {
    "line1": "456 Creepy Road",
    "city": "Salem",
    "state": "MA",
    "postal_code": "01970",
    "country": "US"
  },
  "capacity": 200,
  "min_age": 12,
  "intensity_level": 4,
  "duration_minutes": 45,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET /api/v1/organizations/:orgId/attractions

List all attractions for organization.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Filter by status
- `type` - Filter by attraction type

**Response (200):**
```json
{
  "data": [
    {
      "id": "attraction_uuid",
      "name": "Terror Trail",
      "slug": "terror-trail",
      "type": "haunted_trail",
      "logo_url": "https://...",
      "cover_image_url": "https://...",
      "city": "Salem",
      "state": "MA",
      "status": "active",
      "intensity_level": 4,
      "current_season": {
        "id": "season_uuid",
        "name": "Halloween 2024",
        "start_date": "2024-09-15",
        "end_date": "2024-11-02"
      },
      "stats": {
        "total_tickets_sold": 5420,
        "revenue": 135500
      }
    }
  ]
}
```

---

### GET /api/v1/organizations/:orgId/attractions/:attractionId

Get attraction details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "attraction_uuid",
  "org_id": "org_uuid",
  "name": "Terror Trail",
  "slug": "terror-trail",
  "type": "haunted_trail",
  "description": "A terrifying journey through the dark woods...",
  "logo_url": "https://...",
  "cover_image_url": "https://...",
  "website": "https://terrortrail.com",
  "email": "info@terrortrail.com",
  "phone": "+1234567890",
  "address": {
    "line1": "456 Creepy Road",
    "city": "Salem",
    "state": "MA",
    "postal_code": "01970",
    "country": "US"
  },
  "coordinates": {
    "latitude": 42.5195,
    "longitude": -70.8967
  },
  "timezone": "America/New_York",
  "capacity": 200,
  "min_age": 12,
  "intensity_level": 4,
  "duration_minutes": 45,
  "status": "active",
  "settings": {
    "ticketing": {
      "require_timed_entry": true,
      "time_slot_duration_minutes": 15
    }
  },
  "seo_metadata": {
    "title": "Terror Trail - Salem's Scariest Haunted Trail",
    "description": "Experience pure terror..."
  },
  "amenities": ["parking", "restrooms", "food", "gift_shop"],
  "images": [
    {
      "id": "img_uuid",
      "url": "https://...",
      "alt_text": "Trail entrance",
      "is_featured": true
    }
  ],
  "zones": [
    {
      "id": "zone_uuid",
      "name": "Entrance Queue",
      "capacity": 50,
      "color": "#FF0000"
    }
  ],
  "current_season": {
    "id": "season_uuid",
    "name": "Halloween 2024",
    "status": "active"
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

---

### PATCH /api/v1/organizations/:orgId/attractions/:attractionId

Update attraction details.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "name": "Terror Trail - Extended Edition",
  "capacity": 250,
  "settings": {
    "ticketing": {
      "max_tickets_per_slot": 60
    }
  }
}
```

**Response (200):** Updated attraction object

---

### DELETE /api/v1/organizations/:orgId/attractions/:attractionId

Archive an attraction.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Response (200):**
```json
{
  "message": "Attraction archived",
  "id": "attraction_uuid",
  "status": "archived"
}
```

---

### POST /api/v1/organizations/:orgId/attractions/:attractionId/publish

Publish attraction (make visible).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Response (200):**
```json
{
  "id": "attraction_uuid",
  "status": "published",
  "message": "Attraction is now visible to the public"
}
```

**Errors:**
- `400` - Missing required fields (name, type, address, season)

---

### POST /api/v1/organizations/:orgId/attractions/:attractionId/activate

Activate attraction (enable ticket sales).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Response (200):**
```json
{
  "id": "attraction_uuid",
  "status": "active",
  "message": "Ticket sales are now enabled"
}
```

**Errors:**
- `400` - Stripe not connected
- `400` - No ticket types configured

---

## Season Endpoints

### POST /api/v1/organizations/:orgId/attractions/:attractionId/seasons

Create a season.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "name": "Halloween 2024",
  "year": 2024,
  "start_date": "2024-09-15",
  "end_date": "2024-11-02"
}
```

**Response (201):**
```json
{
  "id": "season_uuid",
  "attraction_id": "attraction_uuid",
  "name": "Halloween 2024",
  "year": 2024,
  "start_date": "2024-09-15",
  "end_date": "2024-11-02",
  "status": "upcoming",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET /api/v1/organizations/:orgId/attractions/:attractionId/seasons

List seasons for attraction.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `year` - Filter by year
- `status` - Filter by status

**Response (200):**
```json
{
  "data": [
    {
      "id": "season_uuid",
      "name": "Halloween 2024",
      "year": 2024,
      "start_date": "2024-09-15",
      "end_date": "2024-11-02",
      "status": "active",
      "stats": {
        "operating_days": 35,
        "tickets_sold": 5420
      }
    }
  ]
}
```

---

### PATCH /api/v1/organizations/:orgId/attractions/:attractionId/seasons/:seasonId

Update season.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "end_date": "2024-11-03",
  "status": "completed"
}
```

---

## Operating Hours Endpoints

### PUT /api/v1/organizations/:orgId/attractions/:attractionId/hours

Set operating hours (replaces all).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "season_id": "season_uuid",
  "weekly": [
    {
      "day_of_week": 5,
      "open_time": "18:00",
      "close_time": "23:00"
    },
    {
      "day_of_week": 6,
      "open_time": "17:00",
      "close_time": "00:00"
    }
  ],
  "overrides": [
    {
      "date": "2024-10-31",
      "open_time": "16:00",
      "close_time": "02:00",
      "notes": "Halloween Night - Extended Hours"
    },
    {
      "date": "2024-10-28",
      "is_closed": true,
      "notes": "Private Event"
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Operating hours updated",
  "weekly_count": 2,
  "override_count": 2
}
```

---

### GET /api/v1/organizations/:orgId/attractions/:attractionId/hours

Get operating hours.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `season_id` - Filter by season
- `start_date` - Range start
- `end_date` - Range end

**Response (200):**
```json
{
  "weekly": [
    {
      "day_of_week": 5,
      "day_name": "Friday",
      "open_time": "18:00",
      "close_time": "23:00"
    },
    {
      "day_of_week": 6,
      "day_name": "Saturday",
      "open_time": "17:00",
      "close_time": "00:00"
    }
  ],
  "overrides": [
    {
      "date": "2024-10-31",
      "open_time": "16:00",
      "close_time": "02:00",
      "notes": "Halloween Night - Extended Hours"
    }
  ],
  "calendar": [
    {
      "date": "2024-10-25",
      "is_open": true,
      "open_time": "18:00",
      "close_time": "23:00",
      "source": "weekly"
    },
    {
      "date": "2024-10-26",
      "is_open": true,
      "open_time": "17:00",
      "close_time": "00:00",
      "source": "weekly"
    }
  ]
}
```

---

## Zone Endpoints

### POST /api/v1/organizations/:orgId/attractions/:attractionId/zones

Create a zone.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "name": "Zombie Woods",
  "description": "Main trail section with zombie actors",
  "capacity": 30,
  "color": "#228B22"
}
```

**Response (201):**
```json
{
  "id": "zone_uuid",
  "attraction_id": "attraction_uuid",
  "name": "Zombie Woods",
  "description": "Main trail section with zombie actors",
  "capacity": 30,
  "color": "#228B22",
  "sort_order": 0
}
```

---

### GET /api/v1/organizations/:orgId/attractions/:attractionId/zones

List zones for attraction.

**Response (200):**
```json
{
  "data": [
    {
      "id": "zone_uuid",
      "name": "Zombie Woods",
      "description": "Main trail section with zombie actors",
      "capacity": 30,
      "color": "#228B22",
      "sort_order": 0,
      "staff_count": 8
    }
  ]
}
```

---

### PUT /api/v1/organizations/:orgId/attractions/:attractionId/zones/reorder

Reorder zones.

**Request:**
```json
{
  "zone_ids": ["zone_uuid_1", "zone_uuid_2", "zone_uuid_3"]
}
```

---

## Image Endpoints

### POST /api/v1/organizations/:orgId/attractions/:attractionId/images

Upload attraction images.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request:** Form data with `images` array, `alt_text`, `is_featured`

**Response (201):**
```json
{
  "images": [
    {
      "id": "img_uuid",
      "url": "https://storage.supabase.co/...",
      "alt_text": "Trail entrance",
      "is_featured": true,
      "sort_order": 0
    }
  ]
}
```

---

### DELETE /api/v1/organizations/:orgId/attractions/:attractionId/images/:imageId

Delete image.

**Response (200):**
```json
{
  "message": "Image deleted"
}
```

---

## Public Endpoints (No Auth)

### GET /api/v1/attractions/:slug

Get public attraction details.

**Response (200):**
```json
{
  "id": "attraction_uuid",
  "name": "Terror Trail",
  "slug": "terror-trail",
  "type": "haunted_trail",
  "description": "A terrifying journey...",
  "logo_url": "https://...",
  "cover_image_url": "https://...",
  "address": {
    "city": "Salem",
    "state": "MA"
  },
  "intensity_level": 4,
  "duration_minutes": 45,
  "min_age": 12,
  "amenities": ["parking", "restrooms", "food"],
  "images": [...],
  "operating_hours": {
    "next_open": "2024-10-25T18:00:00-04:00",
    "schedule": [...]
  },
  "organization": {
    "name": "Scary Attractions LLC",
    "logo_url": "https://..."
  }
}
```

---

### GET /api/v1/attractions

Search/list public attractions.

**Query Parameters:**
- `type` - Filter by type
- `city` - Filter by city
- `state` - Filter by state
- `lat`, `lng`, `radius` - Geo search (miles)
- `intensity_min`, `intensity_max` - Filter by intensity

**Response (200):**
```json
{
  "data": [
    {
      "id": "attraction_uuid",
      "name": "Terror Trail",
      "slug": "terror-trail",
      "type": "haunted_trail",
      "logo_url": "https://...",
      "city": "Salem",
      "state": "MA",
      "intensity_level": 4,
      "distance_miles": 5.2,
      "is_open_now": true,
      "next_open": "2024-10-25T18:00:00-04:00"
    }
  ],
  "meta": {
    "total": 45
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| ATTRACTION_NOT_FOUND | 404 | Attraction doesn't exist |
| ATTRACTION_SLUG_TAKEN | 409 | Slug already used in org |
| ATTRACTION_FORBIDDEN | 403 | No permission |
| ATTRACTION_INVALID_STATUS | 400 | Invalid status transition |
| ATTRACTION_MISSING_REQUIREMENTS | 400 | Missing fields for publish/activate |
| SEASON_INVALID_DATES | 400 | End date before start date |
| ZONE_NAME_TAKEN | 409 | Zone name already exists |
