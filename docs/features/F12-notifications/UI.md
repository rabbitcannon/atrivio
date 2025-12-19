# F12: Notifications - UI Requirements

## Overview

Notification system interfaces for managing multi-channel notifications (email, SMS, push), user preferences, and notification templates.

## Pages & Routes

### User Routes

| Route | Page | Description |
|-------|------|-------------|
| `/notifications` | Notification Center | All notifications |
| `/settings/notifications` | Notification Preferences | Channel preferences |

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/settings/notifications/templates` | Templates | Manage templates |
| `/settings/notifications/templates/:id` | Edit Template | Template editor |
| `/settings/notifications/send` | Send Notification | Manual send |
| `/settings/notifications/history` | History | Sent notifications |
| `/settings/notifications/stats` | Stats | Delivery analytics |

---

## Components

### Notification Center

#### `<NotificationCenter />`
- **Display**: List of notifications
- **Sections**: All, Unread, By Category
- **Actions**: Mark read, mark all read, settings link
- **Features**:
  - Real-time updates
  - Infinite scroll
  - Category filters

#### `<NotificationBell />`
- **Location**: Header/navbar
- **Display**: Bell icon with unread count
- **Action**: Click opens dropdown/panel
- **Features**:
  - Animated on new notification
  - Max count display (99+)

#### `<NotificationDropdown />`
- **Display**: Recent notifications (5-10)
- **Actions**: View all, mark all read
- **Features**: Quick preview, quick actions

#### `<NotificationItem />`
- **Display**: Icon, title, body preview, time
- **States**: Read, Unread
- **Actions**: Click to view/action, dismiss
- **Features**: Rich content support

#### `<NotificationDetail />`
- **Display**: Full notification content
- **Actions**: Related action (view order, view schedule)
- **Features**: Rich formatting, images

### Notification Preferences

#### `<PreferencesPage />`
- **Sections**:
  - Channel Settings (global)
  - Category Preferences
  - Quiet Hours
  - Device Management

#### `<ChannelToggles />`
- **Channels**: Email, SMS, Push, In-App
- **Features**: Master toggle + per-category

#### `<CategoryPreferences />`
- **Categories**:
  - Tickets (confirmations, reminders)
  - Queue (position updates, ready)
  - Schedule (new schedule, swaps)
  - Marketing (promotions)
  - System (account, security)
- **Per Category**: Email, SMS, Push toggles

#### `<QuietHours />`
- **Fields**: Start time, end time, days
- **Features**: Timezone aware, exception for urgent

#### `<DeviceManagement />`
- **Display**: Registered devices for push
- **Info**: Device name, last active
- **Actions**: Remove device, test notification

### Admin Templates

#### `<TemplatesList />`
- **Display**: Table of templates
- **Columns**: Name, channel, category, last updated, status
- **Actions**: Create, edit, duplicate, preview, delete
- **Features**: Filter by channel, category

#### `<TemplateEditor />`
- **Sections**:
  - Basic Info (name, key, description)
  - Channel Selection
  - Subject (email)
  - Body (with variable insertion)
  - Preview
- **Features**:
  - Rich text for email
  - Character count for SMS
  - Variable picker
  - Live preview

#### `<VariablePicker />`
- **Display**: Available variables for template
- **Variables**: {{guest_name}}, {{order_number}}, {{attraction_name}}, etc.
- **Action**: Click to insert at cursor
- **Features**: Description on hover

#### `<TemplatePreview />`
- **Display**: Rendered template with sample data
- **Channels**: Toggle between email, SMS preview
- **Features**: Test data input, send test

### Send Notification

#### `<SendNotificationPage />`
- **Flow**:
  1. Select template or compose custom
  2. Select recipients
  3. Set delivery (now or scheduled)
  4. Preview & confirm
  5. Send

#### `<RecipientSelector />`
- **Options**:
  - Specific users (search)
  - By role (all managers, all actors)
  - By attraction assignment
  - All staff
  - Custom list (paste emails/phones)
- **Preview**: Recipient count

#### `<ComposeNotification />`
- **Fields**: Subject (email), body, attachment (email)
- **Channels**: Select which channels to use
- **Features**: Preview per channel

#### `<ScheduleDelivery />`
- **Options**: Send now, schedule for later
- **Fields**: Date, time, timezone
- **Features**: Optimal send time suggestion

### Notification History

#### `<NotificationHistory />`
- **Display**: Table of sent notifications
- **Columns**: Date, template, channel, recipients, status
- **Actions**: View details, resend
- **Features**: Filter by channel, status, date

#### `<NotificationDetails />`
- **Display**: Full notification info
- **Info**: Recipients, content, delivery status
- **Stats**: Delivered, opened, clicked, failed

### Notification Stats

#### `<NotificationStats />`
- **Metrics**:
  - Sent (by channel)
  - Delivered
  - Open Rate (email)
  - Click Rate
  - Failed/Bounced
- **Charts**: Over time, by category

#### `<ChannelPerformance />`
- **Display**: Per-channel metrics
- **Comparison**: Email vs SMS vs Push
- **Trends**: Week over week

---

## User Flows

### Update Notification Preferences Flow
```
[Settings → Notifications]
    │
    ▼
[Preferences Page]
    │
    ├── Global Channels
    │       ├── Email: On/Off
    │       ├── SMS: On/Off
    │       └── Push: On/Off
    │
    ├── By Category
    │       ├── Tickets: [Email ✓] [SMS ✓] [Push ✓]
    │       ├── Schedule: [Email ✓] [SMS ✓] [Push ✓]
    │       └── Marketing: [Email ○] [SMS ○] [Push ○]
    │
    ├── Quiet Hours
    │       └── 10 PM - 7 AM (except urgent)
    │
    ▼
[Save Preferences]
    │
    ▼
[Preferences Updated]
```

### Admin Send Notification Flow
```
[Admin → Send Notification]
    │
    ▼
[Select Notification Type]
    │
    ├── Use Template
    │       │
    │       ▼
    │   [Select Template]
    │       │
    │       ▼
    │   [Customize Variables (optional)]
    │
    └── Custom Message
            │
            ▼
        [Compose Message]
            │
            ├── Subject (email)
            ├── Body
            ├── Select Channels
    │
    ▼
[Select Recipients]
    │
    ├── By role, attraction, or individual
    │
    ▼
[Preview Notification]
    │
    ├── See content per channel
    ├── See recipient count
    │
    ▼
[Schedule or Send Now]
    │
    ▼
[Confirm Send]
    │
    ▼
[Notification Queued/Sent]
    │
    ▼
[View in History]
```

### Push Notification Permission Flow
```
[App/Site First Load or Settings]
    │
    ▼
[Enable Push Notifications?]
    │
    ├── User clicks Enable
    │       │
    │       ▼
    │   [Browser/OS Permission Prompt]
    │       │
    │       ├── Allowed → [Device Registered]
    │       │               │
    │       │               ▼
    │       │           [Test Notification Sent]
    │       │
    │       └── Denied → [Show How to Enable Later]
    │
    └── User clicks Not Now
            │
            ▼
        [Save preference, ask again later]
```

---

## State Management

### Notification Store (User)
```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  devices: PushDevice[];

  isLoading: boolean;

  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>;
  registerDevice: (token: string, platform: string) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
}
```

### Notification Store (Admin)
```typescript
interface AdminNotificationState {
  templates: NotificationTemplate[];
  history: SentNotification[];
  stats: NotificationStats;

  // Actions
  fetchTemplates: () => Promise<void>;
  createTemplate: (data: TemplateData) => Promise<void>;
  updateTemplate: (id: string, data: TemplateData) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  previewTemplate: (id: string, sampleData: object) => Promise<RenderedTemplate>;
  sendNotification: (data: SendNotificationData) => Promise<void>;
  fetchHistory: (filters?: HistoryFilters) => Promise<void>;
  fetchStats: (dateRange: DateRange) => Promise<void>;
}
```

---

## Validation Rules

### Preferences
- **Phone**: Valid format if SMS enabled
- **Email**: Valid format if email enabled

### Template
- **Name**: Required, 2-100 characters
- **Key**: Required, snake_case, unique
- **Body**: Required, max 5000 characters
- **SMS Body**: Max 160 characters (or indicate segments)

### Send Notification
- **Recipients**: At least 1 recipient
- **Body**: Required, not empty
- **Schedule**: Must be in future if scheduled

---

## Responsive Design

### Mobile (< 640px)
- Full-screen notification center
- Bottom sheet for preferences
- Simplified template editor
- Touch-friendly toggles

### Tablet (640px - 1024px)
- Side panel notification center
- Two-column preferences
- Modal template editor

### Desktop (> 1024px)
- Dropdown notification center
- Full preferences page
- Split view template editor
- Dashboard with charts

---

## Accessibility

### Notification Center
- New notifications announced
- Keyboard navigable list
- Clear unread indicators
- Focus management

### Preferences
- Toggle switches accessible
- Category headers as landmarks
- Changes announced

### Template Editor
- Rich text editor accessible
- Variable picker keyboard accessible
- Preview alt text

---

## UI Components (shadcn/ui)

### Required Components
- `Popover` - Notification dropdown
- `Badge` - Unread count
- `Card` - Notification items
- `Switch` - Toggles
- `Tabs` - Preference sections
- `DataTable` - Template list
- `Form` - Settings, send forms
- `RichTextEditor` - Email body

### Custom Components
- `NotificationBell` - Header bell icon
- `NotificationItem` - Individual notification
- `ChannelToggleGroup` - Multi-channel toggles
- `VariablePicker` - Template variable inserter
- `RecipientSelector` - Multi-select recipients
- `DeliveryScheduler` - Date/time picker

### Third-Party
- `react-quill` or `tiptap` - Rich text
- `firebase` or `onesignal` - Push
- `recharts` - Stats charts

---

## Push Notification Setup

### Web Push
- Service Worker registration
- VAPID key configuration
- Permission handling

### Mobile (Future)
- FCM for Android
- APNs for iOS
- Deep linking support

---

## Email Integration

### Provider: SendGrid
- Webhook for delivery status
- Template storage (optional)
- Analytics integration

### Features
- HTML + plain text
- Attachments (tickets, receipts)
- Unsubscribe handling

---

## SMS Integration

### Provider: Twilio
- Webhook for delivery status
- Number formatting
- Opt-out handling

### Features
- Character counting
- Segment indicator
- Link shortening

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| No notifications | Empty state with message |
| Load failed | Retry button |
| Push permission denied | Instructions to enable |
| Invalid phone | Inline error |
| Send failed | Error with retry option |
| Template not found | 404 with list link |
| Recipient list empty | Validation error |
