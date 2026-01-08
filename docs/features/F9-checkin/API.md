# F9: Check-In System - API Design

## Base URL

```
/api/v1/organizations/:orgId/attractions/:attractionId/check-in
```

## Check-In Endpoints

### POST /check-in/scan

Scan and check in a ticket.

**Required Role:** `owner`, `admin`, `manager`, `box_office`, or `scanner`

**Request:**
```json
{
  "barcode": "ABC123DEF456",
  "station_id": "station_uuid",
  "method": "qr_scan"
}
```

**Response (200):**
```json
{
  "success": true,
  "ticket": {
    "id": "ticket_uuid",
    "ticket_number": "TER-T-12345678",
    "ticket_type": "General Admission",
    "guest_name": "John Doe",
    "time_slot": "7:00 PM - 7:30 PM"
  },
  "order": {
    "order_number": "TER-00001234",
    "ticket_count": 2,
    "checked_in_count": 1
  },
  "waiver_required": true,
  "waiver_signed": false,
  "check_in_id": "checkin_uuid"
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "TICKET_ALREADY_USED",
  "message": "Ticket was checked in at 7:15 PM",
  "checked_in_at": "2024-10-25T19:15:00Z"
}
```

---

### POST /check-in/lookup

Look up ticket manually.

**Request:**
```json
{
  "query": "customer@example.com",
  "type": "email"
}
```

**Response (200):**
```json
{
  "orders": [
    {
      "order_number": "TER-00001234",
      "customer_name": "John Doe",
      "tickets": [
        {
          "id": "ticket_uuid",
          "ticket_number": "TER-T-12345678",
          "ticket_type": "General Admission",
          "time_slot": "7:00 PM",
          "status": "valid",
          "checked_in": false
        }
      ]
    }
  ]
}
```

---

### POST /check-in/waiver

Record waiver signature.

**Request:**
```json
{
  "ticket_id": "ticket_uuid",
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_dob": "1990-05-15",
  "signature_data": "base64_signature",
  "waiver_version": "2024-v1"
}
```

---

### GET /check-in/capacity

Get current capacity.

**Response (200):**
```json
{
  "current_count": 145,
  "capacity": 200,
  "percentage": 72.5,
  "status": "normal",
  "estimated_wait_minutes": 0,
  "checked_in_last_hour": 85,
  "by_time_slot": [
    {
      "slot": "7:00 PM",
      "expected": 50,
      "checked_in": 42
    }
  ]
}
```

---

### GET /check-in/stats

Get check-in stats for today.

**Response (200):**
```json
{
  "date": "2024-10-25",
  "total_checked_in": 425,
  "total_expected": 500,
  "check_in_rate": 85,
  "by_hour": [
    {"hour": "18:00", "count": 85},
    {"hour": "19:00", "count": 120}
  ],
  "by_station": [
    {"station": "Main Entrance", "count": 280},
    {"station": "VIP Gate", "count": 145}
  ],
  "avg_check_in_time_seconds": 12
}
```

---

### GET /check-in/queue

Get check-in queue (pending arrivals).

**Query Parameters:**
- `time_slot_id` - Filter by slot
- `status` - pending, late, no_show

**Response (200):**
```json
{
  "pending": [
    {
      "ticket_id": "ticket_uuid",
      "guest_name": "John Doe",
      "time_slot": "7:00 PM",
      "status": "pending",
      "minutes_until": 15
    }
  ],
  "late": [
    {
      "ticket_id": "ticket_uuid_2",
      "guest_name": "Jane Smith",
      "time_slot": "6:30 PM",
      "status": "late",
      "minutes_late": 10
    }
  ]
}
```

---

## Station Management

### GET /check-in/stations

List check-in stations.

**Response (200):**
```json
{
  "stations": [
    {
      "id": "station_uuid",
      "name": "Main Entrance",
      "location": "Front Gate",
      "is_active": true,
      "last_activity": "2024-10-25T19:30:00Z",
      "today_count": 280
    }
  ]
}
```

### POST /check-in/stations

Create station.

**Request:**
```json
{
  "name": "VIP Gate",
  "location": "Side Entrance",
  "device_id": "iPad-001"
}
```

---

## Walk-Up Sales

### POST /check-in/walk-up

Create walk-up ticket and check in immediately.

**Required Role:** `owner`, `admin`, `manager`, or `box_office`

**Request:**
```json
{
  "ticket_type_id": "type_uuid",
  "quantity": 2,
  "guest_names": ["Walk-in Guest 1", "Walk-in Guest 2"],
  "payment_method": "cash",
  "waiver_signed": true
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| TICKET_NOT_FOUND | 404 | Barcode not found |
| TICKET_ALREADY_USED | 400 | Already checked in |
| TICKET_EXPIRED | 400 | Past check-in window |
| TICKET_EARLY | 400 | Before check-in window |
| TICKET_VOIDED | 400 | Ticket was voided |
| WAIVER_REQUIRED | 400 | Must sign waiver first |
| CAPACITY_EXCEEDED | 400 | At max capacity |
