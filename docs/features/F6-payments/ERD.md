# F6: Stripe Connect - ERD

## Overview

Stripe Connect integration using Express accounts for marketplace payments. Allows organizations to accept payments for tickets and merchandise with platform fee collection.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        organizations                             │
│                          (from F2)                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ ...                                                              │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      stripe_accounts                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK UNIQUE → organizations.id                │
│ stripe_account_id VARCHAR(255) UNIQUE                            │
│ status          account_status ENUM                              │
│ type            VARCHAR(50) 'express'                            │
│ charges_enabled BOOLEAN                                          │
│ payouts_enabled BOOLEAN                                          │
│ details_submitted BOOLEAN                                        │
│ onboarding_url  TEXT                                             │
│ dashboard_url   TEXT                                             │
│ country         VARCHAR(2)                                       │
│ default_currency VARCHAR(3)                                      │
│ metadata        JSONB                                            │
│ created_at      TIMESTAMPTZ                                      │
│ updated_at      TIMESTAMPTZ                                      │
└─────────────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────┐
         │ 1:N                      │ 1:N
         ▼                          ▼
┌──────────────────────┐  ┌──────────────────────┐
│   stripe_payouts     │  │ stripe_transactions  │
├──────────────────────┤  ├──────────────────────┤
│ id           UUID PK │  │ id           UUID PK │
│ stripe_account_id FK │  │ stripe_account_id FK │
│ stripe_payout_id TXT │  │ stripe_payment_id TX │
│ amount       INTEGER │  │ type         ENUM    │
│ currency     VARCHAR │  │ amount       INTEGER │
│ status       ENUM    │  │ fee          INTEGER │
│ arrival_date DATE    │  │ net          INTEGER │
│ ...                  │  │ status       ENUM    │
└──────────────────────┘  │ ...                  │
                          └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      stripe_webhooks                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ stripe_event_id VARCHAR(255) UNIQUE                              │
│ type            VARCHAR(255)                                     │
│ processed       BOOLEAN                                          │
│ payload         JSONB                                            │
│ error           TEXT                                             │
│ created_at      TIMESTAMPTZ                                      │
│ processed_at    TIMESTAMPTZ                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

```sql
CREATE TYPE account_status AS ENUM (
  'pending',      -- Account created, onboarding not started
  'onboarding',   -- Onboarding in progress
  'active',       -- Fully verified and operational
  'restricted',   -- Limited functionality due to issues
  'disabled'      -- Account disabled
);

CREATE TYPE payout_status AS ENUM (
  'pending',
  'in_transit',
  'paid',
  'failed',
  'canceled'
);

CREATE TYPE transaction_type AS ENUM (
  'charge',       -- Customer payment
  'refund',       -- Refund to customer
  'transfer',     -- Transfer to connected account
  'payout',       -- Payout to bank account
  'fee',          -- Platform fee
  'adjustment'    -- Manual adjustment
);

CREATE TYPE transaction_status AS ENUM (
  'pending',
  'succeeded',
  'failed',
  'refunded',
  'partially_refunded',
  'disputed'
);
```

## Tables

### stripe_accounts

Connected Stripe Express accounts for organizations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Internal account ID |
| org_id | UUID | FK → organizations.id, UNIQUE | Organization this account belongs to |
| stripe_account_id | VARCHAR(255) | UNIQUE, NOT NULL | Stripe account ID (acct_xxx) |
| status | account_status | DEFAULT 'pending' | Current account status |
| type | VARCHAR(50) | DEFAULT 'express' | Account type (always 'express') |
| charges_enabled | BOOLEAN | DEFAULT FALSE | Can accept charges |
| payouts_enabled | BOOLEAN | DEFAULT FALSE | Can receive payouts |
| details_submitted | BOOLEAN | DEFAULT FALSE | Onboarding completed |
| onboarding_url | TEXT | | Current onboarding link (temporary) |
| dashboard_url | TEXT | | Express dashboard login link |
| country | VARCHAR(2) | DEFAULT 'US' | Account country code |
| default_currency | VARCHAR(3) | DEFAULT 'usd' | Default currency |
| business_type | VARCHAR(50) | | 'individual' or 'company' |
| business_name | VARCHAR(255) | | Displayed business name |
| metadata | JSONB | DEFAULT '{}' | Additional Stripe account data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When account was created |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

### stripe_payouts

Payout records for connected accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Internal payout ID |
| stripe_account_id | UUID | FK → stripe_accounts.id | Connected account |
| stripe_payout_id | VARCHAR(255) | UNIQUE, NOT NULL | Stripe payout ID (po_xxx) |
| amount | INTEGER | NOT NULL | Amount in cents |
| currency | VARCHAR(3) | DEFAULT 'usd' | Currency code |
| status | payout_status | DEFAULT 'pending' | Payout status |
| arrival_date | DATE | | Expected arrival date |
| method | VARCHAR(50) | | 'standard' or 'instant' |
| destination_type | VARCHAR(50) | | 'bank_account' or 'card' |
| destination_last4 | VARCHAR(4) | | Last 4 of destination |
| failure_code | VARCHAR(100) | | Failure reason code |
| failure_message | TEXT | | Failure description |
| metadata | JSONB | DEFAULT '{}' | Additional payout data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When payout was initiated |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

### stripe_transactions

All financial transactions through the platform.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Internal transaction ID |
| stripe_account_id | UUID | FK → stripe_accounts.id | Connected account |
| stripe_payment_intent_id | VARCHAR(255) | | Stripe PaymentIntent ID (pi_xxx) |
| stripe_charge_id | VARCHAR(255) | | Stripe Charge ID (ch_xxx) |
| stripe_refund_id | VARCHAR(255) | | Stripe Refund ID (re_xxx) |
| type | transaction_type | NOT NULL | Transaction type |
| status | transaction_status | DEFAULT 'pending' | Transaction status |
| amount | INTEGER | NOT NULL | Gross amount in cents |
| currency | VARCHAR(3) | DEFAULT 'usd' | Currency code |
| platform_fee | INTEGER | DEFAULT 0 | Platform fee in cents |
| stripe_fee | INTEGER | DEFAULT 0 | Stripe processing fee in cents |
| net_amount | INTEGER | NOT NULL | Net amount to account |
| description | TEXT | | Transaction description |
| customer_email | VARCHAR(255) | | Customer email if available |
| order_id | UUID | | Reference to order (F8 tickets) |
| metadata | JSONB | DEFAULT '{}' | Additional transaction data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Transaction time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

### stripe_webhooks

Webhook event log for idempotency and debugging.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Internal event ID |
| stripe_event_id | VARCHAR(255) | UNIQUE, NOT NULL | Stripe event ID (evt_xxx) |
| type | VARCHAR(255) | NOT NULL | Event type (e.g., 'account.updated') |
| api_version | VARCHAR(50) | | Stripe API version |
| processed | BOOLEAN | DEFAULT FALSE | Whether event was processed |
| payload | JSONB | NOT NULL | Full event payload |
| error | TEXT | | Processing error if failed |
| attempts | INTEGER | DEFAULT 0 | Processing attempts |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When event was received |
| processed_at | TIMESTAMPTZ | | When event was processed |

## Indexes

```sql
-- stripe_accounts
CREATE UNIQUE INDEX stripe_accounts_org_id_idx ON stripe_accounts(org_id);
CREATE UNIQUE INDEX stripe_accounts_stripe_id_idx ON stripe_accounts(stripe_account_id);
CREATE INDEX stripe_accounts_status_idx ON stripe_accounts(status);

-- stripe_payouts
CREATE INDEX stripe_payouts_account_idx ON stripe_payouts(stripe_account_id);
CREATE INDEX stripe_payouts_status_idx ON stripe_payouts(status);
CREATE INDEX stripe_payouts_created_idx ON stripe_payouts(created_at DESC);

-- stripe_transactions
CREATE INDEX stripe_transactions_account_idx ON stripe_transactions(stripe_account_id);
CREATE INDEX stripe_transactions_status_idx ON stripe_transactions(status);
CREATE INDEX stripe_transactions_type_idx ON stripe_transactions(type);
CREATE INDEX stripe_transactions_created_idx ON stripe_transactions(created_at DESC);
CREATE INDEX stripe_transactions_payment_intent_idx ON stripe_transactions(stripe_payment_intent_id);

-- stripe_webhooks
CREATE UNIQUE INDEX stripe_webhooks_event_id_idx ON stripe_webhooks(stripe_event_id);
CREATE INDEX stripe_webhooks_type_idx ON stripe_webhooks(type);
CREATE INDEX stripe_webhooks_processed_idx ON stripe_webhooks(processed);
CREATE INDEX stripe_webhooks_created_idx ON stripe_webhooks(created_at DESC);
```

## RLS Policies

```sql
-- stripe_accounts: Org members can read, owners/admins can manage
ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view stripe account"
  ON stripe_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE user_id = auth.uid()
        AND org_id = stripe_accounts.org_id
        AND status = 'active'
    )
  );

CREATE POLICY "Org owners/admins can manage stripe account"
  ON stripe_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE user_id = auth.uid()
        AND org_id = stripe_accounts.org_id
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Super admins can manage all stripe accounts"
  ON stripe_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- stripe_payouts: Read-only for org members, super admin full access
ALTER TABLE stripe_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view payouts"
  ON stripe_payouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stripe_accounts sa
      JOIN org_memberships om ON om.org_id = sa.org_id
      WHERE sa.id = stripe_payouts.stripe_account_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

CREATE POLICY "Super admins can manage all payouts"
  ON stripe_payouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- stripe_transactions: Similar to payouts
ALTER TABLE stripe_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view transactions"
  ON stripe_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stripe_accounts sa
      JOIN org_memberships om ON om.org_id = sa.org_id
      WHERE sa.id = stripe_transactions.stripe_account_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

CREATE POLICY "Super admins can manage all transactions"
  ON stripe_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- stripe_webhooks: Service role only (processed by API)
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view webhooks"
  ON stripe_webhooks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );
```

## Helper Functions

```sql
-- Get org's Stripe account status
CREATE OR REPLACE FUNCTION get_org_stripe_status(p_org_id UUID)
RETURNS TABLE (
  is_connected BOOLEAN,
  status account_status,
  charges_enabled BOOLEAN,
  payouts_enabled BOOLEAN,
  needs_onboarding BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sa.id IS NOT NULL AS is_connected,
    sa.status,
    sa.charges_enabled,
    sa.payouts_enabled,
    (sa.status IS NULL OR sa.status IN ('pending', 'onboarding')) AS needs_onboarding
  FROM organizations o
  LEFT JOIN stripe_accounts sa ON sa.org_id = o.id
  WHERE o.id = p_org_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate platform fees for a transaction
CREATE OR REPLACE FUNCTION calculate_platform_fee(
  p_amount INTEGER,
  p_fee_percent NUMERIC DEFAULT 2.5
)
RETURNS INTEGER AS $$
BEGIN
  -- Fee is percentage of amount, rounded to nearest cent
  RETURN ROUND(p_amount * (p_fee_percent / 100.0))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get transaction summary for an account
CREATE OR REPLACE FUNCTION get_transaction_summary(
  p_stripe_account_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_charges INTEGER,
  total_refunds INTEGER,
  total_fees INTEGER,
  net_revenue INTEGER,
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'charge' AND status = 'succeeded' THEN amount ELSE 0 END), 0)::INTEGER AS total_charges,
    COALESCE(SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END), 0)::INTEGER AS total_refunds,
    COALESCE(SUM(platform_fee + stripe_fee), 0)::INTEGER AS total_fees,
    COALESCE(SUM(CASE WHEN status = 'succeeded' THEN net_amount ELSE 0 END), 0)::INTEGER AS net_revenue,
    COUNT(*)::BIGINT AS transaction_count
  FROM stripe_transactions
  WHERE stripe_account_id = p_stripe_account_id
    AND (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
END;
$$ LANGUAGE plpgsql STABLE;
```

## Triggers

```sql
-- Update updated_at on stripe_accounts changes
CREATE TRIGGER update_stripe_accounts_updated_at
  BEFORE UPDATE ON stripe_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on stripe_payouts changes
CREATE TRIGGER update_stripe_payouts_updated_at
  BEFORE UPDATE ON stripe_payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on stripe_transactions changes
CREATE TRIGGER update_stripe_transactions_updated_at
  BEFORE UPDATE ON stripe_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Calculate net_amount before insert/update
CREATE OR REPLACE FUNCTION calculate_transaction_net()
RETURNS TRIGGER AS $$
BEGIN
  NEW.net_amount := NEW.amount - COALESCE(NEW.platform_fee, 0) - COALESCE(NEW.stripe_fee, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_transaction_net_trigger
  BEFORE INSERT OR UPDATE ON stripe_transactions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_transaction_net();
```

## Stripe Webhook Events to Handle

| Event Type | Description | Action |
|------------|-------------|--------|
| `account.updated` | Connected account info changed | Update stripe_accounts |
| `account.application.deauthorized` | Account disconnected | Set status to 'disabled' |
| `payout.created` | Payout initiated | Create stripe_payouts record |
| `payout.updated` | Payout status changed | Update stripe_payouts |
| `payout.paid` | Payout completed | Update status to 'paid' |
| `payout.failed` | Payout failed | Update status, log error |
| `payment_intent.succeeded` | Payment completed | Create transaction record |
| `payment_intent.payment_failed` | Payment failed | Log failed transaction |
| `charge.refunded` | Refund processed | Create refund transaction |
| `charge.dispute.created` | Dispute opened | Flag transaction as disputed |

## Dependencies

- F2: Organizations (org_id reference)
- External: Stripe API (stripe.com)

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_xxx          # Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_xxx     # Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_xxx        # Webhook signing secret
STRIPE_PLATFORM_FEE_PERCENT=2.5        # Platform fee percentage
```

## Migration Order

1. Create enums
2. Create stripe_accounts table
3. Create stripe_payouts table
4. Create stripe_transactions table
5. Create stripe_webhooks table
6. Create indexes
7. Create RLS policies
8. Create helper functions
9. Create triggers
