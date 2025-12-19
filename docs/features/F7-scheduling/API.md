# F7: Staff Scheduling - API Design

## Overview

Staff scheduling APIs for shift management, availability, and swap requests.

## Base URL

```
/api/v1/organizations/:orgId/schedules
/api/v1/organizations/:orgId/attractions/:attractionId/schedules
```

## Schedule Endpoints

### GET /api/v1/organizations/:orgId/attractions/:attractionId/schedules

Get schedules for an attraction.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `start_date`, `end_date` - Date range (required)
- `staff_id` - Filter by staff
- `role` - Filter by role
- `zone_id` - Filter by zone
- `status` - Filter by status
- `view` - calendar, list, or staff

**Response (200):**
```json
{
  "data": [
    {
      "id": "schedule_uuid",
      "date": "2024-10-25",
      "start_time": "17:00",
      "end_time": "23:00",
      "break_minutes": 30,
      "role": "scare_actor",
      "status": "confirmed",
      "staff": {
        "id": "staff_uuid",
        "name": "John Doe",
        "avatar_url": "https://..."
      },
      "zone": {
        "id": "zone_uuid",
        "name": "Zombie Woods",
        "color": "#228B22"
      },
      "notes": "Lead actor for main trail",
      "has_conflict": false
    }
  ],
  "summary": {
    "total_shifts": 45,
    "total_hours": 270,
    "by_role": {
      "scare_actor": 30,
      "security": 10,
      "box_office": 5
    },
    "unfilled": 3
  }
}
```

---

### POST /api/v1/organizations/:orgId/attractions/:attractionId/schedules

Create a schedule entry.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "staff_id": "staff_uuid",
  "date": "2024-10-25",
  "start_time": "17:00",
  "end_time": "23:00",
  "role": "scare_actor",
  "zone_id": "zone_uuid",
  "break_minutes": 30,
  "notes": "Lead actor for main trail"
}
```

**Response (201):**
```json
{
  "id": "schedule_uuid",
  "date": "2024-10-25",
  "start_time": "17:00",
  "end_time": "23:00",
  "role": "scare_actor",
  "status": "scheduled",
  "staff": {
    "id": "staff_uuid",
    "name": "John Doe"
  },
  "conflicts": []
}
```

**Errors:**
- `400` - Staff unavailable at requested time
- `409` - Staff already scheduled (conflict)

---

### PATCH /api/v1/organizations/:orgId/schedules/:scheduleId

Update a schedule.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "start_time": "18:00",
  "end_time": "00:00",
  "zone_id": "different_zone_uuid"
}
```

**Response (200):** Updated schedule object

---

### DELETE /api/v1/organizations/:orgId/schedules/:scheduleId

Delete a schedule.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Response (200):**
```json
{
  "message": "Schedule deleted",
  "id": "schedule_uuid"
}
```

---

### POST /api/v1/organizations/:orgId/schedules/bulk

Bulk create schedules.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "schedules": [
    {
      "staff_id": "staff_uuid_1",
      "date": "2024-10-25",
      "start_time": "17:00",
      "end_time": "23:00",
      "role": "scare_actor"
    },
    {
      "staff_id": "staff_uuid_2",
      "date": "2024-10-25",
      "start_time": "17:00",
      "end_time": "23:00",
      "role": "security"
    }
  ]
}
```

**Response (201):**
```json
{
  "created": 2,
  "failed": 0,
  "conflicts": []
}
```

---

## Availability Endpoints

### GET /api/v1/organizations/:orgId/staff/:staffId/availability

Get staff availability.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `start_date`, `end_date` - Date range
- `include_recurring` - Include recurring availability

**Response (200):**
```json
{
  "recurring": [
    {
      "id": "avail_uuid",
      "day_of_week": 5,
      "day_name": "Friday",
      "start_time": "17:00",
      "end_time": "23:00",
      "availability_type": "available",
      "effective_from": "2024-09-01",
      "effective_until": "2024-11-30"
    }
  ],
  "specific": [
    {
      "id": "avail_uuid",
      "date": "2024-10-31",
      "availability_type": "preferred",
      "start_time": "16:00",
      "end_time": "02:00",
      "reason": "Want to work Halloween"
    }
  ],
  "time_off": [
    {
      "id": "avail_uuid",
      "date": "2024-10-28",
      "availability_type": "time_off_approved",
      "reason": "Family event"
    }
  ]
}
```

---

### PUT /api/v1/organizations/:orgId/staff/:staffId/availability

Set availability (replaces).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "recurring": [
    {
      "day_of_week": 5,
      "start_time": "17:00",
      "end_time": "23:00",
      "availability_type": "available"
    },
    {
      "day_of_week": 6,
      "start_time": "16:00",
      "end_time": "00:00",
      "availability_type": "available"
    }
  ],
  "effective_from": "2024-09-01",
  "effective_until": "2024-11-30"
}
```

---

### POST /api/v1/organizations/:orgId/staff/:staffId/availability

Add single availability entry.

**Request:**
```json
{
  "date": "2024-10-31",
  "start_time": "16:00",
  "end_time": "02:00",
  "availability_type": "preferred"
}
```

---

### POST /api/v1/organizations/:orgId/staff/:staffId/time-off

Request time off.

**Request:**
```json
{
  "start_date": "2024-10-28",
  "end_date": "2024-10-28",
  "reason": "Family event"
}
```

**Response (201):**
```json
{
  "id": "request_uuid",
  "status": "time_off_pending",
  "dates": ["2024-10-28"],
  "message": "Time off request submitted for approval"
}
```

---

### POST /api/v1/organizations/:orgId/time-off/:requestId/approve

Approve time off request.

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Response (200):**
```json
{
  "id": "request_uuid",
  "status": "time_off_approved"
}
```

---

## Shift Template Endpoints

### GET /api/v1/organizations/:orgId/attractions/:attractionId/shift-templates

List shift templates.

**Response (200):**
```json
{
  "templates": [
    {
      "id": "template_uuid",
      "name": "Friday Night Actors",
      "day_of_week": 5,
      "day_name": "Friday",
      "start_time": "17:00",
      "end_time": "23:00",
      "role": "scare_actor",
      "zone": {
        "id": "zone_uuid",
        "name": "Zombie Woods"
      },
      "min_staff": 8,
      "max_staff": 12,
      "required_skills": ["acting"],
      "color": "#FF0000"
    }
  ]
}
```

---

### POST /api/v1/organizations/:orgId/attractions/:attractionId/shift-templates

Create shift template.

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "name": "Saturday Night Actors",
  "day_of_week": 6,
  "start_time": "16:00",
  "end_time": "00:00",
  "role": "scare_actor",
  "zone_id": "zone_uuid",
  "min_staff": 10,
  "max_staff": 15,
  "required_skills": ["acting"],
  "color": "#FF0000"
}
```

---

### POST /api/v1/organizations/:orgId/attractions/:attractionId/schedules/generate

Generate schedules from templates.

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "start_date": "2024-10-01",
  "end_date": "2024-10-31",
  "template_ids": ["template_uuid_1", "template_uuid_2"]
}
```

**Response (200):**
```json
{
  "created": 45,
  "message": "Generated 45 shift slots from templates"
}
```

---

## Shift Swap Endpoints

### POST /api/v1/organizations/:orgId/schedules/:scheduleId/swap-request

Request a shift swap.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "swap_type": "swap",
  "target_staff_id": "staff_uuid",
  "target_schedule_id": "schedule_uuid",
  "reason": "Have a conflict that day"
}
```

**Response (201):**
```json
{
  "id": "swap_uuid",
  "swap_type": "swap",
  "status": "pending",
  "original_shift": {
    "date": "2024-10-25",
    "start_time": "17:00",
    "end_time": "23:00"
  },
  "target_shift": {
    "date": "2024-10-26",
    "start_time": "17:00",
    "end_time": "23:00"
  },
  "target_staff": {
    "id": "staff_uuid",
    "name": "Jane Smith"
  }
}
```

---

### GET /api/v1/organizations/:orgId/swap-requests

List swap requests.

**Query Parameters:**
- `status` - Filter by status
- `staff_id` - Filter by staff

**Response (200):**
```json
{
  "data": [
    {
      "id": "swap_uuid",
      "swap_type": "swap",
      "status": "pending",
      "requested_by": {
        "id": "staff_uuid",
        "name": "John Doe"
      },
      "original_shift": {...},
      "target_shift": {...},
      "reason": "Have a conflict that day",
      "created_at": "2024-10-20T10:00:00Z"
    }
  ]
}
```

---

### POST /api/v1/organizations/:orgId/swap-requests/:swapId/approve

Approve swap request.

**Required Role:** `owner`, `admin`, or `manager`

**Response (200):**
```json
{
  "id": "swap_uuid",
  "status": "approved",
  "message": "Shifts have been swapped"
}
```

---

### POST /api/v1/organizations/:orgId/swap-requests/:swapId/reject

Reject swap request.

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "reason": "Not enough coverage for that day"
}
```

---

## Publishing Endpoints

### POST /api/v1/organizations/:orgId/attractions/:attractionId/schedules/publish

Publish schedules for a date range.

**Required Role:** `owner`, `admin`, or `manager`

**Request:**
```json
{
  "start_date": "2024-10-21",
  "end_date": "2024-10-27",
  "notify_staff": true
}
```

**Response (200):**
```json
{
  "published": 45,
  "staff_notified": 15,
  "message": "Schedule published for Oct 21-27"
}
```

---

### POST /api/v1/organizations/:orgId/schedules/:scheduleId/confirm

Staff confirms their shift.

**Response (200):**
```json
{
  "id": "schedule_uuid",
  "status": "confirmed",
  "confirmed_at": "2024-10-20T14:00:00Z"
}
```

---

## Staff View Endpoints

### GET /api/v1/organizations/:orgId/my-schedules

Get current user's schedules.

**Query Parameters:**
- `start_date`, `end_date` - Date range

**Response (200):**
```json
{
  "upcoming": [
    {
      "id": "schedule_uuid",
      "date": "2024-10-25",
      "start_time": "17:00",
      "end_time": "23:00",
      "attraction": {
        "id": "attraction_uuid",
        "name": "Terror Trail"
      },
      "zone": {
        "id": "zone_uuid",
        "name": "Zombie Woods"
      },
      "role": "scare_actor",
      "status": "confirmed",
      "can_swap": true
    }
  ],
  "summary": {
    "this_week_hours": 18,
    "upcoming_shifts": 4,
    "pending_swaps": 1
  }
}
```

---

## Conflict Detection

### GET /api/v1/organizations/:orgId/schedules/conflicts

Get scheduling conflicts.

**Required Role:** `owner`, `admin`, or `manager`

**Query Parameters:**
- `start_date`, `end_date` - Date range
- `resolved` - Include resolved

**Response (200):**
```json
{
  "conflicts": [
    {
      "id": "conflict_uuid",
      "conflict_type": "double_booked",
      "staff": {
        "id": "staff_uuid",
        "name": "John Doe"
      },
      "schedule": {
        "id": "schedule_uuid",
        "date": "2024-10-25",
        "start_time": "17:00"
      },
      "conflicting_schedule": {
        "id": "schedule_uuid_2",
        "date": "2024-10-25",
        "start_time": "18:00"
      },
      "resolved": false
    }
  ],
  "total": 3
}
```

---

## Reports

### GET /api/v1/organizations/:orgId/schedules/report

Get scheduling report.

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Query Parameters:**
- `start_date`, `end_date` - Date range
- `attraction_id` - Filter by attraction

**Response (200):**
```json
{
  "period": {
    "start": "2024-10-01",
    "end": "2024-10-31"
  },
  "summary": {
    "total_shifts": 450,
    "total_hours": 2700,
    "total_staff": 45,
    "avg_hours_per_staff": 60,
    "no_shows": 5,
    "swap_requests": 23,
    "swap_approval_rate": 0.87
  },
  "by_role": {
    "scare_actor": {"shifts": 300, "hours": 1800},
    "security": {"shifts": 100, "hours": 600}
  },
  "by_staff": [
    {
      "staff_id": "staff_uuid",
      "name": "John Doe",
      "hours": 72,
      "shifts": 12,
      "no_shows": 0
    }
  ]
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| SCHEDULE_NOT_FOUND | 404 | Schedule doesn't exist |
| SCHEDULE_CONFLICT | 409 | Staff already scheduled |
| STAFF_UNAVAILABLE | 400 | Staff marked unavailable |
| SCHEDULE_LOCKED | 400 | Schedule is published/locked |
| SWAP_INVALID | 400 | Invalid swap request |
| SWAP_EXPIRED | 400 | Swap request expired |
| INSUFFICIENT_COVERAGE | 400 | Would leave shift unfilled |
