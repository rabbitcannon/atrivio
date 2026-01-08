# F12: Notifications - ERD

## Overview

Multi-channel notification system supporting email, SMS, and push notifications for tickets, queues, schedules, and system alerts.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    notification_templates                        │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id                       │
│ key             VARCHAR(100) NOT NULL                            │
│ name            VARCHAR(200) NOT NULL                            │
│ description     TEXT                                             │
│ channel         notification_channel NOT NULL                    │
│ subject         VARCHAR(255)                                     │
│ body            TEXT NOT NULL                                    │
│ variables       TEXT[]                                           │
│ is_system       BOOLEAN DEFAULT FALSE                            │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, key, channel)                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       notifications                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id                       │
│ template_id     UUID FK → notification_templates.id              │
│ channel         notification_channel NOT NULL                    │
│ recipient_type  recipient_type NOT NULL                          │
│ recipient_id    UUID                                             │
│ recipient_email VARCHAR(255)                                     │
│ recipient_phone VARCHAR(20)                                      │
│ recipient_device_token TEXT                                      │
│ subject         VARCHAR(255)                                     │
│ body            TEXT NOT NULL                                    │
│ data            JSONB DEFAULT '{}'                               │
│ status          notification_status DEFAULT 'pending'            │
│ priority        INTEGER DEFAULT 0                                │
│ scheduled_at    TIMESTAMPTZ                                      │
│ sent_at         TIMESTAMPTZ                                      │
│ delivered_at    TIMESTAMPTZ                                      │
│ opened_at       TIMESTAMPTZ                                      │
│ clicked_at      TIMESTAMPTZ                                      │
│ failed_at       TIMESTAMPTZ                                      │
│ error           TEXT                                             │
│ retry_count     INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  notification_preferences                        │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ user_id         UUID FK → profiles.id NOT NULL                   │
│ org_id          UUID FK → organizations.id                       │
│ category        notification_category NOT NULL                   │
│ email_enabled   BOOLEAN DEFAULT TRUE                             │
│ sms_enabled     BOOLEAN DEFAULT FALSE                            │
│ push_enabled    BOOLEAN DEFAULT TRUE                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(user_id, org_id, category)                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      push_devices                                │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ user_id         UUID FK → profiles.id NOT NULL                   │
│ device_token    TEXT UNIQUE NOT NULL                             │
│ platform        device_platform NOT NULL                         │
│ device_name     VARCHAR(200)                                     │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ last_used_at    TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

```sql
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'in_app');

CREATE TYPE notification_status AS ENUM (
  'pending', 'queued', 'sent', 'delivered',
  'opened', 'clicked', 'failed', 'bounced', 'unsubscribed'
);

CREATE TYPE recipient_type AS ENUM ('user', 'customer', 'staff', 'guest');

CREATE TYPE notification_category AS ENUM (
  'tickets',        -- Order confirmations, reminders
  'queue',          -- Virtual queue updates
  'schedule',       -- Shift schedules, swaps
  'announcements',  -- Org-wide announcements
  'marketing',      -- Promotional emails
  'system'          -- Account, security
);

CREATE TYPE device_platform AS ENUM ('ios', 'android', 'web');
```

## Key Templates

| Key | Channel | Description |
|-----|---------|-------------|
| `ticket_confirmation` | email | Order confirmation |
| `ticket_reminder` | email, sms | Event reminder |
| `queue_joined` | sms | Queue confirmation |
| `queue_ready` | sms, push | Time to enter |
| `schedule_published` | email, push | New schedule |
| `shift_reminder` | sms, push | Shift reminder |
| `swap_requested` | email, push | Swap request |

## Template Variables

Common variables available in templates:
- `{{guest_name}}`, `{{customer_name}}`
- `{{order_number}}`, `{{ticket_number}}`
- `{{attraction_name}}`, `{{org_name}}`
- `{{date}}`, `{{time}}`, `{{time_slot}}`
- `{{queue_position}}`, `{{wait_time}}`
- `{{shift_date}}`, `{{shift_time}}`
- `{{unsubscribe_url}}`

## Dependencies

- **F1 Auth**: User profiles for preferences
- **F4 Staff**: Staff notifications
- **F8 Ticketing**: Order/ticket notifications
- **F11 Queue**: Queue notifications
