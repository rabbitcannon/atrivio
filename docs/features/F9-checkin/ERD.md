# F9: Check-In System - ERD

## Overview

Guest check-in system with barcode/QR scanning, waiver collection, and real-time capacity tracking.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          tickets                                 │
│                        (from F8)                                 │
│  └── checked_in_at, checked_in_by, status                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        check_ins                                 │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ ticket_id       UUID FK → tickets.id NOT NULL                    │
│ time_slot_id    UUID FK → time_slots.id                          │
│ station_id      UUID FK → check_in_stations.id                   │
│ checked_in_by   UUID FK → profiles.id NOT NULL                   │
│ check_in_time   TIMESTAMPTZ DEFAULT NOW()                        │
│ check_in_method check_in_method NOT NULL                         │
│ guest_count     INTEGER DEFAULT 1                                │
│ waiver_signed   BOOLEAN DEFAULT FALSE                            │
│ notes           TEXT                                             │
│ metadata        JSONB DEFAULT '{}'                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    check_in_stations                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ name            VARCHAR(100) NOT NULL                            │
│ location        VARCHAR(200)                                     │
│ device_id       VARCHAR(100)                                     │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ last_activity   TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    capacity_snapshots                            │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ timestamp       TIMESTAMPTZ DEFAULT NOW()                        │
│ current_count   INTEGER NOT NULL                                 │
│ capacity        INTEGER NOT NULL                                 │
│ wait_time_minutes INTEGER                                        │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      guest_waivers                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ ticket_id       UUID FK → tickets.id                             │
│ guest_name      VARCHAR(200) NOT NULL                            │
│ guest_email     VARCHAR(255)                                     │
│ guest_dob       DATE                                             │
│ is_minor        BOOLEAN DEFAULT FALSE                            │
│ guardian_name   VARCHAR(200)                                     │
│ guardian_email  VARCHAR(255)                                     │
│ waiver_type     VARCHAR(100) NOT NULL                            │
│ waiver_version  VARCHAR(50)                                      │
│ signed_at       TIMESTAMPTZ NOT NULL                             │
│ ip_address      INET                                             │
│ signature_data  TEXT                                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

```sql
CREATE TYPE check_in_method AS ENUM (
  'barcode_scan',
  'qr_scan',
  'manual_lookup',
  'order_number',
  'walk_up'
);
```

## Key Tables

### check_ins
Records each check-in event with method, station, and operator.

### check_in_stations
Physical or virtual check-in points for tracking and metrics.

### capacity_snapshots
Point-in-time capacity tracking for wait time estimation.

### guest_waivers
Liability waivers signed at check-in or online.

## Indexes

```sql
CREATE INDEX check_ins_attraction_time_idx ON check_ins(attraction_id, check_in_time DESC);
CREATE INDEX check_ins_ticket_idx ON check_ins(ticket_id);
CREATE INDEX check_ins_slot_idx ON check_ins(time_slot_id, check_in_time);
CREATE INDEX capacity_attraction_time_idx ON capacity_snapshots(attraction_id, timestamp DESC);
CREATE INDEX waivers_ticket_idx ON guest_waivers(ticket_id);
```

## Real-Time Capacity Function

```sql
CREATE OR REPLACE FUNCTION get_current_capacity(p_attraction_id UUID)
RETURNS TABLE (
  current_count INTEGER,
  capacity INTEGER,
  percentage NUMERIC,
  estimated_wait INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT c.ticket_id)::INTEGER as current_count,
    a.capacity,
    ROUND(COUNT(DISTINCT c.ticket_id)::NUMERIC / a.capacity * 100, 1),
    -- Estimate: 5 min per 10 people over 80% capacity
    CASE
      WHEN COUNT(DISTINCT c.ticket_id) > a.capacity * 0.8
      THEN ((COUNT(DISTINCT c.ticket_id) - a.capacity * 0.8) / 10 * 5)::INTEGER
      ELSE 0
    END
  FROM attractions a
  LEFT JOIN check_ins c ON c.attraction_id = a.id
    AND c.check_in_time > NOW() - INTERVAL '4 hours'
  WHERE a.id = p_attraction_id
  GROUP BY a.id, a.capacity;
END;
$$ LANGUAGE plpgsql;
```

## Business Rules

1. **Early Check-In**: Allow check-in 30 min before time slot.
2. **Late Check-In**: Allow check-in 15 min after time slot.
3. **Waiver Required**: Block check-in until waiver signed (configurable).
4. **Duplicate Prevention**: Prevent same ticket from checking in twice.
5. **Capacity Alerts**: Trigger alerts at 80%, 90%, 100% capacity.

## Dependencies

- **F8 Ticketing**: ticket references
- **F3 Attractions**: attraction_id, time_slot_id references
