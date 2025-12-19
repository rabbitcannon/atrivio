# F11: Virtual Queue - API Design

## Base URL

```
/api/v1/attractions/:attractionSlug/queue     (Public)
/api/v1/organizations/:orgId/queues (Admin)
```

## Public Queue Endpoints

### POST /api/v1/attractions/:attractionSlug/queue/join

Join the virtual queue.

**Request:**
```json
{
  "guest_name": "John Doe",
  "guest_phone": "+1234567890",
  "party_size": 4,
  "ticket_id": "ticket_uuid"
}
```

**Response (201):**
```json
{
  "confirmation_code": "ABC123",
  "position": 45,
  "estimated_wait_minutes": 25,
  "estimated_time": "2024-10-25T20:30:00Z",
  "party_size": 4,
  "status": "waiting",
  "check_status_url": "https://attraction.app/q/ABC123"
}
```

### GET /api/v1/attractions/:attractionSlug/queue/status/:confirmationCode

Check queue position.

**Response (200):**
```json
{
  "confirmation_code": "ABC123",
  "position": 12,
  "estimated_wait_minutes": 8,
  "status": "waiting",
  "party_size": 4,
  "joined_at": "2024-10-25T20:05:00Z",
  "queue_info": {
    "current_wait": 15,
    "people_ahead": 45,
    "batches_ahead": 5
  }
}
```

### DELETE /api/v1/attractions/:attractionSlug/queue/:confirmationCode

Leave the queue.

**Response (200):**
```json
{
  "message": "You have left the queue",
  "confirmation_code": "ABC123"
}
```

### GET /api/v1/attractions/:attractionSlug/queue/info

Get queue info (no auth).

**Response (200):**
```json
{
  "is_open": true,
  "current_wait_minutes": 25,
  "people_in_queue": 120,
  "status": "accepting",
  "message": "Queue is open! Current wait ~25 minutes."
}
```

---

## Admin Queue Endpoints

### GET /api/v1/organizations/:orgId/attractions/:attractionId/queue/entries

List queue entries.

**Query Parameters:**
- `status` - Filter by status
- `search` - Search by name/code

**Response (200):**
```json
{
  "data": [
    {
      "id": "entry_uuid",
      "confirmation_code": "ABC123",
      "guest_name": "John Doe",
      "party_size": 4,
      "position": 1,
      "status": "waiting",
      "wait_minutes": 25,
      "joined_at": "2024-10-25T20:05:00Z"
    }
  ],
  "summary": {
    "total_waiting": 45,
    "total_served_today": 320,
    "avg_wait_minutes": 18
  }
}
```

### POST /api/v1/organizations/:orgId/queue/entries/:entryId/call

Call guest to enter.

**Response (200):**
```json
{
  "id": "entry_uuid",
  "status": "called",
  "called_at": "2024-10-25T20:30:00Z",
  "notification_sent": true
}
```

### POST /api/v1/organizations/:orgId/queue/entries/:entryId/check-in

Mark guest as checked in.

**Response (200):**
```json
{
  "id": "entry_uuid",
  "status": "checked_in",
  "total_wait_minutes": 25
}
```

### POST /api/v1/organizations/:orgId/queue/entries/:entryId/no-show

Mark as no-show.

### PUT /api/v1/organizations/:orgId/queues/:queueId/config

Update queue settings.

**Request:**
```json
{
  "capacity_per_batch": 12,
  "batch_interval_minutes": 4,
  "notification_lead_minutes": 15
}
```

### POST /api/v1/organizations/:orgId/queues/:queueId/pause

Pause queue (stop accepting new entries).

### POST /api/v1/organizations/:orgId/queues/:queueId/resume

Resume queue.

### GET /api/v1/organizations/:orgId/queues/:queueId/stats

Get queue statistics.

**Response (200):**
```json
{
  "today": {
    "total_joined": 450,
    "total_served": 385,
    "total_expired": 25,
    "total_left": 40,
    "avg_wait_minutes": 22,
    "max_wait_minutes": 45,
    "current_in_queue": 65
  },
  "by_hour": [
    {"hour": "18:00", "joined": 85, "served": 80, "avg_wait": 15}
  ]
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| QUEUE_CLOSED | 400 | Queue not accepting entries |
| QUEUE_FULL | 400 | Queue at max capacity |
| ENTRY_NOT_FOUND | 404 | Confirmation code invalid |
| ALREADY_IN_QUEUE | 409 | Already has active entry |
| ENTRY_EXPIRED | 400 | Entry has expired |
