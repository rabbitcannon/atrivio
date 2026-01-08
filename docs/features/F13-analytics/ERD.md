# F13: Analytics - ERD

## Overview

Analytics and reporting system tracking ticket sales, revenue, attendance, staff performance, and operational metrics.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      daily_metrics                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id                         │
│ date            DATE NOT NULL                                    │
│ tickets_sold    INTEGER DEFAULT 0                                │
│ tickets_checked_in INTEGER DEFAULT 0                             │
│ gross_revenue   INTEGER DEFAULT 0                                │
│ net_revenue     INTEGER DEFAULT 0                                │
│ refunds         INTEGER DEFAULT 0                                │
│ discounts       INTEGER DEFAULT 0                                │
│ avg_order_value INTEGER                                          │
│ unique_customers INTEGER DEFAULT 0                               │
│ new_customers   INTEGER DEFAULT 0                                │
│ peak_attendance INTEGER                                          │
│ avg_wait_time   INTEGER                                          │
│ staff_hours     NUMERIC                                          │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, attraction_id, date)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      hourly_metrics                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ timestamp       TIMESTAMPTZ NOT NULL                             │
│ tickets_sold    INTEGER DEFAULT 0                                │
│ check_ins       INTEGER DEFAULT 0                                │
│ revenue         INTEGER DEFAULT 0                                │
│ current_attendance INTEGER                                       │
│ queue_length    INTEGER                                          │
│ wait_time_minutes INTEGER                                        │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(attraction_id, timestamp)                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     ticket_type_metrics                          │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ ticket_type_id  UUID FK → ticket_types.id NOT NULL               │
│ date            DATE NOT NULL                                    │
│ quantity_sold   INTEGER DEFAULT 0                                │
│ revenue         INTEGER DEFAULT 0                                │
│ refunded        INTEGER DEFAULT 0                                │
│ check_in_rate   NUMERIC                                          │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(ticket_type_id, date)                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      promo_metrics                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ promo_code_id   UUID FK → promo_codes.id NOT NULL                │
│ date            DATE NOT NULL                                    │
│ usage_count     INTEGER DEFAULT 0                                │
│ orders_count    INTEGER DEFAULT 0                                │
│ revenue_generated INTEGER DEFAULT 0                              │
│ discount_given  INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(promo_code_id, date)                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      staff_metrics                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ staff_id        UUID FK → staff_profiles.id NOT NULL             │
│ attraction_id   UUID FK → attractions.id                         │
│ date            DATE NOT NULL                                    │
│ shifts_worked   INTEGER DEFAULT 0                                │
│ hours_worked    NUMERIC DEFAULT 0                                │
│ check_ins_processed INTEGER DEFAULT 0                            │
│ tickets_sold    INTEGER DEFAULT 0                                │
│ on_time_rate    NUMERIC                                          │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(staff_id, date)                                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     saved_reports                                │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ name            VARCHAR(200) NOT NULL                            │
│ report_type     report_type NOT NULL                             │
│ config          JSONB NOT NULL                                   │
│ schedule        report_schedule                                  │
│ recipients      TEXT[]                                           │
│ last_run_at     TIMESTAMPTZ                                      │
│ created_by      UUID FK → profiles.id NOT NULL                   │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

```sql
CREATE TYPE report_type AS ENUM (
  'sales_summary',
  'revenue_breakdown',
  'attendance',
  'ticket_type_performance',
  'promo_performance',
  'staff_hours',
  'staff_performance',
  'capacity_utilization',
  'custom'
);

CREATE TYPE report_schedule AS ENUM (
  'none', 'daily', 'weekly', 'monthly'
);
```

## Materialized Views

```sql
-- Season summary for quick dashboard
CREATE MATERIALIZED VIEW season_summary AS
SELECT
  a.org_id,
  a.id as attraction_id,
  ats.id as season_id,
  ats.name as season_name,
  SUM(dm.tickets_sold) as total_tickets,
  SUM(dm.gross_revenue) as total_revenue,
  SUM(dm.tickets_checked_in) as total_attendance,
  AVG(dm.avg_order_value) as avg_order_value,
  COUNT(DISTINCT dm.date) as operating_days
FROM attractions a
JOIN attraction_seasons ats ON ats.attraction_id = a.id
JOIN daily_metrics dm ON dm.attraction_id = a.id
  AND dm.date BETWEEN ats.start_date AND ats.end_date
GROUP BY a.org_id, a.id, ats.id, ats.name;

CREATE UNIQUE INDEX season_summary_idx ON season_summary(attraction_id, season_id);

-- Refresh command
REFRESH MATERIALIZED VIEW CONCURRENTLY season_summary;
```

## Indexes

```sql
CREATE INDEX daily_metrics_org_date_idx ON daily_metrics(org_id, date DESC);
CREATE INDEX daily_metrics_attraction_date_idx ON daily_metrics(attraction_id, date DESC);
CREATE INDEX hourly_metrics_attraction_time_idx ON hourly_metrics(attraction_id, timestamp DESC);
CREATE INDEX staff_metrics_staff_date_idx ON staff_metrics(staff_id, date DESC);
```

## Aggregation Jobs

Daily cron jobs to aggregate:
1. **Daily Metrics**: Aggregate from orders, check_ins, payments
2. **Ticket Type Metrics**: Per-ticket-type performance
3. **Staff Metrics**: From time_entries, check_ins, schedules
4. **Season Summary**: Refresh materialized view

## Dependencies

- **All features**: Aggregates data from across the platform
