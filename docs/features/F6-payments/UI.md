# F6: Stripe Connect Payments - UI Requirements

## Overview

Payment processing interfaces using Stripe Connect Express accounts for multi-tenant payment handling, including onboarding, payment management, and financial reporting.

## Pages & Routes

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/settings/payments` | Payment Settings | Stripe Connect setup |
| `/settings/payments/onboarding` | Stripe Onboarding | Connect account setup |
| `/settings/payments/payouts` | Payouts | Payout history & settings |
| `/finance` | Finance Dashboard | Financial overview |
| `/finance/transactions` | Transactions | All payment transactions |
| `/finance/transactions/:id` | Transaction Details | Single transaction |
| `/finance/refunds` | Refunds | Refund management |
| `/finance/reports` | Financial Reports | Revenue reports |

### Public Routes (Checkout)

| Route | Page | Description |
|-------|------|-------------|
| `/checkout` | Checkout | Payment collection |
| `/checkout/success` | Success | Payment confirmation |
| `/checkout/cancel` | Cancel | Payment cancelled |

---

## Components

### Stripe Connect Onboarding

#### `<ConnectOnboarding />`
- **States**:
  - Not Connected (show setup button)
  - Onboarding In Progress (show continue button)
  - Restricted (show requirements)
  - Active (show status & manage)
- **Actions**: Start onboarding, Continue onboarding, View dashboard
- **Features**:
  - Progress indicator
  - Requirements checklist
  - Estimated time to complete

#### `<ConnectStatus />`
- **Display**: Account status, capabilities, requirements
- **Statuses**:
  - Pending: "Complete account setup"
  - Restricted: "Action required - [specific issue]"
  - Active: "Ready to accept payments"
- **Actions**: Fix issues, View Stripe dashboard

#### `<RequirementsList />`
- **Display**: Outstanding requirements from Stripe
- **Items**: Document uploads, identity verification, bank account
- **Actions**: Complete requirement (opens Stripe UI)

### Payment Settings

#### `<PaymentSettingsForm />`
- **Sections**:
  - Account Status (connected account info)
  - Default Currency
  - Statement Descriptor
  - Payout Schedule (daily, weekly, monthly)
  - Minimum Payout Amount
- **Actions**: Save, Disconnect (danger)

#### `<PayoutSchedule />`
- **Options**: Daily, Weekly, Monthly, Manual
- **Display**: Next payout date, estimated amount
- **Actions**: Change schedule, Request instant payout

### Finance Dashboard

#### `<FinanceDashboard />`
- **Sections**:
  - Key Metrics (today, week, month, season)
  - Revenue Chart (line/bar graph)
  - Recent Transactions (quick list)
  - Pending Payouts
  - Refund Summary
- **Features**:
  - Date range picker
  - Attraction filter
  - Export button

#### `<RevenueMetrics />`
- **Metrics**:
  - Gross Revenue
  - Net Revenue (after fees/refunds)
  - Platform Fees
  - Refunds
  - Pending Payout
- **Features**: Period comparison, trend indicators

#### `<RevenueChart />`
- **Types**: Line chart, bar chart
- **Data**: Revenue over time
- **Features**:
  - Toggle gross/net
  - Zoom to date range
  - Hover for details

### Transactions

#### `<TransactionsList />`
- **Display**: Table of all transactions
- **Columns**: Date, order #, customer, amount, fees, net, status
- **Actions**: View details, refund, export
- **Features**:
  - Search by order #, customer
  - Filter by status, date range, attraction
  - Sort by date, amount

#### `<TransactionDetails />`
- **Sections**:
  - Payment Info (amount, method, status)
  - Customer Info (name, email)
  - Order Items (tickets, quantities)
  - Fee Breakdown
  - Refund History
  - Stripe Payment ID
- **Actions**: Issue refund, View in Stripe

#### `<TransactionTimeline />`
- **Events**: Created, Authorized, Captured, Refunded, etc.
- **Display**: Chronological timeline with timestamps

### Refunds

#### `<RefundsList />`
- **Display**: Table of refunds
- **Columns**: Date, original order, customer, amount, reason, status
- **Actions**: View original transaction

#### `<RefundForm />`
- **Fields**:
  - Amount (full or partial)
  - Reason (dropdown + notes)
  - Notify Customer (checkbox)
- **Actions**: Process Refund, Cancel
- **Validation**: Amount ≤ remaining refundable

#### `<RefundConfirmation />`
- **Display**: Summary of refund
- **Info**: Amount, destination, timeline (3-5 business days)
- **Actions**: Confirm, Cancel

### Checkout (Public)

#### `<CheckoutPage />`
- **Sections**:
  - Order Summary (items, prices)
  - Customer Info (email, phone)
  - Payment Method (Stripe Elements)
  - Promo Code Input
  - Total with breakdown
- **Actions**: Pay Now, Back to Cart

#### `<StripePaymentElement />`
- **Features**:
  - Credit/debit cards
  - Apple Pay / Google Pay
  - Link (Stripe's saved payment)
  - Localized to user
- **States**: Loading, Ready, Processing, Error

#### `<OrderSummary />`
- **Display**: Items, quantities, prices
- **Breakdown**:
  - Subtotal
  - Discounts (promo codes)
  - Fees (if applicable)
  - Taxes (if applicable)
  - Total

#### `<PaymentSuccess />`
- **Display**: Confirmation message, order number
- **Actions**: View tickets, Download receipt
- **Features**: Confetti animation, share buttons

### Payouts

#### `<PayoutsList />`
- **Display**: Table of payouts
- **Columns**: Date, amount, status, bank account, arrival date
- **Actions**: View details

#### `<PayoutDetails />`
- **Display**: Transactions included in payout
- **Info**: Total, fees deducted, net amount, bank details

#### `<PendingPayout />`
- **Display**: Amount pending, expected date
- **Breakdown**: Transactions contributing to payout
- **Actions**: Request instant payout (if eligible)

---

## User Flows

### Stripe Connect Onboarding Flow
```
[Payment Settings - Not Connected]
    │
    ▼
[Connect with Stripe Button]
    │
    ▼
[Redirect to Stripe Connect Onboarding]
    │
    ├── Business Type Selection
    ├── Business Details
    ├── Identity Verification
    ├── Bank Account
    │
    ▼
[Return to Platform]
    │
    ├── Complete → [Active Status]
    │
    └── Incomplete → [Continue Setup Button]
            │
            ▼
        [Requirements List]
            │
            ▼
        [Complete Each Requirement]
```

### Checkout Flow
```
[Cart with items]
    │
    ▼
[Proceed to Checkout]
    │
    ▼
[Checkout Page]
    │
    ├── Enter Email/Phone
    ├── Apply Promo Code (optional)
    ├── Enter Payment Method
    │
    ▼
[Pay Now Button]
    │
    ▼
[Processing State]
    │
    ├── Success → [Success Page]
    │       │
    │       ├── Confirmation Email Sent
    │       ├── Tickets Available
    │       └── Receipt Link
    │
    ├── Requires Action → [3D Secure/Authentication]
    │       │
    │       ▼
    │   [Complete Authentication]
    │       │
    │       ├── Success → [Success Page]
    │       └── Failed → [Error Message]
    │
    └── Failed → [Error Message with Retry]
```

### Issue Refund Flow
```
[Transaction Details]
    │
    ▼
[Refund Button]
    │
    ▼
[Refund Form Modal]
    │
    ├── Select Amount (full/partial)
    ├── Select Reason
    ├── Add Notes (internal)
    ├── Notify Customer? (checkbox)
    │
    ▼
[Review Refund Summary]
    │
    ▼
[Confirm Refund]
    │
    ▼
[Processing → Success]
    │
    ├── Transaction status updated
    ├── Customer notified (if selected)
    └── Refund appears in list
```

---

## State Management

### Payment Store
```typescript
interface PaymentState {
  // Connect
  connectAccount: StripeConnectAccount | null;
  connectStatus: 'not_connected' | 'onboarding' | 'restricted' | 'active';
  requirements: StripeRequirement[];

  // Transactions
  transactions: Transaction[];
  currentTransaction: TransactionDetails | null;

  // Payouts
  payouts: Payout[];
  pendingPayout: PendingPayout | null;

  // Metrics
  revenueMetrics: RevenueMetrics;

  isLoading: boolean;

  // Actions
  fetchConnectStatus: () => Promise<void>;
  createConnectLink: () => Promise<string>;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  fetchTransaction: (id: string) => Promise<void>;
  issueRefund: (transactionId: string, data: RefundData) => Promise<void>;
  fetchPayouts: () => Promise<void>;
  requestInstantPayout: () => Promise<void>;
}
```

### Checkout Store
```typescript
interface CheckoutState {
  order: OrderSummary;
  customerInfo: CustomerInfo | null;
  paymentIntent: PaymentIntent | null;
  promoCode: PromoCode | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  initializeCheckout: (cartId: string) => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;
  processPayment: (paymentMethod: PaymentMethod) => Promise<void>;
}
```

---

## Validation Rules

### Refund
- **Amount**: Required, > 0, ≤ refundable amount
- **Reason**: Required selection
- **Notes**: Optional, max 500 characters

### Checkout
- **Email**: Required, valid format
- **Phone**: Required for SMS tickets, valid format
- **Payment Method**: Valid Stripe payment method

### Payout Settings
- **Minimum Amount**: ≥ $1.00
- **Statement Descriptor**: 5-22 characters, alphanumeric

---

## Responsive Design

### Mobile (< 640px)
- Single column checkout
- Simplified transaction cards
- Bottom sheet for refund form
- Collapsible order summary

### Tablet (640px - 1024px)
- Two-column checkout
- Side-by-side metrics
- Modal for refund form

### Desktop (> 1024px)
- Two-column checkout with sticky summary
- Full transaction table
- Slide-over for details
- Dashboard with charts

---

## Accessibility

### Checkout
- Payment form fully accessible
- Error messages linked to fields
- Loading states announced
- Success/failure clearly communicated

### Transaction Tables
- Proper table semantics
- Sortable columns announced
- Filter changes announced
- Action buttons labeled

### Charts
- Data table alternative available
- Color-blind friendly palette
- Keyboard navigable

---

## UI Components (shadcn/ui)

### Required Components
- `Card` - Metrics, summaries
- `DataTable` - Transactions, payouts
- `Badge` - Status indicators
- `Dialog` - Refund modal
- `Form` - Checkout, settings
- `Input` - Form fields
- `Button` - Actions
- `Skeleton` - Loading states
- `Chart` - Revenue charts (recharts)

### Custom Components
- `StripePaymentElement` - Stripe Elements wrapper
- `ConnectStatusCard` - Account status display
- `RefundForm` - Refund workflow
- `PayoutCard` - Payout summary
- `TransactionRow` - Transaction with quick actions

### Stripe Components
- `@stripe/stripe-js` - Stripe.js
- `@stripe/react-stripe-js` - React Elements
- `PaymentElement` - Universal payment method
- `LinkAuthenticationElement` - Stripe Link

---

## Security Considerations

### PCI Compliance
- Never store card numbers
- Use Stripe Elements for payment input
- All payment data handled by Stripe

### Financial Data
- Role-based access to transactions
- Audit log for all refunds
- Sensitive data masked in logs

### API Security
- Webhook signature verification
- Idempotency keys for payments
- Rate limiting on payment endpoints

---

## Error States

| Scenario | UI Response |
|----------|-------------|
| Connect not complete | Banner with setup CTA |
| Payment failed | Inline error with retry |
| Card declined | Specific error message |
| Refund failed | Toast with reason |
| Payout failed | Alert with Stripe link |
| Webhook error | Admin notification |
| 3D Secure failed | Return to payment with message |

---

## Stripe Connect Capabilities

### Required Capabilities
- `card_payments` - Accept card payments
- `transfers` - Receive payouts

### Optional Capabilities
- `tax_reporting_us_1099_misc` - US tax reporting
- `us_bank_account_ach_payments` - ACH payments

### Fee Structure Display
- Platform fee percentage (configurable)
- Stripe processing fee (2.9% + 30¢)
- Net amount calculation
- Fee breakdown on transactions
