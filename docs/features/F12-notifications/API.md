# F12: Notifications - API Design

## Base URL

```
/api/v1/notifications
/api/v1/organizations/:orgId/notifications
```

## User Notification Endpoints

### GET /api/v1/notifications

Get user's notifications (in-app).

**Query Parameters:**
- `read` - Filter by read status
- `category` - Filter by category
- `limit` - Default 20

**Response (200):**
```json
{
  "data": [
    {
      "id": "notif_uuid",
      "category": "schedule",
      "title": "New Schedule Published",
      "body": "Your schedule for Oct 21-27 has been published",
      "read": false,
      "data": {
        "action": "view_schedule",
        "schedule_period_id": "period_uuid"
      },
      "created_at": "2024-10-20T10:00:00Z"
    }
  ],
  "unread_count": 5
}
```

### POST /api/v1/notifications/:id/read

Mark as read.

### POST /api/v1/notifications/read-all

Mark all as read.

### GET /api/v1/notifications/preferences

Get notification preferences.

**Response (200):**
```json
{
  "preferences": [
    {
      "category": "schedule",
      "category_name": "Schedule Updates",
      "email_enabled": true,
      "sms_enabled": true,
      "push_enabled": true
    },
    {
      "category": "marketing",
      "category_name": "Promotions",
      "email_enabled": false,
      "sms_enabled": false,
      "push_enabled": false
    }
  ]
}
```

### PUT /api/v1/notifications/preferences

Update preferences.

**Request:**
```json
{
  "preferences": [
    {
      "category": "marketing",
      "email_enabled": true,
      "sms_enabled": false,
      "push_enabled": false
    }
  ]
}
```

### POST /api/v1/notifications/devices

Register push device.

**Request:**
```json
{
  "device_token": "fcm_token_here",
  "platform": "ios",
  "device_name": "John's iPhone"
}
```

---

## Admin Notification Endpoints

### POST /api/v1/organizations/:orgId/notifications/send

Send notification (admin).

**Request:**
```json
{
  "template_key": "custom_announcement",
  "channel": "email",
  "recipients": {
    "type": "role",
    "roles": ["actor", "manager"],
    "attraction_id": "attraction_uuid"
  },
  "variables": {
    "message": "Don't forget staff meeting at 5 PM!"
  },
  "schedule_at": "2024-10-25T16:00:00Z"
}
```

**Response (200):**
```json
{
  "notification_id": "batch_uuid",
  "recipients_count": 45,
  "status": "queued",
  "scheduled_at": "2024-10-25T16:00:00Z"
}
```

### GET /api/v1/organizations/:orgId/notifications/templates

List notification templates.

**Response (200):**
```json
{
  "templates": [
    {
      "id": "template_uuid",
      "key": "ticket_confirmation",
      "name": "Ticket Confirmation",
      "channel": "email",
      "subject": "Your tickets for {{attraction_name}}",
      "variables": ["order_number", "guest_name", "attraction_name", "date", "time_slot"],
      "is_system": true
    }
  ]
}
```

### PUT /api/v1/organizations/:orgId/notifications/templates/:id

Customize template.

**Request:**
```json
{
  "subject": "🎃 Your Terror Trail Tickets!",
  "body": "Hey {{guest_name}}! Your tickets are confirmed..."
}
```

### GET /api/v1/organizations/:orgId/notifications/history

Get notification history.

**Query Parameters:**
- `channel`, `status`, `start_date`, `end_date`

**Response (200):**
```json
{
  "data": [
    {
      "id": "notif_uuid",
      "channel": "email",
      "recipient_email": "guest@example.com",
      "subject": "Your tickets for Terror Trail",
      "status": "delivered",
      "sent_at": "2024-10-20T10:00:00Z",
      "delivered_at": "2024-10-20T10:00:05Z",
      "opened_at": "2024-10-20T10:15:00Z"
    }
  ],
  "summary": {
    "total_sent": 1250,
    "delivered": 1200,
    "opened": 850,
    "clicked": 320,
    "failed": 50
  }
}
```

### GET /api/v1/organizations/:orgId/notifications/stats

Get notification statistics.

**Response (200):**
```json
{
  "period": "last_30_days",
  "by_channel": {
    "email": {"sent": 5000, "delivered": 4850, "open_rate": 0.68},
    "sms": {"sent": 2000, "delivered": 1980, "click_rate": 0.45},
    "push": {"sent": 3000, "delivered": 2800, "click_rate": 0.52}
  },
  "by_category": {
    "tickets": {"sent": 4000, "delivered": 3900},
    "schedule": {"sent": 2500, "delivered": 2450}
  }
}
```

---

## Webhook Endpoints (Internal)

### POST /api/v1/webhooks/sendgrid

Handle SendGrid webhook events (email delivery/open/click).

### POST /api/v1/webhooks/twilio

Handle Twilio webhook events (SMS delivery).

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| TEMPLATE_NOT_FOUND | 404 | Template doesn't exist |
| INVALID_RECIPIENT | 400 | Invalid email/phone |
| UNSUBSCRIBED | 400 | Recipient unsubscribed |
| RATE_LIMITED | 429 | Too many notifications |
| CHANNEL_DISABLED | 400 | Channel not configured |
