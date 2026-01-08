# F11: Virtual Queue - UI Requirements

## Overview

Virtual queue interfaces for guests to join queues remotely and for staff to manage queue flow and notifications.

## Pages & Routes

### Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/a/:slug/queue` | Join Queue | Public queue join page |
| `/q/:code` | Queue Status | Check position in queue |
| `/q/:code/leave` | Leave Queue | Confirm leaving queue |

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/queue` | Queue Dashboard | Overview & controls |
| `/queue/entries` | Queue Entries | All queue entries |
| `/queue/call` | Call Next | Calling interface |
| `/queue/settings` | Queue Settings | Configuration |
| `/queue/stats` | Queue Stats | Analytics |

---

## Components

### Public Queue Interface

#### `<JoinQueuePage />`
- **Sections**:
  - Current Wait Time Display
  - Queue Status (open/closed/paused)
  - Join Form
- **Features**:
  - Real-time wait estimate
  - Guest-friendly language
  - Mobile-optimized

#### `<JoinQueueForm />`
- **Fields**:
  - Name
  - Phone Number (for SMS)
  - Party Size
  - Ticket/Order # (optional link)
- **Actions**: Join Queue
- **Validation**: Valid phone, party size ≤ max

#### `<QueueStatusPage />`
- **Display**:
  - Current Position
  - Estimated Wait Time
  - Queue Length
  - Status Messages
- **Features**:
  - Real-time updates (WebSocket)
  - Progress indicator
  - Countdown when called
- **Actions**: Leave Queue, Get Directions

#### `<QueuePosition />`
- **Visual**: Large position number
- **Animation**: Updates with smooth transition
- **Status**:
  - Waiting (position #)
  - Almost Your Turn (top 5)
  - Your Turn! (called)
  - Checked In (complete)

#### `<WaitTimeDisplay />`
- **Format**: "~15-20 minutes"
- **Updates**: Real-time based on flow rate
- **Features**: Confidence indicator

#### `<QueueNotification />`
- **Triggers**:
  - Position update (every 10 positions)
  - Almost your turn
  - Your turn - time to enter
  - Expiration warning
- **Channels**: SMS, Push notification

### Admin Queue Dashboard

#### `<QueueDashboard />`
- **Sections**:
  - Current Queue Status
  - Queue Metrics (waiting, served today)
  - Queue Controls (pause, resume)
  - Active Entries List
  - Recent Activity
- **Features**: Auto-refresh, alerts

#### `<QueueControls />`
- **Actions**:
  - Pause Queue (stop accepting)
  - Resume Queue
  - Clear Queue (with confirmation)
  - Adjust Batch Size
  - Adjust Interval
- **Display**: Current settings

#### `<QueueMetrics />`
- **Metrics**:
  - Currently Waiting
  - Average Wait Time
  - Served Today
  - No-Shows
  - Current Batch Rate
- **Features**: Real-time updates

### Queue Entries Management

#### `<QueueEntriesList />`
- **Display**: Table/list of entries
- **Columns**: Position, name, party size, wait time, status
- **Actions**: Call, check in, remove, no-show
- **Features**:
  - Filter by status
  - Search by name/code
  - Reorder (drag)

#### `<QueueEntryCard />`
- **Display**: Name, party size, wait time, code
- **Status**: Waiting, Called, Checked In, No-Show, Left
- **Actions**: Call, Check In, Mark No-Show

#### `<CallNextPanel />`
- **Purpose**: Dedicated calling interface
- **Features**:
  - Big "Call Next" button
  - Shows who's next
  - Batch call option
  - Sound notification

#### `<CallGuestModal />`
- **Display**: Guest info before calling
- **Actions**: Confirm Call, Skip (with reason)
- **Info**: Name, party size, wait time, notes

### Queue Settings

#### `<QueueSettingsForm />`
- **Sections**:
  - General (name, attraction)
  - Capacity (per batch, interval)
  - Hours (when queue is open)
  - Notifications (templates, timing)
  - Advanced (no-show timeout, max party)
- **Actions**: Save, Reset to defaults

#### `<CapacitySettings />`
- **Fields**:
  - Guests per Batch
  - Batch Interval (minutes)
  - Max Queue Length
  - Max Party Size
- **Preview**: Estimated throughput

#### `<NotificationSettings />`
- **Fields**:
  - Lead Time (minutes before turn)
  - Reminder Interval
  - Custom Messages
  - SMS Template
- **Preview**: Sample message

### Queue Stats

#### `<QueueStatsPage />`
- **Sections**:
  - Today's Performance
  - Historical Trends
  - Peak Times
  - Wait Time Distribution
- **Features**: Date range picker, export

#### `<WaitTimeChart />`
- **Display**: Line chart of wait times
- **Data**: By hour, day, week
- **Features**: Hover for details

#### `<QueueHeatmap />`
- **Display**: Day × Hour heatmap
- **Data**: Queue length or wait time
- **Features**: Identify busy periods

---

## User Flows

### Guest Join Queue Flow
```
[Public Queue Page]
    │
    ▼
[Queue Open?]
    │
    ├── No → [Show "Queue Closed" message]
    │
    └── Yes → [Join Form]
            │
            ├── Enter name
            ├── Enter phone number
            ├── Select party size
            │
            ▼
        [Submit → Join Queue]
            │
            ▼
        [Confirmation Page]
            │
            ├── Position shown
            ├── Estimated wait
            ├── Confirmation code
            ├── SMS confirmation sent
            │
            ▼
        [Queue Status Page (real-time)]
            │
            ├── Position updates
            ├── Notifications sent
            │
            ▼
        [Called - "Your Turn!"]
            │
            ├── SMS + Push notification
            ├── Countdown to enter (5-15 min)
            │
            ▼
        [Check In at Venue]
            │
            ▼
        [Complete]
```

### Staff Call Guest Flow
```
[Queue Dashboard or Call Panel]
    │
    ▼
[View Next Guest(s)]
    │
    ▼
[Call Next Button]
    │
    ▼
[Confirm Guest Info]
    │
    ├── Name, party size, wait time
    │
    ▼
[Send Call Notification]
    │
    ├── SMS sent
    ├── Status → "Called"
    │
    ▼
[Guest Arrives → Check In]
    │
    ├── Scan confirmation code
    │   OR
    ├── Manual check-in
    │
    ▼
[Status → "Checked In"]
    │
    ▼
[Ready for Next Guest]
```

### No-Show Flow
```
[Guest Called]
    │
    ▼
[Timeout Countdown (e.g., 10 min)]
    │
    ├── Guest doesn't arrive
    │
    ▼
[Reminder Sent at 5 min]
    │
    ├── Still no arrival
    │
    ▼
[Timeout Reached]
    │
    ▼
[Mark as No-Show (auto or manual)]
    │
    ▼
[Move to Next Guest]
    │
    ▼
[No-show logged for stats]
```

---

## State Management

### Queue Store (Public)
```typescript
interface GuestQueueState {
  entry: QueueEntry | null;
  position: number | null;
  estimatedWait: number | null;
  status: QueueEntryStatus;
  queueOpen: boolean;

  // Actions
  joinQueue: (data: JoinQueueData) => Promise<QueueEntry>;
  checkStatus: (code: string) => Promise<void>;
  leaveQueue: (code: string) => Promise<void>;
}
```

### Queue Store (Admin)
```typescript
interface AdminQueueState {
  entries: QueueEntry[];
  queueConfig: QueueConfig;
  stats: QueueStats;
  isOpen: boolean;
  isPaused: boolean;

  // Actions
  fetchEntries: () => Promise<void>;
  callNext: () => Promise<QueueEntry>;
  callBatch: (count: number) => Promise<QueueEntry[]>;
  checkInGuest: (entryId: string) => Promise<void>;
  markNoShow: (entryId: string) => Promise<void>;
  removeFromQueue: (entryId: string) => Promise<void>;
  pauseQueue: () => Promise<void>;
  resumeQueue: () => Promise<void>;
  updateConfig: (config: QueueConfig) => Promise<void>;
}
```

---

## Validation Rules

### Join Queue
- **Name**: Required, 2-100 characters
- **Phone**: Required, valid format
- **Party Size**: Required, 1 to max allowed

### Queue Settings
- **Batch Size**: ≥ 1
- **Interval**: ≥ 1 minute
- **Lead Time**: ≥ 5 minutes
- **No-Show Timeout**: ≥ 5 minutes

---

## Responsive Design

### Mobile (< 640px)
- Full-screen queue status
- Large position number
- Sticky call-to-action
- Bottom sheet for forms

### Tablet (640px - 1024px)
- Split view (form + status)
- Admin dashboard responsive grid
- Touch-friendly call buttons

### Desktop (> 1024px)
- Dashboard with multiple panels
- Full entry table
- Stats charts visible

---

## Accessibility

### Public Interface
- Large, readable text
- High contrast status
- Screen reader position updates
- Notification alternatives

### Admin Interface
- Keyboard navigation
- Call shortcuts
- Status announcements
- Focus management

---

## UI Components (shadcn/ui)

### Required Components
- `Card` - Status display
- `Badge` - Status indicators
- `Button` - Actions
- `Form` - Join form
- `Input` - Form fields
- `DataTable` - Entry list
- `Dialog` - Confirmations
- `Switch` - Toggles

### Custom Components
- `PositionDisplay` - Large position number
- `WaitTimeEstimate` - Time range display
- `QueueProgress` - Visual progress bar
- `CallButton` - Big call action
- `PartyCounter` - Party size selector
- `PhoneInput` - Phone number input

### Third-Party
- `socket.io-client` - Real-time updates
- `recharts` - Stats charts

---

## Real-Time Features

### WebSocket Events
- `queue:position_update` - Position changed
- `queue:called` - Guest called
- `queue:status_change` - Queue open/closed
- `queue:entry_added` - New entry (admin)
- `queue:entry_updated` - Entry changed

### Polling Fallback
- Poll every 30 seconds
- Increase frequency when close to turn
- Reduce when far back in queue

---

## Notifications

### SMS Messages
- **Joined**: "You're #45 in line. ~25 min wait. Track: [link]"
- **Almost**: "You're next! Be ready in ~5 minutes."
- **Called**: "Your turn! Please enter within 10 minutes."
- **Reminder**: "Don't miss your turn! 5 minutes remaining."
- **Expired**: "Your spot has expired. Rejoin at [link]"

### Push Notifications
- Same content as SMS
- Action buttons (View Status, Get Directions)

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Queue closed | Clear message with hours |
| Queue full | Message with try again later |
| Invalid phone | Inline validation error |
| Code not found | Error with rejoin option |
| Already in queue | Show existing entry |
| Guest expired | Message with rejoin link |
| Network error | Retry with cached position |
