# F8: Ticketing - UI Requirements

## Overview

Ticket sales interfaces for time-slot based ticketing, including public purchase flow, cart management, and admin order management.

## Pages & Routes

### Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/a/:slug/tickets` | Ticket Selection | Browse & select tickets |
| `/a/:slug/tickets/:date` | Time Slots | Select time slot |
| `/cart` | Shopping Cart | Review cart |
| `/checkout` | Checkout | Payment (→ F6) |
| `/checkout/success` | Confirmation | Order complete |
| `/orders/:orderId` | Order Details | View order/tickets |
| `/orders/:orderId/tickets` | My Tickets | View/download tickets |

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/ticketing` | Ticketing Dashboard | Sales overview |
| `/ticketing/ticket-types` | Ticket Types | Manage ticket types |
| `/ticketing/time-slots` | Time Slots | Manage capacity |
| `/ticketing/orders` | Orders | All orders |
| `/ticketing/orders/:orderId` | Order Details | Single order |
| `/ticketing/promos` | Promo Codes | Manage discounts |
| `/ticketing/box-office` | Box Office | Walk-up sales |

---

## Components

### Public Ticket Purchase

#### `<TicketSelector />`
- **Display**: List of ticket types with prices
- **Info**: Name, description, price, availability
- **Interaction**: Quantity selector per type
- **Features**:
  - Show savings for bundles
  - Sold out indicator
  - Limited availability warning
  - Group pricing tiers

#### `<DatePicker />`
- **Display**: Calendar with availability
- **Features**:
  - Color-coded availability (available, limited, sold out)
  - Season date range enforcement
  - Disabled past dates
  - Mobile-optimized

#### `<TimeSlotPicker />`
- **Display**: Grid/list of available times
- **Info**: Time, remaining capacity, price (if varies)
- **States**: Available, Limited, Sold Out
- **Features**:
  - Filter by ticket type availability
  - Real-time availability updates
  - Capacity indicator

#### `<ShoppingCart />`
- **Display**: Cart contents sidebar/page
- **Items**: Ticket type, date, time, quantity, price
- **Actions**: Update quantity, remove, continue shopping
- **Features**:
  - Promo code input
  - Subtotal, discounts, total
  - Session timer (cart holds tickets)

#### `<CartTimer />`
- **Display**: Countdown timer
- **Info**: "Tickets held for X:XX"
- **Actions**: Extend time (if allowed)
- **Warning**: Alert when < 2 minutes remain

#### `<PromoCodeInput />`
- **Fields**: Code input
- **Actions**: Apply code
- **States**: Valid (show discount), Invalid (error), Loading

#### `<TicketConfirmation />`
- **Display**: Order summary, tickets
- **Info**: Order number, QR codes, calendar add
- **Actions**: Download tickets, add to wallet, share
- **Features**: Print-friendly view

#### `<DigitalTicket />`
- **Display**: Ticket card with QR code
- **Info**: Attraction name, date, time, ticket type, guest name
- **Features**:
  - Apple/Google Wallet compatible
  - Offline access
  - Brightness boost for scanning

### Admin Ticket Management

#### `<TicketTypesList />`
- **Display**: Table/cards of ticket types
- **Columns**: Name, price, sold, remaining, status
- **Actions**: Create, edit, duplicate, archive
- **Features**: Drag to reorder, bulk actions

#### `<TicketTypeForm />`
- **Fields**:
  - Name, Description
  - Base Price
  - Dynamic Pricing (optional)
  - Capacity (per time slot or total)
  - Sale Dates (when available)
  - Restrictions (age, requirements)
  - Add-ons (upsells)
- **Actions**: Save, Preview, Archive

#### `<DynamicPricingEditor />`
- **Rules**:
  - Date-based (weekday vs weekend)
  - Demand-based (% capacity triggers)
  - Time-based (early bird, day-of)
- **Preview**: Price calendar showing applied rules

#### `<TimeSlotsManager />`
- **Display**: Calendar with capacity per slot
- **Interaction**: Click to edit slot
- **Features**:
  - Bulk create slots
  - Copy from template
  - Adjust capacity
  - Close/open slots

#### `<TimeSlotEditor />`
- **Fields**:
  - Time
  - Capacity per ticket type
  - Price override (optional)
  - Status (open/closed)
- **Actions**: Save, Delete

### Order Management

#### `<OrdersList />`
- **Display**: Table of orders
- **Columns**: Order #, customer, date, tickets, total, status
- **Actions**: View, refund, resend confirmation
- **Features**:
  - Search by order #, email, name
  - Filter by date, status, attraction
  - Export orders

#### `<OrderDetails />`
- **Sections**:
  - Customer Info
  - Order Items (with check-in status)
  - Payment Info
  - Refund History
  - Activity Log
- **Actions**:
  - Full/partial refund
  - Resend confirmation
  - Modify order (reschedule)
  - Add notes

#### `<RefundModal />`
- **Options**: Full refund, partial refund
- **Partial**: Select items to refund
- **Fields**: Reason, notify customer
- **Preview**: Refund amount calculation

### Promo Codes

#### `<PromoCodesList />`
- **Display**: Table of promo codes
- **Columns**: Code, discount, usage, dates, status
- **Actions**: Create, edit, duplicate, deactivate

#### `<PromoCodeForm />`
- **Fields**:
  - Code (auto-generate option)
  - Discount Type (percentage, fixed, BOGO)
  - Discount Value
  - Minimum Purchase
  - Max Uses (total and per customer)
  - Valid Dates
  - Restrictions (ticket types, days)
- **Actions**: Save, Test

### Box Office

#### `<BoxOfficeView />`
- **Purpose**: Quick walk-up ticket sales
- **Features**:
  - Today's availability front and center
  - Quick add to cart
  - Cash/card payment
  - Print tickets immediately
  - Search customer by phone/email

#### `<QuickSale />`
- **Flow**:
  1. Select ticket type(s)
  2. Select time slot
  3. Customer info (minimal)
  4. Payment
  5. Print/send tickets
- **Features**: Optimized for speed

---

## User Flows

### Purchase Tickets Flow
```
[Attraction Public Page]
    │
    ▼
[Buy Tickets Button]
    │
    ▼
[Ticket Selection Page]
    │
    ├── Select ticket types & quantities
    │
    ▼
[Select Date]
    │
    ├── Calendar shows availability
    │
    ▼
[Select Time Slot]
    │
    ├── Available times for selected date
    │
    ▼
[Add to Cart]
    │
    ├── Cart timer starts (15 min default)
    │
    ▼
[Shopping Cart]
    │
    ├── Apply promo code (optional)
    ├── Review order
    │
    ▼
[Proceed to Checkout]
    │
    ├── Enter customer info
    ├── Enter payment (Stripe)
    │
    ▼
[Payment Processing]
    │
    ├── Success → [Confirmation Page]
    │       │
    │       ├── Email sent with tickets
    │       ├── View/download tickets
    │       └── Add to calendar
    │
    └── Failed → [Error with retry]
```

### Admin Create Ticket Type Flow
```
[Ticket Types Page]
    │
    ▼
[Create Ticket Type]
    │
    ▼
[Ticket Type Form]
    │
    ├── Basic Info (name, description)
    ├── Pricing (base, dynamic rules)
    ├── Capacity (per slot or total)
    ├── Availability (date range)
    ├── Restrictions (age, etc.)
    │
    ▼
[Save → Ticket Type Created]
    │
    ▼
[Configure Time Slots?]
    │
    ├── Yes → [Time Slots Manager]
    └── No → [Done - Active when slots exist]
```

### Process Refund Flow
```
[Order Details]
    │
    ▼
[Refund Button]
    │
    ▼
[Refund Modal]
    │
    ├── Select: Full or Partial
    │       │
    │       └── If Partial: Select items
    │
    ├── Enter reason
    ├── Notify customer? (checkbox)
    │
    ▼
[Review Refund Amount]
    │
    ▼
[Confirm Refund]
    │
    ▼
[Refund Processed]
    │
    ├── Order status updated
    ├── Customer notified (if selected)
    └── Tickets invalidated
```

---

## State Management

### Cart Store
```typescript
interface CartState {
  items: CartItem[];
  promoCode: PromoCode | null;
  sessionId: string;
  expiresAt: Date | null;

  // Computed
  subtotal: number;
  discount: number;
  total: number;

  // Actions
  addToCart: (item: AddCartItem) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;
  extendSession: () => Promise<void>;
  clearCart: () => void;
}
```

### Ticketing Store (Admin)
```typescript
interface TicketingState {
  ticketTypes: TicketType[];
  timeSlots: TimeSlot[];
  orders: Order[];
  currentOrder: OrderDetails | null;
  promoCodes: PromoCode[];

  // Actions
  fetchTicketTypes: () => Promise<void>;
  createTicketType: (data: CreateTicketTypeData) => Promise<void>;
  updateTicketType: (id: string, data: UpdateTicketTypeData) => Promise<void>;

  fetchTimeSlots: (date: Date) => Promise<void>;
  createTimeSlots: (data: CreateTimeSlotsData) => Promise<void>;
  updateTimeSlot: (id: string, data: UpdateTimeSlotData) => Promise<void>;

  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<void>;
  refundOrder: (orderId: string, data: RefundData) => Promise<void>;

  fetchPromoCodes: () => Promise<void>;
  createPromoCode: (data: CreatePromoCodeData) => Promise<void>;
}
```

---

## Validation Rules

### Ticket Type
- **Name**: Required, 2-100 characters
- **Price**: Required, ≥ 0
- **Capacity**: Optional, ≥ 0

### Cart
- **Quantity**: ≥ 1, ≤ available capacity
- **Session**: Valid, not expired

### Promo Code
- **Code**: Required, alphanumeric, 4-20 characters
- **Discount**: > 0, ≤ 100% if percentage
- **Max Uses**: ≥ 0 (0 = unlimited)

### Order
- **Email**: Required, valid format
- **Phone**: Required for SMS tickets

---

## Responsive Design

### Mobile (< 640px)
- Full-width ticket cards
- Bottom sheet date picker
- Horizontal scroll for time slots
- Sticky cart summary bar
- Full-screen checkout

### Tablet (640px - 1024px)
- Two-column ticket layout
- Side panel cart
- Grid time slots

### Desktop (> 1024px)
- Three-column with sticky cart
- Calendar always visible
- Full table views in admin
- Keyboard shortcuts

---

## Accessibility

### Ticket Selection
- Quantity inputs have clear labels
- Sold out state announced
- Price changes announced

### Date/Time Selection
- Calendar keyboard navigable
- Current selection announced
- Availability announced per date

### Cart
- Updates announced via live region
- Timer warns at intervals
- Clear error messages

### QR Codes
- Fallback ticket ID text
- High contrast for scanning
- Zoom capability

---

## UI Components (shadcn/ui)

### Required Components
- `Card` - Ticket types, orders
- `Calendar` - Date selection
- `Badge` - Status, availability
- `Dialog` - Modals
- `DataTable` - Admin lists
- `Input` - Forms
- `Button` - Actions
- `Select` - Dropdowns
- `Tabs` - Admin sections

### Custom Components
- `TicketCard` - Ticket type with quantity
- `TimeSlotGrid` - Time slot selection
- `CartSidebar` - Persistent cart
- `CartTimer` - Session countdown
- `DigitalTicket` - QR ticket display
- `PromoInput` - Promo code with validation
- `CapacityIndicator` - Visual capacity bar

### Third-Party
- `qrcode.react` - QR code generation
- `react-day-picker` - Calendar
- `@stripe/react-stripe-js` - Payment

---

## Real-Time Features

### Availability Updates
- WebSocket or polling for capacity
- Optimistic UI with reconciliation
- "Someone just bought" indicator

### Cart Session
- Server-side ticket hold
- Countdown timer
- Session extend option
- Graceful expiration

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Sold out during selection | Update UI, suggest alternatives |
| Cart session expired | Modal with restart option |
| Payment failed | Inline error, retry option |
| Promo code invalid | Inline error with reason |
| Order not found | 404 with search option |
| Time slot closed | Remove from UI, show message |
| Duplicate order attempt | Show existing order link |

---

## Settings & Configuration

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/settings/ticketing/categories` | Ticket Categories | Manage ticket category options |
| `/settings/ticketing/sources` | Order Sources | Manage order source options |

### Ticket Categories

**Route:** `/settings/ticketing/categories`

**Purpose:** Manage ticket category options for organizing ticket types.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Settings                                                              │
│                                                                         │
│ TICKET CATEGORIES                                [ + Add Category ]     │
│                                                                         │
│ Organize your ticket types into categories for display and reporting.  │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │      Name                  Key           Type          Status   │    │
│ ├─────────────────────────────────────────────────────────────────┤    │
│ │ ⋮⋮  🎟️  General Admission   general       System Default    ●   │    │
│ │ ⋮⋮  ⚡  Fast Pass           fast_pass     System Default    ●   │    │
│ │ ⋮⋮  👑  VIP Experience      vip           System Default    ●   │    │
│ │ ⋮⋮  👨‍👩‍👧‍👦  Group Package       group         System Default    ●   │    │
│ │ ⋮⋮  📦  Bundle              bundle        System Default    ●   │    │
│ │ ⋮⋮  🎁  Season Pass         season_pass   System Default    ○   │    │
│ │ ⋮⋮  🌙  Special Event       special       Custom            ●   │    │
│ │ ⋮⋮  🎃  Halloween Special   halloween     Custom            ●   │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ ● Active  ○ Hidden                        [Drag to reorder]            │
└─────────────────────────────────────────────────────────────────────────┘
```

**Fields:**
- Name and description
- Icon and color for display
- Sort order for public display
- Allow on public site (toggle)

**Features:**
- Categories shown on ticket selection page
- Filter ticket types by category
- Category-based reporting and analytics
- Custom categories for special events

### Order Sources

**Route:** `/settings/ticketing/sources`

**Purpose:** Manage order source options for tracking where sales originate.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Settings                                                              │
│                                                                         │
│ ORDER SOURCES                                    [ + Add Source ]       │
│                                                                         │
│ Track where ticket orders originate for reporting and attribution.     │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │      Name              Key           Partner     Status         │    │
│ ├─────────────────────────────────────────────────────────────────┤    │
│ │ 🌐  Online             online         —          System Default  ●   │
│ │ 🏢  Box Office         box_office     —          System Default  ●   │
│ │ 📞  Phone              phone          —          System Default  ●   │
│ │ 🤝  Partner            partner        —          System Default  ●   │
│ │ 🎁  Complimentary      comp           —          System Default  ●   │
│ │ 📱  Mobile App         mobile_app     —          Custom          ●   │
│ │ 🎫  Groupon            groupon        Groupon    Custom          ●   │
│ │ 📣  Radio Promo        radio_promo    WXYZ FM    Custom          ○   │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ ● Active  ○ Hidden                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

**Fields:**
- Name and description
- Icon and color
- Partner link (optional - for affiliate/partnership tracking)
- Commission rate (optional - for partner payouts)

**Features:**
- Source attribution on all orders
- Sales reporting by source
- Partner commission tracking
- Campaign effectiveness analysis
- Box office source auto-assigned for walk-ups
