# F5: Platform Admin - UI Requirements

## Overview

Super admin interfaces for managing the entire platform, including organizations, users, feature flags, and system monitoring.

## Pages & Routes

### Platform Admin Routes (Super Admin Only)

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Admin Dashboard | Platform overview & stats |
| `/admin/organizations` | Organizations | All orgs management |
| `/admin/organizations/:orgId` | Org Details | Specific org management |
| `/admin/users` | Users | All users management |
| `/admin/users/:userId` | User Details | Specific user management |
| `/admin/feature-flags` | Feature Flags | Toggle platform features |
| `/admin/announcements` | Announcements | Platform-wide announcements |
| `/admin/audit-log` | Audit Log | System activity log |
| `/admin/settings` | Platform Settings | Global configuration |
| `/admin/support` | Support Queue | User support tickets |

---

## Components

### Admin Dashboard

#### `<AdminDashboard />`
- **Sections**:
  - Key Metrics (orgs, users, revenue, active attractions)
  - Growth Charts (new signups, MRR)
  - Active Now (live sessions, current events)
  - Recent Activity (audit log summary)
  - Alerts (issues requiring attention)
- **Features**:
  - Date range selector
  - Real-time updates
  - Quick action buttons

#### `<PlatformMetrics />`
- **Metrics**:
  - Total Organizations
  - Total Users
  - Active Attractions
  - Tickets Sold (today/month)
  - Platform Revenue
  - MRR/ARR
- **Features**: Comparison to previous period, sparkline charts

#### `<AlertsPanel />`
- **Alert Types**:
  - Failed payments
  - Expired certifications
  - System errors
  - Support tickets pending
- **Actions**: View details, dismiss, take action

### Organization Management

#### `<OrganizationsList />`
- **Display**: Table with org details
- **Columns**: Name, plan, members, attractions, created, status, MRR
- **Actions**: View, impersonate, suspend, delete
- **Features**:
  - Search by name, email
  - Filter by plan, status
  - Sort by any column
  - Export to CSV

#### `<OrganizationDetails />`
- **Sections**:
  - Overview (info, stats)
  - Members (list with roles)
  - Attractions (list with status)
  - Billing (plan, payments)
  - Activity (audit log filtered)
  - Notes (admin notes)
- **Actions**:
  - Edit org
  - Change plan
  - Impersonate owner
  - Suspend/Unsuspend
  - Delete org

#### `<ImpersonateButton />`
- **Action**: Log in as org owner
- **Features**:
  - Confirmation dialog
  - Audit logged
  - Banner showing impersonation mode
  - Quick exit button

### User Management

#### `<UsersList />`
- **Display**: Table with user details
- **Columns**: Name, email, orgs, created, last active, status
- **Actions**: View, impersonate, suspend, delete
- **Features**:
  - Search by name, email
  - Filter by status, org membership
  - Sort by any column

#### `<UserDetails />`
- **Sections**:
  - Profile Info
  - Organization Memberships
  - Sessions (active devices)
  - Activity Log
  - Support History
- **Actions**:
  - Edit user
  - Reset password
  - Revoke sessions
  - Impersonate
  - Suspend/Delete

### Feature Flags

#### `<FeatureFlagsList />`
- **Display**: Table of feature flags
- **Columns**: Name, description, status, rollout %, updated
- **Actions**: Toggle, edit, delete
- **Features**:
  - Group by category
  - Search
  - History log

#### `<FeatureFlagEditor />`
- **Fields**:
  - Name, Key, Description
  - Status (enabled/disabled)
  - Rollout Type (all, percentage, specific orgs)
  - Rollout Percentage
  - Specific Org IDs
  - Start/End Date (optional)
- **Actions**: Save, Reset, Delete

### Announcements

#### `<AnnouncementsList />`
- **Display**: List of announcements
- **Columns**: Title, type, status, target, created
- **Actions**: Create, edit, publish, archive

#### `<AnnouncementEditor />`
- **Fields**:
  - Title, Content (rich text)
  - Type (info, warning, critical)
  - Target (all, specific orgs, specific roles)
  - Display Location (banner, modal, dashboard)
  - Start Date, End Date
  - Dismissible (yes/no)
- **Actions**: Save draft, Publish, Archive

### Audit Log

#### `<AuditLogViewer />`
- **Display**: Searchable, filterable log
- **Columns**: Timestamp, user, action, resource, IP, details
- **Actions**: View details, export
- **Features**:
  - Date range filter
  - User filter
  - Action type filter
  - Resource type filter
  - Full-text search

#### `<AuditLogEntry />`
- **Display**: Expandable row with full details
- **Details**: Before/after values, metadata, request info

### Platform Settings

#### `<PlatformSettingsForm />`
- **Sections**:
  - General (platform name, support email)
  - Defaults (timezone, currency)
  - Limits (max orgs per user, max attractions per org)
  - Maintenance (maintenance mode toggle)
  - Integrations (API keys, webhooks)

---

## User Flows

### Impersonate User Flow
```
[User/Org Details Page]
    │
    ▼
[Impersonate Button]
    │
    ▼
[Confirmation Modal]
    │
    ├── "You are about to log in as [User]"
    ├── "This action will be logged"
    ├── [Cancel] [Confirm]
    │
    ▼
[Redirect to user's dashboard]
    │
    ▼
[Impersonation Banner Shown]
    │
    ├── "Viewing as [User] - [Exit Impersonation]"
    │
    ▼
[Exit Button → Return to Admin]
```

### Create Feature Flag Flow
```
[Feature Flags Page]
    │
    ▼
[Create Flag Button]
    │
    ▼
[Feature Flag Form]
    │
    ├── Basic Info (name, key, description)
    ├── Rollout Configuration
    │       ├── All Users
    │       ├── Percentage (0-100%)
    │       └── Specific Orgs (multi-select)
    ├── Schedule (optional start/end)
    │
    ▼
[Save → Flag Created (disabled by default)]
    │
    ▼
[Enable Flag Toggle]
```

### Suspend Organization Flow
```
[Org Details Page]
    │
    ▼
[Suspend Button]
    │
    ▼
[Suspension Modal]
    │
    ├── Reason (dropdown + text)
    ├── Duration (indefinite, 7d, 30d, custom)
    ├── Notify Owner (checkbox)
    ├── [Cancel] [Suspend]
    │
    ▼
[Org Status → Suspended]
    │
    ├── All members can't access
    ├── Public pages show "temporarily unavailable"
    │
    ▼
[Unsuspend Button available]
```

---

## State Management

### Admin Store
```typescript
interface AdminState {
  // Dashboard
  metrics: PlatformMetrics;
  alerts: Alert[];

  // Organizations
  organizations: Organization[];
  currentOrg: OrganizationDetails | null;

  // Users
  users: User[];
  currentUser: UserDetails | null;

  // Feature Flags
  featureFlags: FeatureFlag[];

  // Audit Log
  auditLog: AuditEntry[];
  auditFilters: AuditFilters;

  isLoading: boolean;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchOrganizations: (filters?: OrgFilters) => Promise<void>;
  fetchOrganization: (orgId: string) => Promise<void>;
  suspendOrganization: (orgId: string, reason: string) => Promise<void>;
  impersonateUser: (userId: string) => Promise<void>;
  toggleFeatureFlag: (flagId: string, enabled: boolean) => Promise<void>;
  fetchAuditLog: (filters: AuditFilters) => Promise<void>;
}
```

### Impersonation State
```typescript
interface ImpersonationState {
  isImpersonating: boolean;
  originalUser: User | null;
  impersonatedUser: User | null;
  exitImpersonation: () => Promise<void>;
}
```

---

## Validation Rules

### Feature Flag
- **Name**: Required, 2-100 characters
- **Key**: Required, snake_case, unique
- **Rollout %**: 0-100, integer
- **Org IDs**: Valid UUIDs if specified

### Announcement
- **Title**: Required, 5-200 characters
- **Content**: Required, max 5000 characters
- **End Date**: Must be after start date

### Organization Suspension
- **Reason**: Required, min 10 characters
- **Duration**: Valid selection or custom date

---

## Responsive Design

### Mobile (< 640px)
- Limited admin access (view only)
- Simplified dashboard cards
- Stacked metrics
- Bottom sheet for actions

### Tablet (640px - 1024px)
- Full admin functionality
- Collapsible sidebar
- Tables with horizontal scroll

### Desktop (> 1024px)
- Full table views
- Slide-over detail panels
- Split view for audit log
- Keyboard shortcuts

---

## Accessibility

### Data Tables
- Sortable column headers
- Row selection announced
- Action menus keyboard accessible
- Pagination announced

### Forms
- Clear labels and descriptions
- Error summary
- Focus management

### Impersonation Banner
- High contrast for visibility
- Announced to screen readers
- Keyboard accessible exit button

---

## UI Components (shadcn/ui)

### Required Components
- `DataTable` - All list views
- `Card` - Dashboard metrics
- `Tabs` - Detail page sections
- `Dialog` - Confirmation modals
- `Badge` - Status indicators
- `Switch` - Feature flag toggles
- `Select` - Filters, dropdowns
- `DateRangePicker` - Date filters
- `RichTextEditor` - Announcements

### Custom Components
- `ImpersonationBanner` - Fixed banner during impersonation
- `MetricCard` - Dashboard metric with trend
- `AuditEntry` - Expandable log entry
- `FeatureFlagRow` - Flag with inline toggle
- `AlertBadge` - Actionable alert indicator

---

## Security Considerations

### Access Control
- All routes require `super_admin` role
- Actions logged in audit trail
- Impersonation requires confirmation
- Sensitive actions require re-authentication

### Audit Trail
- All admin actions logged
- Include IP, user agent, before/after values
- Immutable log entries
- Export capability for compliance

### Rate Limiting
- Impersonation: 10/hour
- Bulk operations: 100/hour
- Export: 10/day

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Not super admin | Redirect to 403 page |
| Org not found | 404 with search suggestion |
| Impersonate self | Button disabled, tooltip explains |
| Delete active org | Block with active resources list |
| Feature flag key exists | Inline error with suggestion |
| Audit log timeout | Partial results with retry option |
