# F9: Check-In System - UI Requirements

## Overview

Check-in interfaces for scanning tickets, tracking capacity, managing walk-up sales, and handling guest waivers.

## Pages & Routes

### Staff/Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/checkin` | Check-In Dashboard | Overview & station selection |
| `/checkin/scan` | Scanner | Ticket scanning interface |
| `/checkin/capacity` | Capacity Monitor | Real-time capacity tracking |
| `/checkin/walk-up` | Walk-Up Sales | Quick ticket sales |
| `/checkin/waivers` | Waivers | Waiver management |
| `/checkin/stations` | Stations | Manage check-in stations |
| `/checkin/history` | Check-In History | Log of all check-ins |

### Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/waiver/:attractionSlug` | Sign Waiver | Guest waiver form |
| `/waiver/:code` | Waiver Lookup | Find signed waiver |

---

## Components

### Scanner Interface

#### `<ScannerView />`
- **Primary**: Large scan area / camera view
- **Display**: Last scan result, queue count
- **Actions**: Manual entry, toggle camera/scanner
- **Features**:
  - Auto-focus on scan input
  - Sound feedback (success/error)
  - Vibration feedback (mobile)
  - Continuous scan mode

#### `<ScanResult />`
- **States**: Valid, Invalid, Already Used, Wrong Date/Time
- **Valid Display**:
  - Guest name
  - Ticket type
  - Time slot
  - Party size
  - Special notes
- **Actions**: Confirm check-in, View order, Cancel
- **Features**: Auto-confirm after delay (configurable)

#### `<ManualLookup />`
- **Fields**: Order #, Email, Phone, Last Name
- **Results**: Matching orders/tickets
- **Actions**: Select to check in

#### `<ScannerSettings />`
- **Options**:
  - Camera vs hardware scanner
  - Auto-confirm delay
  - Sound effects on/off
  - Batch scan mode
  - Station assignment

### Capacity Monitor

#### `<CapacityDashboard />`
- **Display**: Real-time capacity metrics
- **Sections**:
  - Current Attendance (in venue now)
  - Today's Check-ins (total)
  - Upcoming Time Slots (with counts)
  - Capacity by Zone
- **Features**: Auto-refresh, alerts at thresholds

#### `<CapacityGauge />`
- **Visual**: Circular or bar gauge
- **Display**: Current / Max capacity
- **Colors**: Green (< 70%), Yellow (70-90%), Red (> 90%)
- **Features**: Animated updates, threshold alerts

#### `<ZoneCapacity />`
- **Display**: Cards per zone with capacity
- **Info**: Zone name, current, max, status
- **Actions**: Click for zone details

#### `<TimeSlotCapacity />`
- **Display**: List of upcoming slots
- **Info**: Time, checked in, expected, available
- **Features**: Countdown to next slot

#### `<CapacityAlerts />`
- **Triggers**:
  - Approaching capacity (configurable %)
  - Over capacity
  - Zone imbalance
- **Actions**: Acknowledge, Pause check-ins

### Walk-Up Sales

#### `<WalkUpSale />`
- **Purpose**: Quick in-person ticket sales
- **Flow**:
  1. Select ticket type
  2. Select time slot (current/next)
  3. Enter guest count
  4. Collect payment
  5. Print/send tickets
  6. Auto check-in

#### `<QuickTicketSelect />`
- **Display**: Large buttons for common ticket types
- **Info**: Name, price, availability
- **Features**: Quantity +/- buttons

#### `<PaymentCollection />`
- **Methods**: Cash, Card (Stripe Terminal), Comp
- **Features**:
  - Quick cash calculation
  - Card reader integration
  - Split payment
  - Comp code validation

#### `<ReceiptPrinter />`
- **Options**: Print ticket, Email ticket, Both
- **Features**: Preview before print

### Waivers

#### `<WaiverForm />`
- **Fields**:
  - Full Name
  - Email
  - Phone
  - Date of Birth
  - Emergency Contact
  - Agreement Checkboxes
  - Signature Pad
- **Features**:
  - Minor mode (guardian signature)
  - Pre-fill from order
  - Photo capture (optional)

#### `<WaiverLookup />`
- **Search**: Name, email, phone, confirmation code
- **Results**: Matching waivers with status
- **Actions**: View, resend, mark complete

#### `<WaiverVerification />`
- **At Check-In**: Verify waiver signed
- **States**: Signed, Not Signed, Expired
- **Actions**: View waiver, prompt to sign

#### `<WaiverKiosk />`
- **Purpose**: Self-service waiver signing
- **Features**:
  - Large touch-friendly interface
  - On-screen keyboard
  - Signature capture
  - QR code to continue on phone

### Check-In Stations

#### `<StationsList />`
- **Display**: List of check-in stations
- **Info**: Name, location, device, status
- **Actions**: Create, edit, assign device

#### `<StationForm />`
- **Fields**:
  - Name
  - Location/Zone
  - Device ID
  - Supported Actions (scan, walk-up, waivers)
  - Auto-confirm Settings
- **Actions**: Save, Deactivate

#### `<StationSelector />`
- **Purpose**: Select active station on device
- **Display**: Available stations for this attraction
- **Features**: Remember selection

### Check-In History

#### `<CheckInHistory />`
- **Display**: Table of check-ins
- **Columns**: Time, guest, ticket type, station, staff
- **Actions**: Search, filter, export
- **Features**:
  - Real-time updates
  - Filter by time slot, station
  - Undo recent check-in

---

## User Flows

### Standard Check-In Flow
```
[Scanner View]
    │
    ▼
[Scan QR Code / Barcode]
    │
    ▼
[System Validates Ticket]
    │
    ├── Valid Ticket
    │       │
    │       ▼
    │   [Show Guest Info]
    │       │
    │       ├── [Verify Waiver Status]
    │       │       │
    │       │       ├── Signed → Continue
    │       │       └── Not Signed → [Prompt to Sign]
    │       │
    │       ▼
    │   [Confirm Check-In]
    │       │
    │       ├── Auto-confirm (if enabled)
    │       └── Manual confirm button
    │       │
    │       ▼
    │   [Success Animation + Sound]
    │       │
    │       ▼
    │   [Ready for Next Scan]
    │
    ├── Already Checked In
    │       │
    │       ▼
    │   [Show Error + Previous Check-In Info]
    │       │
    │       ├── Override (manager only)
    │       └── Dismiss
    │
    ├── Wrong Time Slot
    │       │
    │       ▼
    │   [Show Error + Correct Time]
    │       │
    │       ├── Allow Early (if configured)
    │       └── Dismiss
    │
    └── Invalid Ticket
            │
            ▼
        [Show Error]
            │
            ├── Manual lookup option
            └── Dismiss
```

### Walk-Up Sale Flow
```
[Walk-Up Sales]
    │
    ▼
[Select Ticket Type]
    │
    ▼
[Select Time Slot]
    │
    ├── Current slot (if available)
    └── Next available
    │
    ▼
[Enter Guest Count]
    │
    ▼
[Customer Info (minimal)]
    │
    ├── Phone or Email (for tickets)
    │
    ▼
[Collect Payment]
    │
    ├── Cash → Enter amount → Calculate change
    ├── Card → Process via terminal
    └── Comp → Enter comp code
    │
    ▼
[Payment Complete]
    │
    ▼
[Print/Send Tickets]
    │
    ▼
[Auto Check-In?]
    │
    ├── Yes → [Mark as checked in]
    └── No → [Tickets issued only]
```

### Waiver Signing Flow
```
[Check-In Detects No Waiver]
    │
    ▼
[Option 1: Guest Signs at Kiosk]
    │
    ├── [Waiver Form on Kiosk]
    ├── [Fill Info + Sign]
    ├── [Submit → Return to Check-In]
    │
    ▼
[Option 2: Guest Signs on Phone]
    │
    ├── [Show QR Code to Scan]
    ├── [Guest opens waiver on phone]
    ├── [Fills + Signs on phone]
    ├── [System detects completion]
    │
    ▼
[Waiver Complete → Continue Check-In]
```

---

## State Management

### Check-In Store
```typescript
interface CheckInState {
  // Station
  currentStation: Station | null;
  stationSettings: StationSettings;

  // Scanning
  lastScan: ScanResult | null;
  scanHistory: ScanResult[];
  isProcessing: boolean;

  // Capacity
  currentCapacity: CapacityData;
  zoneCapacity: ZoneCapacity[];
  timeSlotCapacity: TimeSlotCapacity[];

  // Walk-up
  walkUpCart: WalkUpCart;

  // Actions
  setStation: (stationId: string) => void;
  processScan: (code: string) => Promise<ScanResult>;
  confirmCheckIn: (ticketId: string) => Promise<void>;
  undoCheckIn: (checkInId: string) => Promise<void>;
  fetchCapacity: () => Promise<void>;
  processWalkUp: (data: WalkUpData) => Promise<void>;
}
```

### Waiver Store
```typescript
interface WaiverState {
  currentWaiver: Waiver | null;
  waivers: Waiver[];

  // Actions
  lookupWaiver: (query: string) => Promise<Waiver[]>;
  submitWaiver: (data: WaiverData) => Promise<void>;
  verifyWaiver: (guestId: string) => Promise<WaiverStatus>;
}
```

---

## Validation Rules

### Check-In
- **Ticket**: Must exist, valid, not used
- **Time Slot**: Within allowed window (configurable grace period)
- **Capacity**: Venue not over capacity

### Waiver
- **Name**: Required, 2-100 characters
- **Email or Phone**: At least one required
- **Date of Birth**: Required, valid date
- **Signature**: Required, not empty
- **Agreement**: All required checkboxes checked

### Walk-Up
- **Guest Count**: ≥ 1, ≤ available capacity
- **Payment**: Full amount collected

---

## Responsive Design

### Mobile (< 640px)
- Full-screen scanner
- Large touch targets
- Bottom sheet for results
- Swipe for actions

### Tablet (640px - 1024px)
- Split view (scanner + info)
- Side panel for capacity
- Touch-optimized keypad

### Desktop (> 1024px)
- Multi-panel dashboard
- Hardware scanner support
- Keyboard shortcuts
- Multiple monitor support

---

## Accessibility

### Scanner
- Audio feedback for results
- High contrast result states
- Voice announcement option
- Works with hardware scanners

### Capacity Dashboard
- Color-blind safe indicators
- Screen reader friendly
- Auto-refresh announced

### Waiver Form
- Keyboard navigable
- Clear error messages
- Accessible signature capture

---

## UI Components (shadcn/ui)

### Required Components
- `Card` - Result display, stats
- `Badge` - Status indicators
- `Button` - Actions
- `Input` - Manual entry
- `Dialog` - Confirmations
- `Progress` - Capacity bars
- `Tabs` - Dashboard sections
- `DataTable` - History

### Custom Components
- `ScannerCamera` - QR/barcode camera
- `CapacityGauge` - Circular capacity
- `SignaturePad` - Waiver signature
- `ScanResult` - Check-in result card
- `StationPicker` - Station selector
- `QuickPay` - Payment collection

### Third-Party
- `@zxing/library` - Barcode scanning
- `react-signature-canvas` - Signature capture
- `Stripe Terminal SDK` - Card payments

---

## Hardware Integration

### Barcode Scanners
- USB HID scanners (keyboard wedge)
- Bluetooth scanners
- Camera-based scanning

### Receipt Printers
- USB thermal printers
- Network printers
- Browser print

### Card Readers
- Stripe Terminal (M2, WisePOS)
- USB card readers

---

## Real-Time Features

### Capacity Updates
- WebSocket for live capacity
- Push notifications for alerts
- Automatic UI refresh

### Scan Sync
- Multi-device sync
- Conflict resolution
- Offline queue

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Invalid QR code | Error sound + message |
| Already checked in | Show previous check-in details |
| Wrong time slot | Show correct time, allow override |
| Over capacity | Block + alert managers |
| Payment failed | Retry or switch method |
| Scanner error | Fallback to manual entry |
| Network offline | Queue scans, sync later |

---

## Offline Support

### Capabilities When Offline
- Continue scanning (queued)
- View cached capacity (stale warning)
- Process cash walk-ups (queued)

### Sync Behavior
- Auto-sync when online
- Conflict resolution (server wins)
- Notification of sync status
