# F13: Analytics - API Design

## Base URL

```
/api/v1/organizations/:orgId/analytics
```

## Dashboard Endpoints

### GET /analytics/dashboard

Get dashboard overview.

**Query Parameters:**
- `attraction_id` - Filter by attraction
- `period` - today, week, month, season, custom
- `start_date`, `end_date` - For custom period

**Response (200):**
```json
{
  "period": {
    "start": "2024-10-01",
    "end": "2024-10-31",
    "label": "October 2024"
  },
  "summary": {
    "gross_revenue": 875000,
    "net_revenue": 800000,
    "tickets_sold": 3500,
    "tickets_checked_in": 3200,
    "check_in_rate": 0.914,
    "orders": 1250,
    "avg_order_value": 700,
    "unique_customers": 1100,
    "new_customers": 850
  },
  "comparison": {
    "revenue_change": 0.12,
    "tickets_change": 0.08,
    "orders_change": 0.15
  },
  "charts": {
    "revenue_by_day": [
      {"date": "2024-10-01", "revenue": 25000},
      {"date": "2024-10-02", "revenue": 28000}
    ],
    "attendance_by_day": [
      {"date": "2024-10-01", "attendance": 120}
    ]
  }
}
```

---

## Revenue Reports

### GET /analytics/revenue

Get revenue report.

**Query Parameters:**
- `attraction_id`, `start_date`, `end_date`
- `group_by` - day, week, month

**Response (200):**
```json
{
  "summary": {
    "gross_revenue": 875000,
    "discounts": 50000,
    "refunds": 25000,
    "net_revenue": 800000,
    "platform_fees": 32000,
    "payout_amount": 768000
  },
  "by_period": [
    {
      "period": "2024-10-01",
      "gross": 25000,
      "discounts": 1500,
      "refunds": 500,
      "net": 23000
    }
  ],
  "by_ticket_type": [
    {
      "ticket_type": "General Admission",
      "quantity": 2500,
      "revenue": 625000,
      "percentage": 0.71
    },
    {
      "ticket_type": "VIP Fast Pass",
      "quantity": 500,
      "revenue": 225000,
      "percentage": 0.26
    }
  ],
  "by_source": {
    "online": {"orders": 1100, "revenue": 750000},
    "box_office": {"orders": 150, "revenue": 125000}
  }
}
```

---

## Attendance Reports

### GET /analytics/attendance

Get attendance report.

**Response (200):**
```json
{
  "summary": {
    "total_tickets_sold": 3500,
    "total_checked_in": 3200,
    "no_shows": 300,
    "check_in_rate": 0.914,
    "peak_attendance": 185,
    "avg_attendance": 120
  },
  "by_date": [
    {
      "date": "2024-10-25",
      "sold": 450,
      "checked_in": 420,
      "peak": 185
    }
  ],
  "by_time_slot": [
    {
      "slot": "7:00 PM",
      "avg_sold": 48,
      "avg_checked_in": 44,
      "check_in_rate": 0.92
    }
  ],
  "heatmap": {
    "Monday": {"18:00": 25, "19:00": 45, "20:00": 60},
    "Saturday": {"17:00": 50, "18:00": 85, "19:00": 95}
  }
}
```

---

## Ticket Reports

### GET /analytics/tickets

Get ticket performance report.

**Response (200):**
```json
{
  "by_type": [
    {
      "ticket_type_id": "type_uuid",
      "name": "General Admission",
      "sold": 2500,
      "revenue": 625000,
      "avg_price": 250,
      "check_in_rate": 0.92,
      "refund_rate": 0.02
    }
  ],
  "trends": {
    "best_seller": "General Admission",
    "fastest_growing": "VIP Fast Pass",
    "highest_margin": "Season Pass"
  }
}
```

---

## Promo Code Reports

### GET /analytics/promos

Get promo code performance.

**Response (200):**
```json
{
  "summary": {
    "total_usage": 450,
    "total_discount": 50000,
    "revenue_influenced": 225000,
    "avg_order_with_promo": 500
  },
  "by_code": [
    {
      "code": "SPOOKY20",
      "usage": 250,
      "discount_given": 30000,
      "revenue_generated": 150000,
      "roi": 4.0
    }
  ]
}
```

---

## Staff Reports

### GET /analytics/staff

Get staff performance report.

**Response (200):**
```json
{
  "summary": {
    "total_staff": 45,
    "total_hours": 2700,
    "avg_hours_per_staff": 60,
    "labor_cost": 40500,
    "revenue_per_labor_hour": 296
  },
  "by_staff": [
    {
      "staff_id": "staff_uuid",
      "name": "John Doe",
      "hours_worked": 72,
      "shifts": 12,
      "check_ins_processed": 450,
      "on_time_rate": 0.95
    }
  ],
  "by_role": [
    {
      "role": "scare_actor",
      "staff_count": 30,
      "total_hours": 1800,
      "avg_hours": 60
    }
  ]
}
```

---

## Capacity Reports

### GET /analytics/capacity

Get capacity utilization report.

**Response (200):**
```json
{
  "summary": {
    "total_capacity": 15000,
    "total_sold": 12500,
    "utilization_rate": 0.83,
    "sold_out_slots": 25,
    "low_utilization_slots": 40
  },
  "by_date": [
    {
      "date": "2024-10-25",
      "capacity": 500,
      "sold": 485,
      "utilization": 0.97
    }
  ],
  "by_time_slot": [
    {
      "slot": "7:00 PM",
      "avg_capacity": 50,
      "avg_sold": 45,
      "avg_utilization": 0.90
    }
  ],
  "recommendations": [
    "Consider adding capacity to Saturday 8PM slots (sold out 4 times)",
    "Tuesday 6PM slots underperforming at 45% utilization"
  ]
}
```

---

## Export Endpoints

### GET /analytics/export

Export report data.

**Query Parameters:**
- `report_type` - sales, attendance, staff, etc.
- `format` - csv, xlsx, pdf
- `start_date`, `end_date`

**Response:** File download

---

## Saved Reports

### POST /analytics/reports

Save report configuration.

**Request:**
```json
{
  "name": "Weekly Sales Summary",
  "report_type": "sales_summary",
  "config": {
    "attraction_ids": ["attraction_uuid"],
    "group_by": "day"
  },
  "schedule": "weekly",
  "recipients": ["manager@example.com"]
}
```

### GET /analytics/reports

List saved reports.

### POST /analytics/reports/:reportId/run

Run saved report now.

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_DATE_RANGE | 400 | End date before start date |
| DATE_RANGE_TOO_LARGE | 400 | Max 1 year range |
| NO_DATA_AVAILABLE | 404 | No data for period |
| EXPORT_TOO_LARGE | 400 | Too much data to export |
