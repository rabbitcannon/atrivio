# Haunt Platform - F13 Analytics (Post-MVP)

**Created Date**: 2026-01-05
**Status**: Deferred (Post-MVP)
**Priority**: Low - Build after core operations are stable and generating data

> **Note**: This feature was extracted from Part 3 MVP plan. Analytics provides the most value after organizations have accumulated operational data from at least one season.

---

## Overview

Comprehensive reporting and metrics dashboard aggregating data from all platform features (ticketing, check-in, staff time tracking, scheduling, inventory, queue, notifications).

### Why Deferred?

| Reason | Explanation |
|--------|-------------|
| **No data yet** | New orgs have nothing to analyze until they've run events |
| **Dependencies** | Requires F7-F12 to be complete and generating data |
| **Infrastructure overhead** | Materialized views, cron jobs, aggregation logic |
| **User priority** | First-season operators focus on "does it work?" not analytics |

---

## Database Schema

### Tables

| Table | Purpose | Columns |
|-------|---------|---------|
| `daily_metrics` | Aggregated daily performance | org_id, date, revenue, tickets_sold, check_ins, etc. |
| `hourly_metrics` | Detailed hourly breakdown | org_id, hour, metrics by hour |
| `ticket_type_metrics` | Per-ticket-type performance | ticket_type_id, sales, revenue, redemption_rate |
| `promo_metrics` | Promo code effectiveness | promo_code_id, uses, revenue_impact, conversion_rate |
| `staff_metrics` | Staff hours and productivity | staff_id, hours_worked, shifts_completed, etc. |
| `saved_reports` | Pre-configured report templates | org_id, name, config, schedule |

### ERD Reference
See `docs/features/F13-analytics/ERD.md` for detailed schema design.

### Technical Considerations

- **Materialized Views**: Use for expensive aggregations to avoid query performance issues
- **Cron Jobs**: Daily aggregation jobs for metrics (run during off-peak hours)
- **Data Retention**: Archive old hourly metrics after 90 days, keep daily metrics longer
- **Export Formats**: CSV, PDF report generation

---

## API Design

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/organizations/:orgId/analytics/dashboard` | Main dashboard metrics |
| GET | `/api/v1/organizations/:orgId/analytics/revenue` | Revenue breakdown |
| GET | `/api/v1/organizations/:orgId/analytics/attendance` | Attendance and capacity |
| GET | `/api/v1/organizations/:orgId/analytics/tickets` | Ticket type performance |
| GET | `/api/v1/organizations/:orgId/analytics/staff` | Staff metrics |
| GET | `/api/v1/organizations/:orgId/analytics/promos` | Promo code effectiveness |
| GET | `/api/v1/organizations/:orgId/analytics/reports` | List saved reports |
| POST | `/api/v1/organizations/:orgId/analytics/reports` | Create saved report |
| GET | `/api/v1/organizations/:orgId/analytics/reports/:id/export` | Export report (CSV/PDF) |

### Query Parameters

All endpoints support:
- `start_date` / `end_date` - Date range filtering
- `attraction_id` - Filter by attraction
- `granularity` - `hourly` | `daily` | `weekly` | `monthly`

### Auth
- JWT + Roles required
- Minimum role: `manager` (configurable per report type)

---

## Frontend Pages

### Dashboard (`/[orgId]/analytics`)
- Overview cards: Revenue, Tickets Sold, Check-ins, Avg Wait Time
- Revenue trend chart (line graph)
- Attendance by day/hour heatmap
- Top performing ticket types

### Revenue (`/[orgId]/analytics/revenue`)
- Revenue breakdown by ticket type
- Revenue by attraction
- Promo code impact on revenue
- Refunds and adjustments

### Attendance (`/[orgId]/analytics/attendance`)
- Attendance over time
- Capacity utilization graphs
- Peak hours identification
- Check-in patterns

### Tickets (`/[orgId]/analytics/tickets`)
- Ticket type performance comparison
- Sales velocity charts
- Redemption rates
- Revenue per ticket type

### Staff (`/[orgId]/analytics/staff`)
- Hours worked summary
- Shift completion rates
- Overtime tracking
- Staff productivity metrics

### Reports (`/[orgId]/analytics/reports`)
- Saved report templates
- Schedule automated reports
- Export to CSV/PDF
- Share with team members

---

## Seed Data (for development/demo)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Daily Metrics | 60 | 2 months of daily data |
| Hourly Metrics | 200 | Detailed hourly breakdown |
| Ticket Type Metrics | 40 | Per-ticket-type performance |
| Promo Metrics | 20 | Promo code effectiveness |
| Staff Metrics | 50 | Staff performance data |
| Saved Reports | 5 | Pre-configured report templates |

### Demo Scenarios
- Dashboard shows revenue trends over a season
- Ticket type performance comparison reveals best sellers
- Staff hours and productivity tracking
- Peak attendance pattern identification

---

## Implementation Tasks

### Phase 1: Database
- [ ] Review and refine F13 Analytics ERD
- [ ] Write migration for analytics tables
- [ ] Create materialized views for aggregations
- [ ] Set up cron job infrastructure for daily aggregation
- [ ] Create seed data for development/demo

### Phase 2: API
- [ ] Build `modules/analytics` NestJS module
- [ ] Implement dashboard metrics endpoint
- [ ] Implement date range filtering
- [ ] Implement report generation
- [ ] Implement export functionality (CSV, PDF)
- [ ] Add aggregation job triggers

### Phase 3: Frontend
- [ ] Create analytics dashboard page
- [ ] Implement revenue and sales charts
- [ ] Implement attendance and capacity graphs
- [ ] Create ticket type performance views
- [ ] Build staff metrics dashboard
- [ ] Add saved reports management

### Phase 4: Testing
- [ ] E2E tests for dashboard loading
- [ ] E2E tests for date range filtering
- [ ] E2E tests for export functionality
- [ ] Performance tests for aggregation queries

---

## Dependencies

### Required Features (must be complete)
- F7a Time Tracking - Staff hours data
- F7b Scheduling - Shift data
- F8 Ticketing - Sales and revenue data
- F9 Check-In - Attendance data
- F10 Inventory - Asset utilization (optional)
- F11 Virtual Queue - Wait time data (optional)
- F12 Notifications - Delivery metrics (optional)

### Infrastructure
- Cron job scheduler (pg_cron or external)
- PDF generation library
- Charting library (Recharts or similar)

---

## Feature Flag

```sql
INSERT INTO feature_flags (key, name, description, enabled, metadata)
VALUES (
  'analytics',
  'Analytics Dashboard',
  'Comprehensive reporting and metrics',
  false,
  '{"tier": "pro", "module": true}'
);
```

---

## When to Implement

**Recommended timing**: After first customer completes a full season (3+ months of data)

**Signals that it's time**:
- Customers asking for reporting features
- Enough historical data exists to be meaningful
- Core operations (ticketing, check-in, scheduling) are stable
- Team has bandwidth for infrastructure work (cron jobs, materialized views)

---

## References

- ERD: `docs/features/F13-analytics/ERD.md`
- Part 3 Plan: `.claude/plans/mvp-implementation-part-3.md`
- Feature Roadmap: `.claude/plans/feature-roadmap.md`
