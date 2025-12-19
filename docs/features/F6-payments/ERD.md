# F6: Stripe Connect Payments - ERD

## Overview

Payment processing using Stripe Connect with Express accounts. Each organization has their own Stripe account, and the platform takes a percentage fee on each transaction.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Customer      │────▶│   Platform      │────▶│  Organization   │
│  (Cardholder)   │     │(Attraction Plat)│     │ (Stripe Express)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        Platform Fee
                        (2.9% + 30¢)
```

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        organizations                             │
│                          (from F2)                               │
├─────────────────────────────────────────────────────────────────┤
│ stripe_account_id        VARCHAR(255)                            │
│ stripe_onboarding_complete BOOLEAN                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     stripe_accounts                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id UNIQUE NOT NULL       │
│ stripe_account_id VARCHAR(255) UNIQUE NOT NULL                   │
│ account_type    stripe_account_type DEFAULT 'express'            │
│ charges_enabled BOOLEAN DEFAULT FALSE                            │
│ payouts_enabled BOOLEAN DEFAULT FALSE                            │
│ details_submitted BOOLEAN DEFAULT FALSE                          │
│ business_type   VARCHAR(50)                                      │
│ country         VARCHAR(2)                                       │
│ default_currency VARCHAR(3) DEFAULT 'usd'                        │
│ capabilities    JSONB DEFAULT '{}'                               │
│ requirements    JSONB DEFAULT '{}'                               │
│ metadata        JSONB DEFAULT '{}'                               │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        payments                                  │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ stripe_payment_intent_id VARCHAR(255) UNIQUE                     │
│ stripe_charge_id VARCHAR(255)                                    │
│ amount          INTEGER NOT NULL                                 │
│ currency        VARCHAR(3) DEFAULT 'usd'                         │
│ platform_fee    INTEGER NOT NULL                                 │
│ net_amount      INTEGER NOT NULL                                 │
│ status          payment_status DEFAULT 'pending'                 │
│ payment_method_type VARCHAR(50)                                  │
│ customer_email  VARCHAR(255)                                     │
│ customer_name   VARCHAR(200)                                     │
│ description     TEXT                                             │
│ metadata        JSONB DEFAULT '{}'                               │
│ failure_code    VARCHAR(100)                                     │
│ failure_message TEXT                                             │
│ refunded_amount INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         refunds                                  │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ payment_id      UUID FK → payments.id NOT NULL                   │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ stripe_refund_id VARCHAR(255) UNIQUE                             │
│ amount          INTEGER NOT NULL                                 │
│ reason          refund_reason                                    │
│ status          refund_status DEFAULT 'pending'                  │
│ refunded_by     UUID FK → profiles.id                            │
│ notes           TEXT                                             │
│ metadata        JSONB DEFAULT '{}'                               │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        payouts                                   │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ stripe_payout_id VARCHAR(255) UNIQUE                             │
│ amount          INTEGER NOT NULL                                 │
│ currency        VARCHAR(3) DEFAULT 'usd'                         │
│ status          payout_status DEFAULT 'pending'                  │
│ arrival_date    DATE                                             │
│ method          VARCHAR(50)                                      │
│ bank_account_last4 VARCHAR(4)                                    │
│ failure_code    VARCHAR(100)                                     │
│ failure_message TEXT                                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     payment_methods                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ customer_id     UUID FK → customers.id                           │
│ stripe_pm_id    VARCHAR(255) UNIQUE NOT NULL                     │
│ type            VARCHAR(50) NOT NULL                             │
│ card_brand      VARCHAR(20)                                      │
│ card_last4      VARCHAR(4)                                       │
│ card_exp_month  INTEGER                                          │
│ card_exp_year   INTEGER                                          │
│ is_default      BOOLEAN DEFAULT FALSE                            │
│ billing_details JSONB DEFAULT '{}'                               │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       customers                                  │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ stripe_customer_id VARCHAR(255)                                  │
│ email           VARCHAR(255) NOT NULL                            │
│ name            VARCHAR(200)                                     │
│ phone           VARCHAR(20)                                      │
│ metadata        JSONB DEFAULT '{}'                               │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, email)                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    stripe_webhooks                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ stripe_event_id VARCHAR(255) UNIQUE NOT NULL                     │
│ event_type      VARCHAR(100) NOT NULL                            │
│ org_id          UUID FK → organizations.id                       │
│ payload         JSONB NOT NULL                                   │
│ processed       BOOLEAN DEFAULT FALSE                            │
│ processed_at    TIMESTAMPTZ                                      │
│ error_message   TEXT                                             │
│ retry_count     INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

```sql
CREATE TYPE stripe_account_type AS ENUM ('express', 'standard', 'custom');

CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'requires_action',
  'requires_capture',
  'succeeded',
  'failed',
  'canceled'
);

CREATE TYPE refund_status AS ENUM (
  'pending',
  'succeeded',
  'failed',
  'canceled'
);

CREATE TYPE refund_reason AS ENUM (
  'duplicate',
  'fraudulent',
  'requested_by_customer',
  'event_canceled',
  'other'
);

CREATE TYPE payout_status AS ENUM (
  'pending',
  'in_transit',
  'paid',
  'failed',
  'canceled'
);
```

## Tables

### stripe_accounts

Stripe Connect account details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Internal ID |
| org_id | UUID | FK, UNIQUE, NOT NULL | Organization reference |
| stripe_account_id | VARCHAR(255) | UNIQUE, NOT NULL | Stripe account ID (acct_xxx) |
| account_type | stripe_account_type | DEFAULT 'express' | Account type |
| charges_enabled | BOOLEAN | DEFAULT FALSE | Can accept charges |
| payouts_enabled | BOOLEAN | DEFAULT FALSE | Can receive payouts |
| details_submitted | BOOLEAN | DEFAULT FALSE | Onboarding complete |
| business_type | VARCHAR(50) | | individual/company |
| country | VARCHAR(2) | | Account country |
| default_currency | VARCHAR(3) | DEFAULT 'usd' | Default currency |
| capabilities | JSONB | DEFAULT '{}' | Account capabilities |
| requirements | JSONB | DEFAULT '{}' | Outstanding requirements |
| metadata | JSONB | DEFAULT '{}' | Additional data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### payments

All payment transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Payment ID |
| org_id | UUID | FK, NOT NULL | Organization |
| stripe_payment_intent_id | VARCHAR(255) | UNIQUE | Stripe PaymentIntent ID |
| stripe_charge_id | VARCHAR(255) | | Stripe Charge ID |
| amount | INTEGER | NOT NULL | Total amount in cents |
| currency | VARCHAR(3) | DEFAULT 'usd' | Currency code |
| platform_fee | INTEGER | NOT NULL | Platform fee in cents |
| net_amount | INTEGER | NOT NULL | Amount after fees |
| status | payment_status | DEFAULT 'pending' | Payment status |
| payment_method_type | VARCHAR(50) | | card, bank_transfer, etc. |
| customer_email | VARCHAR(255) | | Customer email |
| customer_name | VARCHAR(200) | | Customer name |
| description | TEXT | | Payment description |
| metadata | JSONB | DEFAULT '{}' | Ticket IDs, etc. |
| failure_code | VARCHAR(100) | | Stripe failure code |
| failure_message | TEXT | | Failure details |
| refunded_amount | INTEGER | DEFAULT 0 | Total refunded |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### refunds

Refund transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Refund ID |
| payment_id | UUID | FK, NOT NULL | Original payment |
| org_id | UUID | FK, NOT NULL | Organization |
| stripe_refund_id | VARCHAR(255) | UNIQUE | Stripe Refund ID |
| amount | INTEGER | NOT NULL | Refund amount in cents |
| reason | refund_reason | | Refund reason |
| status | refund_status | DEFAULT 'pending' | Refund status |
| refunded_by | UUID | FK | Who issued refund |
| notes | TEXT | | Internal notes |
| metadata | JSONB | DEFAULT '{}' | Additional data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### customers

Customer records for saved payment methods.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Customer ID |
| org_id | UUID | FK, NOT NULL | Organization |
| stripe_customer_id | VARCHAR(255) | | Stripe Customer ID |
| email | VARCHAR(255) | NOT NULL | Customer email |
| name | VARCHAR(200) | | Customer name |
| phone | VARCHAR(20) | | Customer phone |
| metadata | JSONB | DEFAULT '{}' | Additional data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

## Indexes

```sql
-- Stripe accounts
CREATE UNIQUE INDEX stripe_accounts_org_idx ON stripe_accounts(org_id);
CREATE UNIQUE INDEX stripe_accounts_stripe_idx ON stripe_accounts(stripe_account_id);

-- Payments
CREATE INDEX payments_org_idx ON payments(org_id);
CREATE INDEX payments_status_idx ON payments(status);
CREATE INDEX payments_created_idx ON payments(created_at DESC);
CREATE INDEX payments_customer_email_idx ON payments(org_id, customer_email);
CREATE UNIQUE INDEX payments_intent_idx ON payments(stripe_payment_intent_id);

-- Refunds
CREATE INDEX refunds_payment_idx ON refunds(payment_id);
CREATE INDEX refunds_org_idx ON refunds(org_id);

-- Payouts
CREATE INDEX payouts_org_idx ON payouts(org_id);
CREATE INDEX payouts_status_idx ON payouts(status);

-- Customers
CREATE UNIQUE INDEX customers_org_email_idx ON customers(org_id, email);
CREATE INDEX customers_stripe_idx ON customers(stripe_customer_id);

-- Webhooks
CREATE UNIQUE INDEX webhooks_event_idx ON stripe_webhooks(stripe_event_id);
CREATE INDEX webhooks_unprocessed_idx ON stripe_webhooks(processed, created_at)
  WHERE processed = FALSE;
```

## RLS Policies

```sql
-- Payments: Org members with finance role can view
CREATE POLICY "Finance can view payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = payments.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'finance')
        AND status = 'active'
    )
  );

-- Refunds: Finance can create
CREATE POLICY "Finance can create refunds"
  ON refunds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_memberships
        WHERE org_id = refunds.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'finance')
        AND status = 'active'
    )
  );

-- Customers: Visible to org members
CREATE POLICY "Org members can view customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = customers.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );
```

## Platform Fee Calculation

```sql
CREATE OR REPLACE FUNCTION calculate_platform_fee(
  p_amount INTEGER,
  p_org_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_fee_percent DECIMAL;
  v_fee_fixed INTEGER;
BEGIN
  -- Default: 2.9% + 30¢
  v_fee_percent := 0.029;
  v_fee_fixed := 30;

  -- Could check for special org pricing here
  -- SELECT custom_fee_percent INTO v_fee_percent FROM org_pricing WHERE org_id = p_org_id;

  RETURN CEIL(p_amount * v_fee_percent) + v_fee_fixed;
END;
$$ LANGUAGE plpgsql;
```

## Webhook Event Handlers

| Event | Handler |
|-------|---------|
| `account.updated` | Update stripe_accounts |
| `payment_intent.succeeded` | Update payments, trigger ticket delivery |
| `payment_intent.payment_failed` | Update payments, notify |
| `charge.refunded` | Create/update refunds |
| `payout.paid` | Update payouts |
| `payout.failed` | Update payouts, notify |

## Business Rules

1. **Platform Fee**: Default 2.9% + 30¢, configurable per org.

2. **Refund Window**: Refunds allowed within 30 days of purchase.

3. **Partial Refunds**: Multiple partial refunds allowed up to original amount.

4. **Payout Schedule**: Automatic daily payouts once account is verified.

5. **Currency**: All amounts stored in smallest unit (cents).

6. **Idempotency**: Use stripe_payment_intent_id for idempotent operations.

## Connect Onboarding Flow

```
1. Org clicks "Connect Stripe"
2. Create Express account via API
3. Store stripe_account_id in organizations
4. Create stripe_accounts record
5. Generate onboarding link
6. Redirect user to Stripe
7. Stripe redirects back with status
8. Webhook updates account status
9. charges_enabled = TRUE when ready
```

## Dependencies

- **F2 Organizations**: stripe_account_id storage

## Migration Order

1. Create enums
2. Create stripe_accounts table
3. Create customers table
4. Create payments table
5. Create refunds table
6. Create payouts table
7. Create payment_methods table
8. Create stripe_webhooks table
9. Create indexes
10. Create RLS policies
11. Create helper functions
