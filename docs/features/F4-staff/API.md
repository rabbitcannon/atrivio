# F4: Staff & Roles - API Design

## Overview

Staff management APIs for HR operations, skills tracking, certifications, and time entries.

## Base URL

```
/api/v1/organizations/:orgId/staff
```

## Staff Profile Endpoints

### GET /api/v1/organizations/:orgId/staff

List staff members.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Query Parameters:**
- `status` - Filter by status (active, inactive, etc.)
- `attraction_id` - Filter by attraction assignment
- `role` - Filter by org role
- `skill` - Filter by skill
- `search` - Search by name/email/employee_id
- `certification_expiring_days` - Staff with expiring certs

**Response (200):**
```json
{
  "data": [
    {
      "id": "staff_uuid",
      "user": {
        "id": "user_uuid",
        "email": "actor@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_url": "https://..."
      },
      "employee_id": "EMP001",
      "role": "actor",
      "status": "active",
      "employment_type": "seasonal",
      "hire_date": "2024-09-01",
      "attractions": [
        {
          "id": "attraction_uuid",
          "name": "Terror Trail",
          "is_primary": true
        }
      ],
      "skills": [
        {"skill": "acting", "level": 4},
        {"skill": "makeup", "level": 2}
      ],
      "certifications": {
        "valid": ["first_aid", "cpr"],
        "expiring_soon": ["background_check"],
        "expired": []
      }
    }
  ],
  "meta": {
    "total": 45,
    "by_status": {
      "active": 40,
      "inactive": 3,
      "on_leave": 2
    },
    "by_role": {
      "actor": 30,
      "manager": 5,
      "box_office": 10
    }
  }
}
```

---

### GET /api/v1/organizations/:orgId/staff/:staffId

Get staff member details.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, `hr`, or self

**Response (200):**
```json
{
  "id": "staff_uuid",
  "user": {
    "id": "user_uuid",
    "email": "actor@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "avatar_url": "https://..."
  },
  "employee_id": "EMP001",
  "role": "actor",
  "status": "active",
  "employment_type": "seasonal",
  "hire_date": "2024-09-01",
  "date_of_birth": "1995-05-15",
  "shirt_size": "L",
  "hourly_rate": 1500,
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "+1987654321",
    "relation": "Spouse"
  },
  "attractions": [
    {
      "id": "attraction_uuid",
      "name": "Terror Trail",
      "is_primary": true,
      "zones": [
        {"id": "zone_uuid", "name": "Zombie Woods"}
      ]
    }
  ],
  "skills": [
    {
      "skill": "acting",
      "level": 4,
      "endorsed_by": {
        "id": "user_uuid",
        "name": "Manager Mike"
      }
    }
  ],
  "certifications": [
    {
      "id": "cert_uuid",
      "type": "first_aid",
      "issued_at": "2024-01-15",
      "expires_at": "2026-01-15",
      "verified": true
    }
  ],
  "documents": [
    {
      "id": "doc_uuid",
      "type": "w4",
      "name": "W4 Form 2024",
      "uploaded_at": "2024-09-01"
    }
  ],
  "waivers": [
    {
      "type": "liability_waiver",
      "signed_at": "2024-09-01T12:00:00Z",
      "version": "2024-v1"
    }
  ],
  "time_summary": {
    "current_week_hours": 24.5,
    "current_month_hours": 68.0,
    "season_total_hours": 180.5
  },
  "notes": "Excellent actor, prefers zombie roles",
  "created_at": "2024-09-01T00:00:00Z"
}
```

---

### PATCH /api/v1/organizations/:orgId/staff/:staffId

Update staff member.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Request:**
```json
{
  "employee_id": "EMP001",
  "status": "active",
  "employment_type": "part_time",
  "hourly_rate": 1750,
  "shirt_size": "XL",
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "+1987654321",
    "relation": "Spouse"
  },
  "notes": "Updated notes"
}
```

**Response (200):** Updated staff object

---

### POST /api/v1/organizations/:orgId/staff/:staffId/terminate

Terminate staff member.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `hr`

**Request:**
```json
{
  "termination_date": "2024-11-15",
  "reason": "End of season",
  "notes": "Eligible for rehire"
}
```

**Response (200):**
```json
{
  "id": "staff_uuid",
  "status": "terminated",
  "termination_date": "2024-11-15"
}
```

---

## Attraction Assignment Endpoints

### PUT /api/v1/organizations/:orgId/staff/:staffId/attractions

Update attraction assignments.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Request:**
```json
{
  "assignments": [
    {
      "attraction_id": "attraction_uuid_1",
      "is_primary": true,
      "zones": ["zone_uuid_1", "zone_uuid_2"]
    },
    {
      "attraction_id": "attraction_uuid_2",
      "is_primary": false,
      "zones": []
    }
  ]
}
```

**Response (200):**
```json
{
  "assignments": [
    {
      "attraction_id": "attraction_uuid_1",
      "attraction_name": "Terror Trail",
      "is_primary": true,
      "zones": [
        {"id": "zone_uuid_1", "name": "Zombie Woods"},
        {"id": "zone_uuid_2", "name": "Chainsaw Alley"}
      ]
    }
  ]
}
```

---

## Skills Endpoints

### GET /api/v1/organizations/:orgId/staff/:staffId/skills

Get staff skills.

**Response (200):**
```json
{
  "skills": [
    {
      "id": "skill_uuid",
      "skill": "acting",
      "level": 4,
      "endorsed_by": {
        "id": "user_uuid",
        "name": "Manager Mike"
      },
      "created_at": "2024-09-15T00:00:00Z"
    }
  ]
}
```

---

### POST /api/v1/organizations/:orgId/staff/:staffId/skills

Add or update skill.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Request:**
```json
{
  "skill": "sfx_makeup",
  "level": 3,
  "notes": "Completed advanced workshop"
}
```

**Response (201):**
```json
{
  "id": "skill_uuid",
  "skill": "sfx_makeup",
  "level": 3,
  "endorsed_by": {
    "id": "user_uuid",
    "name": "Current User"
  }
}
```

---

### DELETE /api/v1/organizations/:orgId/staff/:staffId/skills/:skillId

Remove skill.

**Response (200):**
```json
{
  "message": "Skill removed"
}
```

---

## Certification Endpoints

### GET /api/v1/organizations/:orgId/staff/:staffId/certifications

Get staff certifications.

**Response (200):**
```json
{
  "certifications": [
    {
      "id": "cert_uuid",
      "type": "first_aid",
      "certificate_number": "FA-2024-12345",
      "issued_at": "2024-01-15",
      "expires_at": "2026-01-15",
      "days_until_expiry": 400,
      "verified_by": {
        "id": "user_uuid",
        "name": "HR Manager"
      },
      "document_url": "https://..."
    }
  ],
  "required": [
    {
      "type": "background_check",
      "status": "missing",
      "required_by": "Before first shift"
    }
  ]
}
```

---

### POST /api/v1/organizations/:orgId/staff/:staffId/certifications

Add certification.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Request:**
```json
{
  "type": "cpr",
  "certificate_number": "CPR-2024-67890",
  "issued_at": "2024-09-01",
  "expires_at": "2026-09-01"
}
```

---

### POST /api/v1/organizations/:orgId/staff/:staffId/certifications/:certId/verify

Verify a certification.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `hr`

**Response (200):**
```json
{
  "id": "cert_uuid",
  "verified": true,
  "verified_by": {
    "id": "user_uuid",
    "name": "HR Manager"
  },
  "verified_at": "2024-09-15T12:00:00Z"
}
```

---

## Document Endpoints

### POST /api/v1/organizations/:orgId/staff/:staffId/documents

Upload document.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Fields:**
- `file` - Document file
- `type` - Document type (w4, i9, etc.)
- `name` - Document name
- `expires_at` - Optional expiration date

**Response (201):**
```json
{
  "id": "doc_uuid",
  "type": "w4",
  "name": "W4 Form 2024",
  "file_url": "https://...",
  "uploaded_by": "HR Manager",
  "created_at": "2024-09-01T00:00:00Z"
}
```

---

### GET /api/v1/organizations/:orgId/staff/:staffId/documents

List documents.

**Response (200):**
```json
{
  "documents": [
    {
      "id": "doc_uuid",
      "type": "w4",
      "name": "W4 Form 2024",
      "file_url": "https://...",
      "file_size": 125000,
      "uploaded_by": "HR Manager",
      "created_at": "2024-09-01T00:00:00Z"
    }
  ]
}
```

---

### DELETE /api/v1/organizations/:orgId/staff/:staffId/documents/:docId

Delete document.

**Response (200):**
```json
{
  "message": "Document deleted"
}
```

---

## Time Entry Endpoints

### POST /api/v1/organizations/:orgId/staff/:staffId/time/clock-in

Clock in.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "attraction_id": "attraction_uuid"
}
```

**Response (201):**
```json
{
  "id": "entry_uuid",
  "clock_in": "2024-10-25T17:30:00Z",
  "attraction": {
    "id": "attraction_uuid",
    "name": "Terror Trail"
  },
  "status": "pending"
}
```

**Errors:**
- `400` - Already clocked in

---

### POST /api/v1/organizations/:orgId/staff/:staffId/time/clock-out

Clock out.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "break_minutes": 30,
  "notes": "Extended shift for Halloween"
}
```

**Response (200):**
```json
{
  "id": "entry_uuid",
  "clock_in": "2024-10-25T17:30:00Z",
  "clock_out": "2024-10-26T01:00:00Z",
  "break_minutes": 30,
  "total_hours": 7.0,
  "status": "pending"
}
```

---

### GET /api/v1/organizations/:orgId/staff/:staffId/time

Get time entries.

**Query Parameters:**
- `start_date` - Range start
- `end_date` - Range end
- `status` - Filter by status

**Response (200):**
```json
{
  "entries": [
    {
      "id": "entry_uuid",
      "date": "2024-10-25",
      "clock_in": "2024-10-25T17:30:00Z",
      "clock_out": "2024-10-26T01:00:00Z",
      "break_minutes": 30,
      "total_hours": 7.0,
      "attraction": {
        "id": "attraction_uuid",
        "name": "Terror Trail"
      },
      "status": "approved",
      "approved_by": "Manager Mike"
    }
  ],
  "summary": {
    "total_hours": 28.5,
    "total_entries": 4,
    "pending_approval": 1
  }
}
```

---

### PATCH /api/v1/organizations/:orgId/time-entries/:entryId

Update time entry (manager correction).

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Request:**
```json
{
  "clock_in": "2024-10-25T17:00:00Z",
  "clock_out": "2024-10-26T01:30:00Z",
  "notes": "Corrected start time"
}
```

---

### POST /api/v1/organizations/:orgId/time-entries/:entryId/approve

Approve time entry.

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Response (200):**
```json
{
  "id": "entry_uuid",
  "status": "approved",
  "approved_by": {
    "id": "user_uuid",
    "name": "Manager Mike"
  },
  "approved_at": "2024-10-26T10:00:00Z"
}
```

---

### POST /api/v1/organizations/:orgId/time-entries/bulk-approve

Bulk approve time entries.

**Required Role:** `owner`, `admin`, `manager`, or `hr`

**Request:**
```json
{
  "entry_ids": ["entry_uuid_1", "entry_uuid_2", "entry_uuid_3"]
}
```

**Response (200):**
```json
{
  "approved": 3,
  "failed": 0
}
```

---

## Waiver Endpoints

### POST /api/v1/organizations/:orgId/staff/:staffId/waivers

Record signed waiver.

**Request:**
```json
{
  "waiver_type": "liability_waiver",
  "waiver_version": "2024-v1",
  "signature_data": "base64_signature_image"
}
```

**Response (201):**
```json
{
  "id": "waiver_uuid",
  "waiver_type": "liability_waiver",
  "signed_at": "2024-09-01T12:00:00Z",
  "expires_at": "2025-09-01"
}
```

---

## Bulk Operations

### POST /api/v1/organizations/:orgId/staff/bulk-import

Import staff from CSV.

**Required Role:** `owner`, `admin`, or `hr`

**Request:** CSV file upload

**Response (200):**
```json
{
  "imported": 25,
  "skipped": 2,
  "errors": [
    {"row": 5, "error": "Invalid email format"},
    {"row": 12, "error": "Duplicate employee_id"}
  ]
}
```

---

### GET /api/v1/organizations/:orgId/staff/export

Export staff to CSV.

**Required Role:** `owner`, `admin`, or `hr`

**Query Parameters:**
- `format` - csv or xlsx
- `include` - Comma-separated: profile,skills,certifications,time

**Response:** File download

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| STAFF_NOT_FOUND | 404 | Staff member not found |
| STAFF_ALREADY_CLOCKED_IN | 400 | Already has active time entry |
| STAFF_NOT_CLOCKED_IN | 400 | No active time entry to clock out |
| STAFF_FORBIDDEN | 403 | No permission |
| CERT_EXPIRED | 400 | Certification has expired |
| SKILL_DUPLICATE | 409 | Skill already exists |
| DOCUMENT_TOO_LARGE | 400 | File exceeds size limit |
