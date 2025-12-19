# F6: Stripe Connect Payments - API Design

## Overview

Payment processing APIs using Stripe Connect with Express accounts.

## Base URL

```
/api/v1/organizations/:orgId/payments
/api/v1/organizations/:orgId/stripe
```

## Stripe Connect Onboarding

### POST /api/v1/organizations/:orgId/stripe/connect

Start Stripe Connect onboarding.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Request:**
```json
{
  "return_url": "https://app.attractionplatform.com/dashboard/settings",
  "refresh_url": "https://app.attractionplatform.com/dashboard/settings/stripe-refresh"
}
```

**Response (200):**
```json
{
  "account_id": "acct_1234567890",
  "onboarding_url": "https://connect.stripe.com/setup/...",
  "expires_at": "2024-01-15T13:00:00Z"
}
```

---

### GET /api/v1/organizations/:orgId/stripe/status

Get Stripe account status.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "connected": true,
  "account_id": "acct_1234567890",
  "charges_enabled": true,
  "payouts_enabled": true,
  "details_submitted": true,
  "business_type": "company",
  "country": "US",
  "default_currency": "usd",
  "capabilities": {
    "card_payments": "active",
    "transfers": "active"
  },
  "requirements": {
    "currently_due": [],
    "eventually_due": [],
    "past_due": []
  },
  "dashboard_url": "https://dashboard.stripe.com/..."
}
```

---

### POST /api/v1/organizations/:orgId/stripe/dashboard-link

Generate Stripe Express dashboard link.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner` or `admin`

**Response (200):**
```json
{
  "url": "https://connect.stripe.com/express/...",
  "expires_at": "2024-01-15T13:00:00Z"
}
```

---

### DELETE /api/v1/organizations/:orgId/stripe/disconnect

Disconnect Stripe account.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`

**Request:**
```json
{
  "confirm": true
}
```

**Response (200):**
```json
{
  "message": "Stripe account disconnected",
  "warning": "Pending payouts may be affected"
}
```

---

## Payment Endpoints

### POST /api/v1/organizations/:orgId/payments/create-intent

Create a payment intent (for client-side confirmation).

**Request:**
```json
{
  "amount": 2500,
  "currency": "usd",
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "description": "2x General Admission - Terror Trail",
  "metadata": {
    "ticket_ids": ["ticket_uuid_1", "ticket_uuid_2"],
    "attraction_id": "attraction_uuid"
  }
}
```

**Response (200):**
```json
{
  "payment_id": "payment_uuid",
  "client_secret": "pi_xxx_secret_xxx",
  "amount": 2500,
  "platform_fee": 103,
  "currency": "usd"
}
```

---

### POST /api/v1/organizations/:orgId/payments/confirm

Confirm payment after client-side processing.

**Request:**
```json
{
  "payment_intent_id": "pi_xxx"
}
```

**Response (200):**
```json
{
  "payment_id": "payment_uuid",
  "status": "succeeded",
  "amount": 2500,
  "receipt_url": "https://..."
}
```

---

### GET /api/v1/organizations/:orgId/payments

List payments.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `finance`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by status
- `start_date`, `end_date` - Date range
- `customer_email` - Filter by customer
- `min_amount`, `max_amount` - Amount range

**Response (200):**
```json
{
  "data": [
    {
      "id": "payment_uuid",
      "stripe_payment_intent_id": "pi_xxx",
      "amount": 2500,
      "platform_fee": 103,
      "net_amount": 2397,
      "currency": "usd",
      "status": "succeeded",
      "payment_method_type": "card",
      "customer_email": "customer@example.com",
      "customer_name": "John Doe",
      "description": "2x General Admission",
      "refunded_amount": 0,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 1250,
    "total_amount": 125000,
    "total_fees": 5125,
    "total_net": 119875
  }
}
```

---

### GET /api/v1/organizations/:orgId/payments/:paymentId

Get payment details.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `finance`

**Response (200):**
```json
{
  "id": "payment_uuid",
  "stripe_payment_intent_id": "pi_xxx",
  "stripe_charge_id": "ch_xxx",
  "amount": 2500,
  "platform_fee": 103,
  "net_amount": 2397,
  "currency": "usd",
  "status": "succeeded",
  "payment_method": {
    "type": "card",
    "card_brand": "visa",
    "card_last4": "4242"
  },
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "description": "2x General Admission - Terror Trail",
  "metadata": {
    "ticket_ids": ["ticket_uuid_1", "ticket_uuid_2"],
    "attraction_id": "attraction_uuid"
  },
  "refunded_amount": 0,
  "refunds": [],
  "receipt_url": "https://pay.stripe.com/receipts/...",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Refund Endpoints

### POST /api/v1/organizations/:orgId/payments/:paymentId/refund

Issue a refund.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `finance`

**Request:**
```json
{
  "amount": 1250,
  "reason": "requested_by_customer",
  "notes": "Customer requested refund for 1 ticket"
}
```

**Response (200):**
```json
{
  "refund_id": "refund_uuid",
  "stripe_refund_id": "re_xxx",
  "amount": 1250,
  "status": "succeeded",
  "payment": {
    "id": "payment_uuid",
    "original_amount": 2500,
    "refunded_amount": 1250,
    "remaining_amount": 1250
  }
}
```

---

### GET /api/v1/organizations/:orgId/refunds

List refunds.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `finance`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by status
- `start_date`, `end_date` - Date range
- `reason` - Filter by reason

**Response (200):**
```json
{
  "data": [
    {
      "id": "refund_uuid",
      "payment_id": "payment_uuid",
      "stripe_refund_id": "re_xxx",
      "amount": 1250,
      "reason": "requested_by_customer",
      "status": "succeeded",
      "refunded_by": {
        "id": "user_uuid",
        "name": "Finance Manager"
      },
      "notes": "Customer requested refund for 1 ticket",
      "created_at": "2024-01-15T14:00:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "total_amount": 12500
  }
}
```

---

## Payout Endpoints

### GET /api/v1/organizations/:orgId/payouts

List payouts.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `finance`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by status
- `start_date`, `end_date` - Date range

**Response (200):**
```json
{
  "data": [
    {
      "id": "payout_uuid",
      "stripe_payout_id": "po_xxx",
      "amount": 45000,
      "currency": "usd",
      "status": "paid",
      "arrival_date": "2024-01-17",
      "method": "standard",
      "bank_account_last4": "1234",
      "created_at": "2024-01-15T00:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "total_amount": 156000
  }
}
```

---

### GET /api/v1/organizations/:orgId/payouts/balance

Get current balance.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `finance`

**Response (200):**
```json
{
  "available": [
    {
      "amount": 25000,
      "currency": "usd"
    }
  ],
  "pending": [
    {
      "amount": 12500,
      "currency": "usd"
    }
  ],
  "instant_available": [
    {
      "amount": 25000,
      "currency": "usd"
    }
  ]
}
```

---

## Customer Endpoints

### GET /api/v1/organizations/:orgId/customers

List customers.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`, `limit` - Pagination
- `search` - Search by email/name

**Response (200):**
```json
{
  "data": [
    {
      "id": "customer_uuid",
      "email": "customer@example.com",
      "name": "John Doe",
      "total_spent": 7500,
      "order_count": 3,
      "last_order_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET /api/v1/organizations/:orgId/customers/:customerId

Get customer details with purchase history.

**Response (200):**
```json
{
  "id": "customer_uuid",
  "email": "customer@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "total_spent": 7500,
  "order_count": 3,
  "payments": [
    {
      "id": "payment_uuid",
      "amount": 2500,
      "status": "succeeded",
      "description": "2x General Admission",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Financial Reports

### GET /api/v1/organizations/:orgId/payments/report

Get payment report.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `owner`, `admin`, or `finance`

**Query Parameters:**
- `start_date`, `end_date` - Date range (required)
- `group_by` - day, week, month
- `format` - json, csv

**Response (200):**
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "summary": {
    "total_revenue": 125000,
    "total_fees": 5125,
    "total_net": 119875,
    "total_refunds": 3500,
    "net_revenue": 116375,
    "transaction_count": 500,
    "average_transaction": 250
  },
  "by_date": [
    {
      "date": "2024-01-01",
      "revenue": 4500,
      "fees": 185,
      "net": 4315,
      "refunds": 0,
      "count": 18
    }
  ],
  "by_payment_method": {
    "card": {"count": 450, "amount": 112500},
    "apple_pay": {"count": 40, "amount": 10000},
    "google_pay": {"count": 10, "amount": 2500}
  }
}
```

---

## Webhook Endpoint

### POST /api/v1/webhooks/stripe

Stripe webhook handler (internal).

**Headers:** `Stripe-Signature: ...`

**Events Handled:**
- `account.updated`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `payout.paid`
- `payout.failed`

---

## Public Checkout Endpoints

### POST /api/v1/checkout/create-session

Create checkout session (public, for ticket purchases).

**Request:**
```json
{
  "attraction_id": "attraction_uuid",
  "items": [
    {
      "ticket_type_id": "type_uuid",
      "quantity": 2,
      "time_slot": "2024-10-25T19:00:00Z"
    }
  ],
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "success_url": "https://terrortrail.com/tickets/success",
  "cancel_url": "https://terrortrail.com/tickets/cancel"
}
```

**Response (200):**
```json
{
  "session_id": "session_uuid",
  "client_secret": "pi_xxx_secret_xxx",
  "amount": 5000,
  "items": [
    {
      "name": "General Admission",
      "quantity": 2,
      "unit_price": 2500,
      "total": 5000
    }
  ],
  "fees": {
    "platform_fee": 175,
    "processing_fee": 0
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| STRIPE_NOT_CONNECTED | 400 | Org hasn't connected Stripe |
| STRIPE_CHARGES_DISABLED | 400 | Account can't accept charges |
| PAYMENT_FAILED | 400 | Payment was declined |
| PAYMENT_NOT_FOUND | 404 | Payment doesn't exist |
| REFUND_EXCEEDS_AMOUNT | 400 | Refund > remaining amount |
| REFUND_WINDOW_EXPIRED | 400 | Past 30-day refund window |
| INSUFFICIENT_BALANCE | 400 | Not enough balance for refund |

## Security

1. **PCI Compliance**: Card data never touches our servers; use Stripe.js/Elements.

2. **Webhook Verification**: All webhooks verified with Stripe signature.

3. **Idempotency**: Use idempotency keys for payment creation.

4. **Amount Validation**: Server-side calculation of amounts, never trust client.

5. **Audit Trail**: All financial operations logged.
