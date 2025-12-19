# F13: Analytics - UI Requirements

## Overview

Analytics and reporting interfaces for tracking ticket sales, revenue, attendance, staff performance, and operational metrics.

## Pages & Routes

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/analytics` | Analytics Dashboard | Overview & key metrics |
| `/analytics/revenue` | Revenue Reports | Financial analytics |
| `/analytics/attendance` | Attendance Reports | Visitor analytics |
| `/analytics/tickets` | Ticket Reports | Ticket performance |
| `/analytics/staff` | Staff Reports | Staff analytics |
| `/analytics/capacity` | Capacity Reports | Utilization analytics |
| `/analytics/promos` | Promo Reports | Promo code performance |
| `/analytics/reports` | Saved Reports | Saved & scheduled reports |
| `/analytics/export` | Export | Data export tools |

---

## Components

### Analytics Dashboard

#### `<AnalyticsDashboard />`
- **Sections**:
  - Period Selector
  - Key Metrics Summary
  - Revenue Chart
  - Attendance Chart
  - Top Performers
  - Quick Insights
- **Features**: Date range, attraction filter, compare periods

#### `<PeriodSelector />`
- **Presets**: Today, This Week, This Month, This Season, Custom
- **Custom**: Date range picker
- **Compare**: Toggle comparison to previous period
- **Features**: Quick preset buttons, calendar picker

#### `<MetricsSummary />`
- **Metrics**:
  - Gross Revenue
  - Net Revenue
  - Tickets Sold
  - Check-In Rate
  - Avg Order Value
  - Unique Customers
- **Features**: Trend arrows, comparison values

#### `<RevenueChart />`
- **Type**: Line or bar chart
- **Data**: Revenue over time
- **Options**: Gross/Net toggle, daily/weekly grouping
- **Features**: Hover details, zoom, export

#### `<AttendanceChart />`
- **Type**: Line or bar chart
- **Data**: Attendance over time
- **Options**: By day, by time slot
- **Features**: Overlay capacity line

#### `<QuickInsights />`
- **Display**: AI-generated insights
- **Examples**:
  - "Saturday 8pm slots are consistently sold out"
  - "VIP tickets up 25% from last week"
  - "Tuesday shows low attendance - consider closing"
- **Features**: Actionable recommendations

### Revenue Reports

#### `<RevenueReport />`
- **Sections**:
  - Summary (gross, discounts, refunds, net)
  - By Period (chart + table)
  - By Ticket Type (pie + table)
  - By Source (online vs box office)
  - By Payment Method
- **Features**: Drill-down, export

#### `<RevenueTable />`
- **Columns**: Period, Gross, Discounts, Refunds, Net, Orders
- **Features**: Sortable, totals row, expandable rows

#### `<RevenuePieChart />`
- **Data**: Revenue by category
- **Features**: Click to filter, legend

#### `<RevenueBreakdown />`
- **Display**: Waterfall chart
- **Flow**: Gross → Discounts → Refunds → Fees → Net
- **Features**: Visual fee breakdown

### Attendance Reports

#### `<AttendanceReport />`
- **Sections**:
  - Summary (sold, checked in, no-shows)
  - By Date
  - By Time Slot
  - Heatmap (day × hour)
  - Check-in Timeline
- **Features**: Filter by ticket type

#### `<AttendanceHeatmap />`
- **Display**: Day of week × Hour matrix
- **Data**: Attendance intensity
- **Colors**: Low → High gradient
- **Features**: Click for details

#### `<CheckInTimeline />`
- **Display**: Line chart of check-ins over night
- **Data**: Cumulative and per-slot
- **Features**: Overlay expected vs actual

#### `<NoShowAnalysis />`
- **Display**: No-show rate by segment
- **Breakdown**: By ticket type, day, time
- **Features**: Trend over time

### Ticket Reports

#### `<TicketReport />`
- **Sections**:
  - Performance by Type
  - Sales Trend
  - Pricing Analysis
  - Refund Analysis
- **Features**: Compare ticket types

#### `<TicketTypePerformance />`
- **Display**: Table with metrics per type
- **Columns**: Type, Sold, Revenue, Avg Price, Check-in Rate, Refund Rate
- **Features**: Sparklines for trend

#### `<PricingAnalysis />`
- **Display**: Price vs demand chart
- **Features**: Optimal pricing suggestions

### Staff Reports

#### `<StaffReport />`
- **Sections**:
  - Hours Summary
  - By Staff Member
  - By Role
  - Labor Cost Analysis
  - Performance Metrics
- **Features**: Date range, attraction filter

#### `<StaffHoursTable />`
- **Columns**: Name, Shifts, Hours, On-Time %, Check-ins (if applicable)
- **Features**: Sort, filter by role

#### `<LaborCostAnalysis />`
- **Metrics**: Total labor cost, revenue per labor hour
- **Chart**: Labor cost vs revenue correlation
- **Features**: Identify overstaffing

### Capacity Reports

#### `<CapacityReport />`
- **Sections**:
  - Utilization Summary
  - By Date
  - By Time Slot
  - Sold Out Analysis
  - Recommendations
- **Features**: Compare seasons

#### `<UtilizationChart />`
- **Display**: Capacity vs sold over time
- **Features**: Highlight sold-out periods

#### `<CapacityRecommendations />`
- **Display**: AI-generated suggestions
- **Examples**:
  - "Add capacity to Saturday 8pm"
  - "Consider closing Tuesday early"
  - "Peak demand at 7pm - adjust pricing"

### Promo Reports

#### `<PromoReport />`
- **Sections**:
  - Overall Impact
  - By Promo Code
  - ROI Analysis
  - Usage Patterns
- **Features**: Active vs all promos

#### `<PromoPerformanceTable />`
- **Columns**: Code, Uses, Discount Given, Revenue Generated, ROI
- **Features**: Sort by performance

#### `<PromoROIChart />`
- **Display**: Scatter plot of discount vs revenue
- **Features**: Identify best performers

### Saved Reports

#### `<SavedReportsList />`
- **Display**: Table of saved reports
- **Columns**: Name, Type, Schedule, Last Run
- **Actions**: Run now, edit, delete

#### `<SaveReportModal />`
- **Fields**:
  - Report Name
  - Report Type
  - Filters/Configuration
  - Schedule (none, daily, weekly, monthly)
  - Recipients (email list)
- **Actions**: Save, Cancel

#### `<ScheduledReportsManager />`
- **Display**: Scheduled reports with next run time
- **Actions**: Pause, edit schedule, test run

### Export

#### `<ExportPage />`
- **Options**:
  - Report Type (sales, attendance, staff, etc.)
  - Date Range
  - Format (CSV, Excel, PDF)
  - Filters
- **Actions**: Generate Export

#### `<ExportHistory />`
- **Display**: Recent exports
- **Actions**: Re-download (if available)

---

## User Flows

### View Dashboard Flow
```
[Analytics Dashboard]
    │
    ▼
[Select Period]
    │
    ├── Preset (Today, Week, Month, Season)
    └── Custom Date Range
    │
    ▼
[Select Attraction (if multiple)]
    │
    ▼
[Dashboard Loads with Data]
    │
    ├── Key Metrics
    ├── Charts
    ├── Insights
    │
    ▼
[Drill Down]
    │
    ├── Click metric → Detail report
    ├── Click chart point → Day detail
    └── Click insight → Related report
```

### Create Saved Report Flow
```
[Any Report Page]
    │
    ▼
[Configure Filters & Options]
    │
    ▼
[Save Report Button]
    │
    ▼
[Save Report Modal]
    │
    ├── Enter name
    ├── Set schedule (optional)
    │       ├── Daily, Weekly, Monthly
    │       └── Delivery time
    ├── Add recipients (optional)
    │
    ▼
[Save]
    │
    ▼
[Report Saved → Appears in Saved Reports]
    │
    ▼
[Scheduled reports run automatically]
```

### Export Data Flow
```
[Export Page]
    │
    ▼
[Select Report Type]
    │
    ├── Sales, Attendance, Staff, etc.
    │
    ▼
[Set Date Range]
    │
    ▼
[Apply Filters]
    │
    ├── By attraction, ticket type, etc.
    │
    ▼
[Select Format]
    │
    ├── CSV, Excel, PDF
    │
    ▼
[Generate Export]
    │
    ▼
[Processing...]
    │
    ▼
[Download Ready]
    │
    ├── Auto-download
    └── Link in export history
```

---

## State Management

### Analytics Store
```typescript
interface AnalyticsState {
  // Filters
  period: DateRange;
  attractionId: string | null;
  compareEnabled: boolean;
  comparePeriod: DateRange | null;

  // Dashboard
  dashboard: DashboardData | null;

  // Reports
  revenueReport: RevenueReport | null;
  attendanceReport: AttendanceReport | null;
  ticketReport: TicketReport | null;
  staffReport: StaffReport | null;
  capacityReport: CapacityReport | null;
  promoReport: PromoReport | null;

  // Saved Reports
  savedReports: SavedReport[];

  isLoading: boolean;

  // Actions
  setPeriod: (period: DateRange) => void;
  setAttraction: (attractionId: string | null) => void;
  toggleCompare: () => void;

  fetchDashboard: () => Promise<void>;
  fetchRevenueReport: () => Promise<void>;
  fetchAttendanceReport: () => Promise<void>;
  // ... other reports

  saveReport: (data: SaveReportData) => Promise<void>;
  runSavedReport: (reportId: string) => Promise<void>;
  deleteSavedReport: (reportId: string) => Promise<void>;

  exportReport: (options: ExportOptions) => Promise<string>; // returns download URL
}
```

---

## Validation Rules

### Saved Report
- **Name**: Required, 2-100 characters
- **Recipients**: Valid email format

### Export
- **Date Range**: Max 1 year
- **Format**: CSV, XLSX, or PDF

---

## Responsive Design

### Mobile (< 640px)
- Stacked metric cards
- Simplified charts
- Bottom sheet for filters
- Swipe between report sections

### Tablet (640px - 1024px)
- 2-column metric grid
- Charts with touch zoom
- Side panel for details

### Desktop (> 1024px)
- Full dashboard layout
- Interactive charts
- Split view for drill-down
- Keyboard shortcuts

---

## Accessibility

### Charts
- Data table alternative
- Color-blind friendly palette
- Keyboard navigation
- Screen reader descriptions

### Metrics
- Clear labels
- Comparison values readable
- Trend direction announced

### Filters
- Keyboard accessible
- Clear selection state
- Changes announced

---

## UI Components (shadcn/ui)

### Required Components
- `Card` - Metric cards
- `Tabs` - Report sections
- `Select` - Filters
- `Calendar` - Date picker
- `DataTable` - Report tables
- `Dialog` - Save report modal
- `Button` - Actions
- `Badge` - Status indicators

### Custom Components
- `PeriodSelector` - Date range + presets
- `MetricCard` - Metric with trend
- `HeatmapChart` - Day × hour heatmap
- `ComparisonToggle` - Compare periods toggle
- `ExportButton` - Export with format selection
- `InsightCard` - AI-generated insight

### Third-Party
- `recharts` or `chart.js` - Charts
- `react-day-picker` - Calendar
- `xlsx` - Excel export
- `jspdf` - PDF export

---

## Chart Types

### Line Charts
- Revenue over time
- Attendance over time
- Check-in timeline

### Bar Charts
- Revenue by category
- Attendance by day
- Staff hours

### Pie/Donut Charts
- Revenue by ticket type
- Attendance by source

### Heatmaps
- Attendance by day × hour
- Capacity utilization

### Scatter Plots
- Promo ROI analysis
- Price vs demand

### Waterfall Charts
- Revenue breakdown
- Fee analysis

---

## Performance Considerations

### Data Loading
- Lazy load report sections
- Cache common queries
- Incremental chart rendering

### Large Datasets
- Server-side aggregation
- Pagination for tables
- Sampling for charts

### Export
- Background processing for large exports
- Email delivery for big files
- Progress indicator

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| No data for period | Empty state with message |
| Report generation failed | Error with retry |
| Export too large | Suggest smaller date range |
| Saved report invalid | Show error, offer to edit |
| Comparison not available | Disable toggle, show tooltip |
