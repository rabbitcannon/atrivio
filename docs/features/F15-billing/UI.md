# F15: Platform Billing - UI Requirements

## Overview

Billing management interface for organizations to view their platform fees, subscribe to premium modules, manage payment methods, and view invoices. Also includes admin interfaces for platform billing oversight.

## Pages & Routes

### Organization Routes

| Route | Page | Description |
|-------|------|-------------|
| `/settings/billing` | Billing Overview | Summary dashboard |
| `/settings/billing/modules` | Module Subscriptions | Subscribe to modules |
| `/settings/billing/usage` | Usage & Metering | Usage-based charges |
| `/settings/billing/payment-methods` | Payment Methods | Manage cards |
| `/settings/billing/invoices` | Invoice History | Past invoices |
| `/settings/billing/settings` | Billing Settings | Contact, address |

### Admin Routes (Super Admin)

| Route | Page | Description |
|-------|------|-------------|
| `/admin/billing` | Billing Dashboard | Platform revenue overview |
| `/admin/billing/organizations` | Org Billing List | All org billing info |
| `/admin/billing/organizations/:id` | Org Billing Detail | Single org billing |
| `/admin/billing/pricing` | Pricing Management | Module pricing config |
| `/admin/billing/volume-tiers` | Volume Tiers | Discount tier config |

### Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/pricing` | Pricing Page | Public pricing info |

---

## Components

### Billing Overview

#### `<BillingDashboard />`
Main billing overview for organizations.

- **Sections**:
  - Current Plan Summary
  - Volume Tier Progress
  - Active Modules
  - Month-to-Date Charges
  - Quick Actions

- **Metrics Display**:
  ```
  ┌─────────────────────────────────────────────────────────────┐
  │  Your Billing                                                │
  ├─────────────────────────────────────────────────────────────┤
  │  Platform Fee: 2.5%          Volume Tier: Standard          │
  │  Annual Sales: $32,500       Next Tier at: $50,000          │
  │                                                              │
  │  ████████████░░░░░░░░ 65% to Starter (2.0% fee)             │
  └─────────────────────────────────────────────────────────────┘
  ```

#### `<VolumeTierProgress />`
Visual progress toward next volume tier.

- **Display**: Progress bar with current/next tier
- **Info**: Current tier, next tier threshold, savings at next tier
- **CTA**: "See all tiers" link

#### `<ActiveModulesList />`
List of currently subscribed modules.

- **Columns**: Module name, billing cycle, price, renewal date
- **Actions**: Manage, Cancel
- **Empty State**: "No premium modules - explore available modules"

#### `<MtdChargesSummary />`
Month-to-date billing charges.

- **Breakdown**:
  - Platform fees (on ticket sales)
  - Module subscriptions
  - Usage charges (SMS, etc.)
  - Total

### Module Subscriptions

#### `<ModuleCatalog />`
Browse and subscribe to modules.

- **Layout**: Card grid of available modules
- **Per Module Card**:
  - Module icon/illustration
  - Name and description
  - Pricing (monthly/seasonal/annual)
  - Features list
  - Subscribe/Manage button
  - "Active" badge if subscribed

```
┌─────────────────────────────────────────┐
│  📅 Staff Scheduling                    │
│                                          │
│  Schedule staff with availability        │
│  tracking, shift templates, and          │
│  swap requests.                          │
│                                          │
│  $29/mo  ·  $99/season  ·  $290/year    │
│                                          │
│  ✓ Shift templates                       │
│  ✓ Staff availability                    │
│  ✓ Shift swap requests                   │
│  ✓ Schedule publishing                   │
│                                          │
│  [Subscribe Monthly ▾]                   │
└─────────────────────────────────────────┘
```

#### `<SubscribeDialog />`
Modal for subscribing to a module.

- **Content**:
  - Module name and description
  - Billing cycle selector (Monthly/Seasonal/Annual)
  - Price display with savings indicator
  - Payment method selector
  - Terms acceptance
- **Actions**: Subscribe, Cancel

#### `<ManageSubscriptionDialog />`
Modal for managing existing subscription.

- **Content**:
  - Current subscription details
  - Billing cycle (with change option)
  - Next renewal date
  - Payment history for this module
- **Actions**:
  - Change billing cycle
  - Cancel subscription
  - Reactivate (if cancelled)

#### `<CancelSubscriptionDialog />`
Confirmation dialog for cancellation.

- **Content**:
  - What you'll lose access to
  - When access ends
  - Option for immediate vs. end-of-period
- **Actions**: Keep Subscription, Cancel Subscription

### Usage & Metering

#### `<UsageDashboard />`
Overview of usage-based charges.

- **Sections**:
  - Current period usage
  - Usage by type
  - Historical usage chart
  - Projected charges

#### `<UsageBreakdown />`
Detailed breakdown of usage.

- **Display**: By module, by usage type
- **Chart**: Bar chart of daily usage
- **Table**: Detailed usage records

```
┌─────────────────────────────────────────────────────────────┐
│  SMS Notifications Usage - January 2025                      │
├─────────────────────────────────────────────────────────────┤
│  Total Messages: 523                                         │
│  Cost: $10.46 ($0.02/message)                               │
│                                                              │
│  By Type:                                                    │
│  • Queue notifications    412 messages    $8.24              │
│  • Shift reminders        111 messages    $2.22              │
└─────────────────────────────────────────────────────────────┘
```

### Payment Methods

#### `<PaymentMethodsList />`
List of saved payment methods.

- **Display**: Card brand, last 4, expiry, default badge
- **Actions**: Set as default, Remove
- **Add Button**: "Add payment method"

#### `<AddPaymentMethodDialog />`
Add new payment method using Stripe Elements.

- **Content**:
  - Stripe Card Element
  - Set as default checkbox
  - Billing address (optional)
- **Actions**: Add Card, Cancel

#### `<RemovePaymentMethodDialog />`
Confirm removal of payment method.

- **Validation**: Cannot remove default if subscriptions active
- **Warning**: Impact on active subscriptions

### Invoices

#### `<InvoicesList />`
Table of past invoices.

- **Columns**: Date, Invoice #, Amount, Status, Actions
- **Actions**: View, Download PDF
- **Filters**: Date range, status
- **Status Badges**: Paid (green), Open (yellow), Past Due (red)

#### `<InvoiceDetail />`
Detailed invoice view.

- **Header**: Invoice number, date, status
- **Line Items**: Description, quantity, amount
- **Totals**: Subtotal, tax, total, amount paid
- **Actions**: Download PDF, Pay (if open)

### Billing Settings

#### `<BillingSettingsForm />`
Billing contact and address form.

- **Fields**:
  - Billing email
  - Company name
  - Billing address (line1, line2, city, state, zip, country)
  - Tax exempt status
- **Actions**: Save Changes

---

## Admin Components

### Admin Billing Dashboard

#### `<AdminBillingOverview />`
Platform-wide billing metrics.

- **Metrics**:
  - Total revenue (MTD, YTD)
  - Platform fees collected
  - Module subscription revenue
  - Usage revenue
- **Charts**:
  - Revenue over time
  - Revenue by type
  - Organizations by tier

#### `<AdminRevenueChart />`
Revenue trends visualization.

- **Display**: Line/bar chart
- **Filters**: Date range, revenue type
- **Breakdown**: Platform fees vs. subscriptions vs. usage

#### `<TierDistributionChart />`
Pie/donut chart of organizations by tier.

- **Segments**: Standard, Bronze, Silver, Gold
- **Hover**: Count and percentage

### Admin Organization Billing

#### `<AdminOrgBillingList />`
List of all organizations with billing info.

- **Columns**: Org name, tier, fee %, annual sales, modules, revenue
- **Actions**: View details, Edit
- **Filters**: Tier, has subscriptions, search

#### `<AdminOrgBillingDetail />`
Detailed billing view for single org.

- **Sections**:
  - Billing summary
  - Active subscriptions
  - Transaction history
  - Usage records
  - Admin overrides
- **Actions**:
  - Override fee percentage
  - Apply credit
  - Change tier manually

#### `<AdminApplyCreditDialog />`
Apply credit to organization.

- **Fields**:
  - Amount
  - Reason
  - Expiration date
- **Actions**: Apply Credit

### Pricing Management (Admin)

#### `<ModulePricingList />`
Manage module pricing.

- **Table**: Module, monthly, seasonal, annual, usage rate, status
- **Actions**: Edit, Enable/Disable

#### `<ModulePricingForm />`
Edit module pricing.

- **Fields**:
  - Module key, name, description
  - Monthly price
  - Seasonal price
  - Annual price
  - Usage-based toggle
  - Usage unit and rate
  - Feature flag link
- **Actions**: Save, Cancel

#### `<VolumeTiersList />`
Manage volume discount tiers.

- **Table**: Tier name, min sales, max sales, fee %, benefits
- **Actions**: Edit

---

## Public Pricing Page

#### `<PricingPage />`
Public-facing pricing information.

- **Sections**:
  - Hero with value prop
  - "Free Forever" core features
  - Transaction fee explanation
  - Volume discounts table
  - Premium modules grid
  - FAQ
  - CTA to sign up

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│            Simple, Transparent Pricing                           │
│                                                                  │
│    Start free. Pay only when you sell tickets.                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FREE FOREVER                                                    │
│  ─────────────                                                   │
│  ✓ Ticketing & sales          ✓ Unlimited attractions           │
│  ✓ Guest check-in             ✓ Unlimited staff                 │
│  ✓ Basic analytics            ✓ Public storefront               │
│                                                                  │
│  Just 2.5% platform fee on ticket sales                         │
│  (+ standard payment processing)                                │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  VOLUME DISCOUNTS                                                │
│  ─────────────────                                               │
│  $50K+ annual sales  → 2.0% fee                                 │
│  $150K+ annual sales → 1.5% fee                                 │
│  $500K+ annual sales → 1.0% fee + dedicated support             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PREMIUM MODULES (add what you need)                            │
│  ─────────────────────────────────────                          │
│                                                                  │
│  [Module cards in grid layout]                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flows

### Subscribe to Module Flow

```
[Billing Overview]
    │
    ▼
[Click "View Modules" or navigate to Modules tab]
    │
    ▼
[Module Catalog - Browse available modules]
    │
    ▼
[Click "Subscribe" on desired module]
    │
    ▼
[Subscribe Dialog]
    │
    ├── Select billing cycle (Monthly/Seasonal/Annual)
    ├── Review price
    ├── Select/confirm payment method
    │
    ▼
[Click "Subscribe"]
    │
    ├── Success → [Confirmation + module now active]
    │
    └── Payment Failed → [Error message + retry option]
```

### Cancel Subscription Flow

```
[Billing Overview or Modules tab]
    │
    ▼
[Click "Manage" on active subscription]
    │
    ▼
[Manage Subscription Dialog]
    │
    ▼
[Click "Cancel Subscription"]
    │
    ▼
[Cancel Confirmation Dialog]
    │
    ├── Review what you'll lose
    ├── Choose: End of period / Immediate
    │
    ▼
[Confirm Cancel]
    │
    ▼
[Subscription cancelled - access until period end]
```

### Add Payment Method Flow

```
[Payment Methods page]
    │
    ▼
[Click "Add Payment Method"]
    │
    ▼
[Add Payment Method Dialog]
    │
    ├── Enter card details (Stripe Elements)
    ├── Set as default? (checkbox)
    │
    ▼
[Click "Add Card"]
    │
    ├── Success → [Card added to list]
    │
    └── Failed → [Error message from Stripe]
```

### Admin Apply Credit Flow

```
[Admin Org Billing Detail]
    │
    ▼
[Click "Apply Credit"]
    │
    ▼
[Apply Credit Dialog]
    │
    ├── Enter amount
    ├── Enter reason
    ├── Set expiration (optional)
    │
    ▼
[Click "Apply Credit"]
    │
    ▼
[Credit applied - shown in org's billing]
```

---

## State Management

### Billing Store

```typescript
interface BillingState {
  // Summary
  billingSummary: BillingSummary | null;
  volumeTier: VolumeTier;
  platformFeePercent: number;

  // Modules
  availableModules: ModulePricing[];
  activeSubscriptions: ModuleSubscription[];

  // Payment Methods
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId: string | null;

  // Invoices
  invoices: Invoice[];
  currentInvoice: Invoice | null;

  // Usage
  usageSummary: UsageSummary | null;
  usageRecords: UsageRecord[];

  // Settings
  billingSettings: BillingSettings | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBillingSummary: () => Promise<void>;
  fetchModules: () => Promise<void>;
  subscribeToModule: (moduleKey: string, cycle: BillingCycle) => Promise<void>;
  cancelSubscription: (moduleKey: string, immediate?: boolean) => Promise<void>;
  addPaymentMethod: (paymentMethodId: string) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  fetchInvoices: (filters?: InvoiceFilters) => Promise<void>;
  payInvoice: (invoiceId: string) => Promise<void>;
  updateBillingSettings: (settings: Partial<BillingSettings>) => Promise<void>;
}
```

### Admin Billing Store

```typescript
interface AdminBillingState {
  // Overview
  revenueOverview: RevenueOverview | null;
  tierDistribution: TierDistribution;

  // Organizations
  organizations: OrgBilling[];
  currentOrg: OrgBillingDetail | null;

  // Pricing
  modulePricing: ModulePricing[];
  volumeTiers: VolumeTier[];

  // Actions
  fetchRevenueOverview: (period: DateRange) => Promise<void>;
  fetchOrganizations: (filters?: OrgFilters) => Promise<void>;
  fetchOrgDetail: (orgId: string) => Promise<void>;
  updateOrgBilling: (orgId: string, data: OrgBillingUpdate) => Promise<void>;
  applyCredit: (orgId: string, credit: CreditApplication) => Promise<void>;
  updateModulePricing: (moduleKey: string, pricing: Partial<ModulePricing>) => Promise<void>;
}
```

---

## Validation Rules

### Subscribe to Module
- **Payment Method**: Required, must be valid
- **Billing Cycle**: Required, must be available for module

### Billing Settings
- **Email**: Required, valid email format
- **Address**: Required for tax purposes in some jurisdictions

### Admin Apply Credit
- **Amount**: Required, > 0
- **Reason**: Required, min 10 characters

---

## Responsive Design

### Mobile (< 640px)
- Single column layout
- Stacked module cards
- Bottom sheet for dialogs
- Simplified invoice table (card view)

### Tablet (640px - 1024px)
- Two-column module grid
- Side-by-side billing summary
- Modal dialogs

### Desktop (> 1024px)
- Three-column module grid
- Full billing dashboard layout
- Slide-over for details

---

## Accessibility

### General
- All interactive elements keyboard accessible
- Focus management in dialogs
- Loading states announced
- Error messages linked to fields

### Payment Forms
- Stripe Elements accessibility built-in
- Clear labels and error messages
- High contrast for card inputs

### Data Tables
- Proper table semantics
- Sortable columns announced
- Row actions accessible via keyboard

---

## UI Components (shadcn/ui)

### Required Components
- `Card` - Billing summary, module cards
- `DataTable` - Invoices, transactions
- `Badge` - Status indicators, tier badges
- `Dialog` - Subscribe, cancel, add card
- `Form` - Billing settings
- `Input` - Form fields
- `Button` - Actions
- `Select` - Billing cycle, filters
- `Tabs` - Billing sections
- `Progress` - Volume tier progress
- `Skeleton` - Loading states
- `Alert` - Warnings, errors

### Custom Components
- `StripeCardElement` - Stripe Elements wrapper
- `ModuleCard` - Module display with subscribe
- `TierProgressBar` - Volume tier progress
- `InvoiceRow` - Invoice with quick actions
- `PaymentMethodCard` - Card display with actions

### Stripe Components
- `@stripe/stripe-js` - Stripe.js
- `@stripe/react-stripe-js` - React Elements
- `CardElement` - Card input

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| No payment method | Banner prompting to add card |
| Payment failed | Error message with retry option |
| Subscription past due | Warning banner with pay now CTA |
| Invoice unpaid | Highlight in invoice list |
| Module unavailable | Disabled card with message |
| Network error | Toast with retry option |

---

## Empty States

| Scenario | Message | Action |
|----------|---------|--------|
| No subscriptions | "No premium modules yet" | "Explore Modules" button |
| No invoices | "No invoices yet" | None |
| No payment methods | "Add a payment method to subscribe" | "Add Payment Method" button |
| No usage | "No usage this period" | None |

---

## Notifications

### Success Messages
- "Successfully subscribed to [Module]"
- "Subscription cancelled"
- "Payment method added"
- "Billing settings updated"
- "Invoice paid"

### Warning Messages
- "Your subscription will end on [date]"
- "Payment method expiring soon"
- "Invoice past due"

### Error Messages
- "Payment failed: [reason]"
- "Could not add payment method"
- "Unable to cancel subscription"
