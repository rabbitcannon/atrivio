# F11: Virtual Queue - ERD

## Overview

Virtual queue system allowing guests to reserve their place in line and receive notifications when it's their turn.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       queue_configs                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ name            VARCHAR(100) NOT NULL                            │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ capacity_per_batch INTEGER DEFAULT 10                            │
│ batch_interval_minutes INTEGER DEFAULT 5                         │
│ max_wait_minutes INTEGER DEFAULT 120                             │
│ allow_rejoin    BOOLEAN DEFAULT FALSE                            │
│ require_check_in BOOLEAN DEFAULT TRUE                            │
│ notification_lead_minutes INTEGER DEFAULT 10                     │
│ settings        JSONB DEFAULT '{}'                               │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       queue_entries                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ queue_id        UUID FK → queue_configs.id NOT NULL              │
│ ticket_id       UUID FK → tickets.id                             │
│ confirmation_code VARCHAR(10) UNIQUE NOT NULL                    │
│ guest_name      VARCHAR(200)                                     │
│ guest_phone     VARCHAR(20)                                      │
│ guest_email     VARCHAR(255)                                     │
│ party_size      INTEGER DEFAULT 1                                │
│ position        INTEGER NOT NULL                                 │
│ status          queue_status DEFAULT 'waiting'                   │
│ joined_at       TIMESTAMPTZ DEFAULT NOW()                        │
│ estimated_time  TIMESTAMPTZ                                      │
│ notified_at     TIMESTAMPTZ                                      │
│ called_at       TIMESTAMPTZ                                      │
│ checked_in_at   TIMESTAMPTZ                                      │
│ expired_at      TIMESTAMPTZ                                      │
│ left_at         TIMESTAMPTZ                                      │
│ notes           TEXT                                             │
│ metadata        JSONB DEFAULT '{}'                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    queue_notifications                           │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ entry_id        UUID FK → queue_entries.id NOT NULL              │
│ type            notification_type NOT NULL                       │
│ channel         VARCHAR(20) NOT NULL                             │
│ message         TEXT NOT NULL                                    │
│ sent_at         TIMESTAMPTZ                                      │
│ delivered_at    TIMESTAMPTZ                                      │
│ failed_at       TIMESTAMPTZ                                      │
│ error           TEXT                                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      queue_stats                                 │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ queue_id        UUID FK → queue_configs.id NOT NULL              │
│ date            DATE NOT NULL                                    │
│ hour            INTEGER NOT NULL                                 │
│ entries_joined  INTEGER DEFAULT 0                                │
│ entries_served  INTEGER DEFAULT 0                                │
│ entries_expired INTEGER DEFAULT 0                                │
│ avg_wait_minutes NUMERIC                                         │
│ max_wait_minutes INTEGER                                         │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(queue_id, date, hour)                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

```sql
CREATE TYPE queue_status AS ENUM (
  'waiting',      -- In queue
  'notified',     -- Notification sent
  'called',       -- Called to enter
  'checked_in',   -- Entered attraction
  'expired',      -- Missed their turn
  'left',         -- Left queue voluntarily
  'no_show'       -- Didn't show after being called
);

CREATE TYPE notification_type AS ENUM (
  'joined',       -- Confirmation of joining
  'reminder',     -- Reminder of position
  'almost_ready', -- 10 min warning
  'ready',        -- Time to enter
  'final_call',   -- Last call before expiry
  'expired'       -- Slot expired
);
```

## Key Features

- **Position Tracking**: Real-time position and wait time estimates
- **SMS/Push Notifications**: Notify guests when it's their turn
- **Party Management**: Track party sizes for capacity planning
- **Analytics**: Track queue performance and wait times
- **Self-Service**: Guests can check position and leave queue

## Indexes

```sql
CREATE INDEX queue_entries_queue_status_idx ON queue_entries(queue_id, status);
CREATE INDEX queue_entries_position_idx ON queue_entries(queue_id, position)
  WHERE status = 'waiting';
CREATE UNIQUE INDEX queue_entries_confirmation_idx ON queue_entries(confirmation_code);
```

## Position Calculation

```sql
CREATE OR REPLACE FUNCTION calculate_wait_time(p_entry_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_queue RECORD;
  v_position INTEGER;
  v_ahead INTEGER;
BEGIN
  SELECT qc.*, qe.position INTO v_queue
  FROM queue_entries qe
  JOIN queue_configs qc ON qc.id = qe.queue_id
  WHERE qe.id = p_entry_id;

  SELECT COUNT(*) INTO v_ahead
  FROM queue_entries
  WHERE queue_id = v_queue.id
    AND status = 'waiting'
    AND position < v_queue.position;

  RETURN CEIL(v_ahead::NUMERIC / v_queue.capacity_per_batch)
         * v_queue.batch_interval_minutes;
END;
$$ LANGUAGE plpgsql;
```

## Dependencies

- **F8 Ticketing**: Optional ticket_id link
- **F12 Notifications**: SMS/push delivery
