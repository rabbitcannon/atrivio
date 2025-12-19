# F7: Staff Scheduling - UI Requirements

## Overview

Staff scheduling interfaces for creating shifts, managing availability, handling shift swaps, and publishing schedules.

## Pages & Routes

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/scheduling` | Schedule Dashboard | Overview & quick actions |
| `/scheduling/calendar` | Schedule Calendar | Visual schedule builder |
| `/scheduling/shifts` | Shifts List | All shifts management |
| `/scheduling/templates` | Shift Templates | Reusable shift patterns |
| `/scheduling/availability` | Availability Overview | Staff availability matrix |
| `/scheduling/swaps` | Swap Requests | Pending swap approvals |
| `/scheduling/publish` | Publish Schedule | Publish workflow |

### Staff Routes

| Route | Page | Description |
|-------|------|-------------|
| `/my/schedule` | My Schedule | Personal schedule view |
| `/my/availability` | My Availability | Set availability |
| `/my/swaps` | My Swap Requests | View/create swaps |

---

## Components

### Schedule Calendar

#### `<ScheduleCalendar />`
- **Views**: Day, Week, Month
- **Display**: Staff rows × time columns
- **Features**:
  - Drag to create shifts
  - Drag to move shifts
  - Resize to change duration
  - Color by role/position
  - Zoom in/out on timeline

#### `<CalendarToolbar />`
- **Controls**:
  - View toggle (Day/Week/Month)
  - Date navigation (prev/next/today)
  - Attraction filter
  - Role filter
  - Staff search
  - Publish button

#### `<ShiftBlock />`
- **Display**: Time range, position, staff name
- **States**: Draft, Published, Confirmed, Conflict
- **Actions**: Click to edit, drag to move
- **Indicators**: Overtime warning, conflict warning

#### `<UnassignedShiftsPanel />`
- **Display**: Shifts without staff assigned
- **Actions**: Drag to calendar to assign
- **Features**: Filter by role, sort by time

### Shift Management

#### `<ShiftForm />`
- **Fields**:
  - Date
  - Start Time, End Time
  - Position/Role
  - Staff (optional - can be unassigned)
  - Notes
  - Break Duration
- **Actions**: Save, Delete, Duplicate
- **Validation**: No overlaps for same staff

#### `<ShiftDetails />`
- **Display**: Full shift information
- **Sections**:
  - Time & Location
  - Assigned Staff (with contact)
  - Position Details
  - Notes
  - History (changes)
- **Actions**: Edit, Swap, Delete

#### `<BulkShiftCreator />`
- **Features**:
  - Create multiple shifts at once
  - Apply to date range
  - Repeat pattern (daily, weekly)
  - Copy from previous week
- **Actions**: Preview, Create All

### Shift Templates

#### `<TemplatesList />`
- **Display**: Grid of template cards
- **Actions**: Create, edit, apply, delete
- **Features**: Preview template structure

#### `<TemplateEditor />`
- **Display**: Mini calendar showing template pattern
- **Features**:
  - Define shift times by day of week
  - Set position requirements
  - Save as reusable template
- **Actions**: Save, Apply to dates

#### `<ApplyTemplateModal />`
- **Fields**:
  - Template selection
  - Date range to apply
  - Attraction selection
  - Override existing shifts?
- **Actions**: Preview, Apply

### Availability

#### `<AvailabilityCalendar />`
- **Display**: Week view with availability slots
- **Interaction**: Click/drag to mark available/unavailable
- **Features**:
  - Recurring availability (every Monday)
  - Exception dates
  - Preference levels (preferred, available, unavailable)

#### `<AvailabilityMatrix />`
- **Display**: Staff × Days grid
- **Cell Content**: Available hours or "Unavailable"
- **Features**:
  - Quick view of team availability
  - Identify coverage gaps
  - Export/print

#### `<AvailabilityForm />`
- **Fields**:
  - Day of week
  - Start time, End time
  - Recurring (yes/no)
  - Exception dates
- **Actions**: Save, Delete

### Shift Swaps

#### `<SwapRequestsList />`
- **Display**: Table/cards of swap requests
- **Columns**: Requester, Original shift, Proposed, Status
- **Actions**: Approve, Deny, View details
- **Features**: Filter by status, attraction

#### `<SwapRequestForm />`
- **Fields**:
  - My shift (to give up)
  - Trade type (swap with specific person, offer to anyone)
  - Target person (if swap)
  - Reason/notes
- **Actions**: Submit request

#### `<SwapRequestDetails />`
- **Display**: Both shifts side by side
- **Info**: Requester, acceptor, reason
- **Actions**: Approve (manager), Deny, Cancel

#### `<OpenShiftBoard />`
- **Display**: Shifts available for pickup
- **Features**: Filter by role, date
- **Actions**: Claim shift

### Schedule Publishing

#### `<PublishWorkflow />`
- **Steps**:
  1. Review unpublished changes
  2. Check for conflicts/issues
  3. Preview notifications
  4. Confirm and publish
- **Features**:
  - Conflict detection
  - Coverage analysis
  - Notification preview

#### `<ScheduleConflicts />`
- **Display**: List of detected issues
- **Types**:
  - Double-booked staff
  - Overtime violations
  - Missing required positions
  - Uncovered shifts
- **Actions**: Jump to conflict, ignore

#### `<PublishPreview />`
- **Display**: Summary of changes
- **Info**:
  - New shifts added
  - Shifts modified
  - Staff affected
  - Notifications to send

---

## User Flows

### Create Weekly Schedule Flow
```
[Schedule Calendar - Week View]
    │
    ▼
[Option 1: Manual Creation]
    │
    ├── Click + drag on calendar
    ├── Enter shift details
    ├── Assign staff
    └── Repeat for all shifts

[Option 2: Apply Template]
    │
    ├── Select template
    ├── Choose date range
    ├── Preview shifts
    └── Apply

[Option 3: Copy Previous Week]
    │
    ├── Select source week
    ├── Review shifts
    ├── Adjust as needed
    └── Confirm copy

    ▼
[Review Schedule]
    │
    ├── Check for conflicts
    ├── Verify coverage
    │
    ▼
[Publish Schedule]
    │
    ├── Review changes
    ├── Confirm notifications
    │
    ▼
[Schedule Published - Notifications Sent]
```

### Shift Swap Flow (Staff)
```
[My Schedule]
    │
    ▼
[Click Shift → Request Swap]
    │
    ▼
[Swap Request Form]
    │
    ├── Select swap type:
    │   ├── Swap with specific person
    │   │       │
    │   │       ▼
    │   │   [Select their shift]
    │   │
    │   └── Offer to anyone (Open shift)
    │
    ├── Add reason/notes
    │
    ▼
[Submit Request]
    │
    ▼
[Request Pending]
    │
    ├── Other staff accepts swap
    │       │
    │       ▼
    │   [Manager Approval Required?]
    │       │
    │       ├── Yes → [Manager Reviews → Approve/Deny]
    │       └── No → [Swap Completed]
    │
    └── Request expires or cancelled
```

### Set Availability Flow (Staff)
```
[My Availability Page]
    │
    ▼
[Week View - Click to Select Times]
    │
    ├── Click empty slot → Mark Available
    ├── Click available slot → Remove or Change
    ├── Drag to select range
    │
    ▼
[Set Recurring?]
    │
    ├── Yes → Applies to all future weeks
    └── No → This week only

    ▼
[Add Exceptions]
    │
    ├── Vacation dates
    ├── One-time unavailable
    │
    ▼
[Save Availability]
```

---

## State Management

### Schedule Store
```typescript
interface ScheduleState {
  // Calendar
  shifts: Shift[];
  view: 'day' | 'week' | 'month';
  currentDate: Date;
  attractionFilter: string | null;
  roleFilter: string | null;

  // Templates
  templates: ShiftTemplate[];

  // Swaps
  swapRequests: SwapRequest[];
  openShifts: Shift[];

  // Availability
  availability: Availability[];

  // Publishing
  unpublishedChanges: ShiftChange[];
  conflicts: Conflict[];

  isLoading: boolean;

  // Actions
  fetchShifts: (range: DateRange) => Promise<void>;
  createShift: (data: CreateShiftData) => Promise<Shift>;
  updateShift: (shiftId: string, data: UpdateShiftData) => Promise<void>;
  deleteShift: (shiftId: string) => Promise<void>;
  moveShift: (shiftId: string, newStart: Date) => Promise<void>;
  assignStaff: (shiftId: string, staffId: string) => Promise<void>;

  // Templates
  applyTemplate: (templateId: string, range: DateRange) => Promise<void>;
  copyWeek: (sourceWeek: Date, targetWeek: Date) => Promise<void>;

  // Swaps
  requestSwap: (data: SwapRequestData) => Promise<void>;
  approveSwap: (swapId: string) => Promise<void>;
  denySwap: (swapId: string, reason: string) => Promise<void>;
  claimOpenShift: (shiftId: string) => Promise<void>;

  // Publishing
  detectConflicts: () => Promise<Conflict[]>;
  publishSchedule: (range: DateRange) => Promise<void>;
}
```

---

## Validation Rules

### Shift
- **Start Time**: Required, valid time
- **End Time**: Required, after start time
- **Duration**: Max 12 hours (configurable)
- **Staff**: If assigned, must be available
- **Overlap**: No overlapping shifts for same staff

### Availability
- **Start Time**: Required
- **End Time**: Required, after start
- **Advance Notice**: Availability changes need X days notice

### Swap Request
- **Reason**: Required, min 10 characters
- **Advance Notice**: Request must be X hours before shift

---

## Responsive Design

### Mobile (< 640px)
- Day view by default
- Shift list instead of calendar grid
- Bottom sheet for shift details
- Swipe between days
- Floating action button for create

### Tablet (640px - 1024px)
- Week view with horizontal scroll
- Collapsible sidebar for filters
- Touch-friendly shift blocks

### Desktop (> 1024px)
- Full week/month views
- Drag-and-drop everywhere
- Keyboard shortcuts
- Split view (calendar + details)

---

## Accessibility

### Calendar
- Keyboard navigation between days/shifts
- Screen reader announces shift details
- High contrast shift colors
- Focus visible on all interactive elements

### Drag and Drop
- Keyboard alternatives for all drag operations
- Announcements for drag start/end
- Confirmation dialogs for moves

### Time Selection
- Keyboard accessible time pickers
- Clear labels for all time inputs
- Error announcements for invalid times

---

## UI Components (shadcn/ui)

### Required Components
- `Calendar` - Date navigation
- `Dialog` - Shift forms
- `Popover` - Quick actions
- `Badge` - Status indicators
- `Select` - Filters, role selection
- `Tabs` - View switching
- `DataTable` - Lists
- `Button` - Actions

### Custom Components
- `ScheduleCalendar` - Main calendar grid
- `ShiftBlock` - Draggable shift element
- `TimeRangePicker` - Start/end time selection
- `AvailabilityGrid` - Availability editor
- `ConflictAlert` - Conflict indicator
- `PublishButton` - Publish workflow trigger

### Third-Party
- `react-big-calendar` or custom implementation
- `@dnd-kit/core` - Drag and drop
- `date-fns` - Date manipulation

---

## Role-Based UI

### Visibility Matrix

| Feature | Owner/Admin | Manager | Staff |
|---------|-------------|---------|-------|
| View all schedules | ✅ | ✅ (assigned attractions) | Own only |
| Create shifts | ✅ | ✅ | ❌ |
| Edit shifts | ✅ | ✅ | ❌ |
| Publish schedule | ✅ | ✅ | ❌ |
| Approve swaps | ✅ | ✅ | ❌ |
| Request swap | ❌ | ❌ | ✅ |
| Set availability | ❌ | ❌ | ✅ |
| View availability | ✅ | ✅ | Own only |

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Double booking | Highlight conflict, prevent save |
| Overtime exceeded | Warning with override option |
| No staff available | Show availability gaps |
| Swap conflict | Block with explanation |
| Past shift edit | Block with message |
| Template overlap | Show conflicts, ask to override |

---

## Settings & Configuration

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/settings/scheduling/roles` | Schedule Roles | Manage role/position options |

### Schedule Roles

**Route:** `/settings/scheduling/roles`

**Purpose:** Manage schedule role/position options that staff can be assigned to for shifts.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Settings                                                              │
│                                                                         │
│ SCHEDULE ROLES                                         [ + Add Role ]   │
│                                                                         │
│ Define roles and positions that staff can be scheduled for.            │
│                                                                         │
│ PERFORMANCE                                                             │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  🎭  Actor              actor           System Default   ●   │    │
│ │ ⋮⋮  😱  Scare Actor        scare_actor     System Default   ●   │    │
│ │ ⋮⋮  🎤  Queue Actor        queue_actor     System Default   ●   │    │
│ │ ⋮⋮  🗣️  Guide              guide           Custom           ●   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ OPERATIONS                                                              │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  💄  Makeup Artist      makeup          System Default   ●   │    │
│ │ ⋮⋮  🎨  Costume Tech       costume_tech    System Default   ●   │    │
│ │ ⋮⋮  🔧  Technical          tech            System Default   ●   │    │
│ │ ⋮⋮  🔊  Sound/Lighting     av_tech         Custom           ●   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ GUEST SERVICES                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  🎫  Box Office         box_office      System Default   ●   │    │
│ │ ⋮⋮  🚗  Parking            parking         System Default   ●   │    │
│ │ ⋮⋮  🛡️  Security           security        System Default   ●   │    │
│ │ ⋮⋮  ℹ️  Guest Services     guest_services  System Default   ●   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ MANAGEMENT                                                              │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⋮⋮  👔  Shift Lead         shift_lead      System Default   ●   │    │
│ │ ⋮⋮  📋  Floor Manager      floor_manager   System Default   ●   │    │
│ │ ⋮⋮  🎬  Show Director      show_director   Custom           ○   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ ● Active  ○ Hidden                        [Drag to reorder]            │
└─────────────────────────────────────────────────────────────────────────┘
```

**Fields:**
- Name and description
- Category (performance, operations, guest services, management)
- Icon and color for calendar display
- Required skills (optional - link to staff skills)
- Default break duration

**Features:**
- Color-coded roles on schedule calendar
- Filter shifts by role
- Staffing requirements by role per time slot
- Skills matching for auto-assignment suggestions
