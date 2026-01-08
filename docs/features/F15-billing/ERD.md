# F15: Platform Billing - ERD

## Overview

Platform billing system implementing a "Free Core + Transaction Fee + Module Add-ons" model. Organizations get core features free with a transaction fee on ticket sales, and can unlock premium modules via subscription or one-time purchase.

## Pricing Model Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  FREE CORE (included for all organizations)                     │
│  • Ticketing, Check-in, Basic Analytics, Storefront             │
│  • 2.5% platform fee on ticket sales (+ Stripe fees)            │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PREMIUM MODULES (subscription or seasonal purchase)            │
│  • Scheduling, Inventory, Virtual Queue, Analytics Pro          │
│  • Custom Domains, SMS Notifications                            │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  VOLUME DISCOUNTS (based on annual ticket sales)                │
│  • $50K+ → 2.0%, $150K+ → 1.5%, $500K+ → 1.0%                  │
└─────────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        organizations                             │
│                          (from F2)                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ billing_tier    billing_tier ENUM (new column)                   │
│ ...                                                              │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      org_billing_settings                        │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK UNIQUE → organizations.id                │
│ platform_fee_percent DECIMAL(5,2)                                │
│ volume_tier     volume_tier ENUM                                 │
│ annual_sales_cents BIGINT                                        │
│ billing_email   VARCHAR(255)                                     │
│ stripe_customer_id VARCHAR(255)                                  │
│ tax_exempt      BOOLEAN                                          │
│ billing_address JSONB                                            │
│ created_at      TIMESTAMPTZ                                      │
│ updated_at      TIMESTAMPTZ                                      │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    org_module_subscriptions                      │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id                       │
│ module_key      VARCHAR(50)                                      │
│ status          subscription_status ENUM                         │
│ billing_cycle   billing_cycle ENUM                               │
│ price_cents     INTEGER                                          │
│ stripe_subscription_id VARCHAR(255)                              │
│ stripe_price_id VARCHAR(255)                                     │
│ current_period_start TIMESTAMPTZ                                 │
│ current_period_end TIMESTAMPTZ                                   │
│ cancel_at_period_end BOOLEAN                                     │
│ cancelled_at    TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ                                      │
│ updated_at      TIMESTAMPTZ                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        module_pricing                            │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ module_key      VARCHAR(50) UNIQUE                               │
│ name            VARCHAR(100)                                     │
│ description     TEXT                                             │
│ monthly_price_cents INTEGER                                      │
│ seasonal_price_cents INTEGER                                     │
│ annual_price_cents INTEGER                                       │
│ is_usage_based  BOOLEAN                                          │
│ usage_unit      VARCHAR(50)                                      │
│ usage_price_cents INTEGER                                        │
│ feature_flag_key VARCHAR(50)                                     │
│ sort_order      INTEGER                                          │
│ is_active       BOOLEAN                                          │
│ metadata        JSONB                                            │
│ created_at      TIMESTAMPTZ                                      │
│ updated_at      TIMESTAMPTZ                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    platform_transactions                         │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id                       │
│ type            platform_transaction_type ENUM                   │
│ amount_cents    INTEGER                                          │
│ description     TEXT                                             │
│ reference_type  VARCHAR(50)                                      │
│ reference_id    UUID                                             │
│ stripe_invoice_id VARCHAR(255)                                   │
│ stripe_payment_intent_id VARCHAR(255)                            │
│ metadata        JSONB                                            │
│ created_at      TIMESTAMPTZ                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      usage_records                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id                       │
│ module_key      VARCHAR(50)                                      │
│ usage_type      VARCHAR(50)                                      │
│ quantity        INTEGER                                          │
│ unit_price_cents INTEGER                                         │
│ total_cents     INTEGER                                          │
│ period_start    DATE                                             │
│ period_end      DATE                                             │
│ billed          BOOLEAN                                          │
│ stripe_usage_record_id VARCHAR(255)                              │
│ metadata        JSONB                                            │
│ created_at      TIMESTAMPTZ                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     volume_discount_tiers                        │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ tier_key        VARCHAR(50) UNIQUE                               │
│ name            VARCHAR(100)                                     │
│ min_annual_sales_cents BIGINT                                    │
│ max_annual_sales_cents BIGINT                                    │
│ platform_fee_percent DECIMAL(5,2)                                │
│ additional_benefits JSONB                                        │
│ sort_order      INTEGER                                          │
│ created_at      TIMESTAMPTZ                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

```sql
-- Billing tier for quick access (denormalized from volume tier)
CREATE TYPE billing_tier AS ENUM (
  'free',           -- Default, 2.5% platform fee
  'starter',        -- $50K+ annual, 2.0% platform fee
  'growth',         -- $150K+ annual, 1.5% platform fee
  'enterprise'      -- $500K+ annual, 1.0% + dedicated support
);

-- Volume tier for discount calculation
CREATE TYPE volume_tier AS ENUM (
  'standard',       -- $0 - $49,999
  'bronze',         -- $50,000 - $149,999
  'silver',         -- $150,000 - $499,999
  'gold'            -- $500,000+
);

-- Module subscription status
CREATE TYPE subscription_status AS ENUM (
  'active',         -- Currently active
  'past_due',       -- Payment failed, grace period
  'cancelled',      -- Cancelled, access until period end
  'expired',        -- Period ended, no access
  'trialing'        -- In trial period
);

-- Billing cycle options
CREATE TYPE billing_cycle AS ENUM (
  'monthly',        -- Monthly recurring
  'seasonal',       -- Per-season (typically 1-3 months)
  'annual',         -- Yearly recurring
  'lifetime'        -- One-time purchase
);

-- Platform transaction types
CREATE TYPE platform_transaction_type AS ENUM (
  'platform_fee',       -- Transaction fee on ticket sales
  'module_subscription',-- Module subscription payment
  'usage_charge',       -- Usage-based charge (SMS, etc.)
  'refund',             -- Refund of platform fee
  'credit',             -- Credit applied
  'adjustment'          -- Manual adjustment
);
```

## Tables

### org_billing_settings

Organization billing configuration and Stripe customer link.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Internal ID |
| org_id | UUID | FK → organizations.id, UNIQUE | Organization reference |
| platform_fee_percent | DECIMAL(5,2) | DEFAULT 2.5 | Current platform fee % |
| volume_tier | volume_tier | DEFAULT 'standard' | Volume discount tier |
| annual_sales_cents | BIGINT | DEFAULT 0 | Rolling 12-month sales |
| billing_email | VARCHAR(255) | | Billing contact email |
| stripe_customer_id | VARCHAR(255) | UNIQUE | Stripe Customer ID (cus_xxx) |
| tax_exempt | BOOLEAN | DEFAULT FALSE | Tax exempt status |
| billing_address | JSONB | DEFAULT '{}' | Billing address |
| next_tier_threshold | BIGINT | | Sales needed for next tier |
| tier_locked_until | TIMESTAMPTZ | | Prevent tier downgrade until |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record created |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last updated |

### org_module_subscriptions

Active module subscriptions per organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Subscription ID |
| org_id | UUID | FK → organizations.id | Organization reference |
| module_key | VARCHAR(50) | NOT NULL | Module identifier |
| status | subscription_status | DEFAULT 'active' | Subscription status |
| billing_cycle | billing_cycle | NOT NULL | Billing frequency |
| price_cents | INTEGER | NOT NULL | Price in cents |
| stripe_subscription_id | VARCHAR(255) | | Stripe Subscription ID |
| stripe_price_id | VARCHAR(255) | | Stripe Price ID |
| current_period_start | TIMESTAMPTZ | | Current billing period start |
| current_period_end | TIMESTAMPTZ | | Current billing period end |
| cancel_at_period_end | BOOLEAN | DEFAULT FALSE | Cancel at period end |
| cancelled_at | TIMESTAMPTZ | | When cancellation requested |
| trial_end | TIMESTAMPTZ | | Trial end date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Subscription created |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last updated |

**Unique constraint**: (org_id, module_key) - One subscription per module per org

### module_pricing

Pricing configuration for premium modules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Pricing ID |
| module_key | VARCHAR(50) | UNIQUE, NOT NULL | Module identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | | Module description |
| monthly_price_cents | INTEGER | | Monthly subscription price |
| seasonal_price_cents | INTEGER | | Per-season price |
| annual_price_cents | INTEGER | | Annual subscription price |
| is_usage_based | BOOLEAN | DEFAULT FALSE | Has usage component |
| usage_unit | VARCHAR(50) | | Usage unit (e.g., 'sms_message') |
| usage_price_cents | INTEGER | | Price per usage unit |
| feature_flag_key | VARCHAR(50) | | Linked feature flag |
| stripe_product_id | VARCHAR(255) | | Stripe Product ID |
| stripe_monthly_price_id | VARCHAR(255) | | Stripe Price ID (monthly) |
| stripe_annual_price_id | VARCHAR(255) | | Stripe Price ID (annual) |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT TRUE | Available for purchase |
| metadata | JSONB | DEFAULT '{}' | Additional data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record created |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last updated |

### platform_transactions

Record of all platform revenue transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Transaction ID |
| org_id | UUID | FK → organizations.id | Organization charged |
| type | platform_transaction_type | NOT NULL | Transaction type |
| amount_cents | INTEGER | NOT NULL | Amount in cents |
| description | TEXT | | Transaction description |
| reference_type | VARCHAR(50) | | Reference entity type |
| reference_id | UUID | | Reference entity ID |
| stripe_invoice_id | VARCHAR(255) | | Stripe Invoice ID |
| stripe_payment_intent_id | VARCHAR(255) | | Stripe PaymentIntent ID |
| metadata | JSONB | DEFAULT '{}' | Additional data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Transaction time |

### usage_records

Track usage-based billing (SMS, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Usage record ID |
| org_id | UUID | FK → organizations.id | Organization |
| module_key | VARCHAR(50) | NOT NULL | Module generating usage |
| usage_type | VARCHAR(50) | NOT NULL | Type of usage |
| quantity | INTEGER | NOT NULL | Number of units |
| unit_price_cents | INTEGER | NOT NULL | Price per unit |
| total_cents | INTEGER | NOT NULL | Total charge |
| period_start | DATE | NOT NULL | Usage period start |
| period_end | DATE | NOT NULL | Usage period end |
| billed | BOOLEAN | DEFAULT FALSE | Included in invoice |
| billed_at | TIMESTAMPTZ | | When billed |
| stripe_usage_record_id | VARCHAR(255) | | Stripe usage record |
| metadata | JSONB | DEFAULT '{}' | Additional data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record created |

### volume_discount_tiers

Configuration for volume-based discounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Tier ID |
| tier_key | VARCHAR(50) | UNIQUE, NOT NULL | Tier identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| min_annual_sales_cents | BIGINT | NOT NULL | Minimum sales threshold |
| max_annual_sales_cents | BIGINT | | Maximum sales (NULL = unlimited) |
| platform_fee_percent | DECIMAL(5,2) | NOT NULL | Fee at this tier |
| additional_benefits | JSONB | DEFAULT '{}' | Extra benefits |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record created |

## Indexes

```sql
-- org_billing_settings
CREATE UNIQUE INDEX org_billing_settings_org_id_idx ON org_billing_settings(org_id);
CREATE UNIQUE INDEX org_billing_settings_stripe_customer_idx ON org_billing_settings(stripe_customer_id);
CREATE INDEX org_billing_settings_volume_tier_idx ON org_billing_settings(volume_tier);

-- org_module_subscriptions
CREATE UNIQUE INDEX org_module_subscriptions_org_module_idx
  ON org_module_subscriptions(org_id, module_key);
CREATE INDEX org_module_subscriptions_status_idx ON org_module_subscriptions(status);
CREATE INDEX org_module_subscriptions_stripe_sub_idx
  ON org_module_subscriptions(stripe_subscription_id);
CREATE INDEX org_module_subscriptions_period_end_idx
  ON org_module_subscriptions(current_period_end);

-- module_pricing
CREATE UNIQUE INDEX module_pricing_key_idx ON module_pricing(module_key);
CREATE INDEX module_pricing_active_idx ON module_pricing(is_active);

-- platform_transactions
CREATE INDEX platform_transactions_org_idx ON platform_transactions(org_id);
CREATE INDEX platform_transactions_type_idx ON platform_transactions(type);
CREATE INDEX platform_transactions_created_idx ON platform_transactions(created_at DESC);
CREATE INDEX platform_transactions_reference_idx
  ON platform_transactions(reference_type, reference_id);

-- usage_records
CREATE INDEX usage_records_org_idx ON usage_records(org_id);
CREATE INDEX usage_records_module_idx ON usage_records(module_key);
CREATE INDEX usage_records_period_idx ON usage_records(period_start, period_end);
CREATE INDEX usage_records_unbilled_idx ON usage_records(org_id, billed) WHERE billed = FALSE;

-- volume_discount_tiers
CREATE INDEX volume_discount_tiers_sales_idx
  ON volume_discount_tiers(min_annual_sales_cents, max_annual_sales_cents);
```

## RLS Policies

```sql
-- org_billing_settings: Org owners/admins can view, super admins can manage
ALTER TABLE org_billing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners/admins can view billing settings"
  ON org_billing_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE user_id = auth.uid()
        AND org_id = org_billing_settings.org_id
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Super admins can manage all billing settings"
  ON org_billing_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- org_module_subscriptions: Org owners/admins can view
ALTER TABLE org_module_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners/admins can view subscriptions"
  ON org_module_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE user_id = auth.uid()
        AND org_id = org_module_subscriptions.org_id
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Super admins can manage all subscriptions"
  ON org_module_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- module_pricing: Anyone can read active pricing
ALTER TABLE module_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active module pricing"
  ON module_pricing FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Super admins can manage pricing"
  ON module_pricing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- platform_transactions: Org owners/admins can view their transactions
ALTER TABLE platform_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners/admins can view transactions"
  ON platform_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE user_id = auth.uid()
        AND org_id = platform_transactions.org_id
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Super admins can manage all transactions"
  ON platform_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- usage_records: Org owners/admins can view
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners/admins can view usage"
  ON usage_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE user_id = auth.uid()
        AND org_id = usage_records.org_id
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Super admins can manage all usage records"
  ON usage_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- volume_discount_tiers: Anyone can read
ALTER TABLE volume_discount_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view volume tiers"
  ON volume_discount_tiers FOR SELECT
  USING (TRUE);

CREATE POLICY "Super admins can manage volume tiers"
  ON volume_discount_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );
```

## Helper Functions

```sql
-- Get organization's effective platform fee percentage
CREATE OR REPLACE FUNCTION get_org_platform_fee(p_org_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_fee DECIMAL(5,2);
BEGIN
  SELECT platform_fee_percent INTO v_fee
  FROM org_billing_settings
  WHERE org_id = p_org_id;

  -- Default to 2.5% if not set
  RETURN COALESCE(v_fee, 2.5);
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate platform fee for an amount
CREATE OR REPLACE FUNCTION calculate_platform_fee(
  p_amount_cents INTEGER,
  p_org_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_fee_percent DECIMAL(5,2);
BEGIN
  v_fee_percent := get_org_platform_fee(p_org_id);
  RETURN ROUND(p_amount_cents * (v_fee_percent / 100.0))::INTEGER;
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if organization has access to a module
CREATE OR REPLACE FUNCTION org_has_module(
  p_org_id UUID,
  p_module_key VARCHAR(50)
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_module_subscriptions
    WHERE org_id = p_org_id
      AND module_key = p_module_key
      AND status IN ('active', 'trialing')
      AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Get organization's volume tier based on annual sales
CREATE OR REPLACE FUNCTION get_volume_tier(p_annual_sales_cents BIGINT)
RETURNS volume_tier AS $$
BEGIN
  IF p_annual_sales_cents >= 50000000 THEN  -- $500K+
    RETURN 'gold';
  ELSIF p_annual_sales_cents >= 15000000 THEN  -- $150K+
    RETURN 'silver';
  ELSIF p_annual_sales_cents >= 5000000 THEN  -- $50K+
    RETURN 'bronze';
  ELSE
    RETURN 'standard';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get platform fee for a volume tier
CREATE OR REPLACE FUNCTION get_tier_platform_fee(p_tier volume_tier)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  CASE p_tier
    WHEN 'gold' THEN RETURN 1.0;
    WHEN 'silver' THEN RETURN 1.5;
    WHEN 'bronze' THEN RETURN 2.0;
    ELSE RETURN 2.5;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update organization's volume tier (call periodically)
CREATE OR REPLACE FUNCTION update_org_volume_tier(p_org_id UUID)
RETURNS void AS $$
DECLARE
  v_annual_sales BIGINT;
  v_new_tier volume_tier;
  v_new_fee DECIMAL(5,2);
BEGIN
  -- Calculate 12-month rolling sales from orders
  SELECT COALESCE(SUM(total_cents), 0) INTO v_annual_sales
  FROM orders
  WHERE org_id = p_org_id
    AND status = 'completed'
    AND created_at >= NOW() - INTERVAL '12 months';

  -- Determine tier
  v_new_tier := get_volume_tier(v_annual_sales);
  v_new_fee := get_tier_platform_fee(v_new_tier);

  -- Update billing settings
  INSERT INTO org_billing_settings (org_id, volume_tier, annual_sales_cents, platform_fee_percent)
  VALUES (p_org_id, v_new_tier, v_annual_sales, v_new_fee)
  ON CONFLICT (org_id) DO UPDATE SET
    volume_tier = v_new_tier,
    annual_sales_cents = v_annual_sales,
    platform_fee_percent = LEAST(org_billing_settings.platform_fee_percent, v_new_fee),  -- Never increase
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Get organization billing summary
CREATE OR REPLACE FUNCTION get_org_billing_summary(p_org_id UUID)
RETURNS TABLE (
  billing_tier billing_tier,
  volume_tier volume_tier,
  platform_fee_percent DECIMAL(5,2),
  annual_sales_cents BIGINT,
  next_tier_at BIGINT,
  active_modules TEXT[],
  monthly_module_cost INTEGER,
  mtd_platform_fees INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.billing_tier,
    COALESCE(bs.volume_tier, 'standard'::volume_tier),
    COALESCE(bs.platform_fee_percent, 2.5),
    COALESCE(bs.annual_sales_cents, 0),
    CASE
      WHEN COALESCE(bs.volume_tier, 'standard') = 'standard' THEN 5000000::BIGINT  -- $50K
      WHEN bs.volume_tier = 'bronze' THEN 15000000::BIGINT  -- $150K
      WHEN bs.volume_tier = 'silver' THEN 50000000::BIGINT  -- $500K
      ELSE NULL
    END,
    ARRAY(
      SELECT ms.module_key
      FROM org_module_subscriptions ms
      WHERE ms.org_id = p_org_id AND ms.status = 'active'
    ),
    (
      SELECT COALESCE(SUM(ms.price_cents), 0)::INTEGER
      FROM org_module_subscriptions ms
      WHERE ms.org_id = p_org_id
        AND ms.status = 'active'
        AND ms.billing_cycle = 'monthly'
    ),
    (
      SELECT COALESCE(SUM(pt.amount_cents), 0)::INTEGER
      FROM platform_transactions pt
      WHERE pt.org_id = p_org_id
        AND pt.type = 'platform_fee'
        AND pt.created_at >= date_trunc('month', NOW())
    )
  FROM organizations o
  LEFT JOIN org_billing_settings bs ON bs.org_id = o.id
  WHERE o.id = p_org_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

## Triggers

```sql
-- Update timestamps
CREATE TRIGGER update_org_billing_settings_updated_at
  BEFORE UPDATE ON org_billing_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_module_subscriptions_updated_at
  BEFORE UPDATE ON org_module_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_pricing_updated_at
  BEFORE UPDATE ON module_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate usage total
CREATE OR REPLACE FUNCTION calculate_usage_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_cents := NEW.quantity * NEW.unit_price_cents;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_usage_total_trigger
  BEFORE INSERT OR UPDATE ON usage_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_usage_total();

-- Sync module subscription with feature flag
CREATE OR REPLACE FUNCTION sync_module_feature_flag()
RETURNS TRIGGER AS $$
DECLARE
  v_flag_key VARCHAR(50);
BEGIN
  -- Get the feature flag key for this module
  SELECT feature_flag_key INTO v_flag_key
  FROM module_pricing
  WHERE module_key = NEW.module_key;

  IF v_flag_key IS NOT NULL THEN
    IF NEW.status IN ('active', 'trialing') THEN
      -- Add org to feature flag
      UPDATE feature_flags
      SET org_ids = array_append(
        array_remove(org_ids, NEW.org_id),  -- Remove first to avoid duplicates
        NEW.org_id
      )
      WHERE key = v_flag_key;
    ELSE
      -- Remove org from feature flag
      UPDATE feature_flags
      SET org_ids = array_remove(org_ids, NEW.org_id)
      WHERE key = v_flag_key;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_module_feature_flag_trigger
  AFTER INSERT OR UPDATE OF status ON org_module_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_module_feature_flag();
```

## Seed Data

```sql
-- Volume discount tiers
INSERT INTO volume_discount_tiers (id, tier_key, name, min_annual_sales_cents, max_annual_sales_cents, platform_fee_percent, additional_benefits, sort_order)
VALUES
  ('vt000000-0000-0000-0000-000000000001', 'standard', 'Standard', 0, 4999999, 2.5, '{}', 1),
  ('vt000000-0000-0000-0000-000000000002', 'bronze', 'Starter', 5000000, 14999999, 2.0, '{"priority_support": true}', 2),
  ('vt000000-0000-0000-0000-000000000003', 'silver', 'Growth', 15000000, 49999999, 1.5, '{"priority_support": true, "dedicated_slack": true}', 3),
  ('vt000000-0000-0000-0000-000000000004', 'gold', 'Enterprise', 50000000, NULL, 1.0, '{"priority_support": true, "dedicated_slack": true, "account_manager": true, "custom_integrations": true}', 4)
ON CONFLICT (tier_key) DO NOTHING;

-- Module pricing
INSERT INTO module_pricing (id, module_key, name, description, monthly_price_cents, seasonal_price_cents, annual_price_cents, is_usage_based, usage_unit, usage_price_cents, feature_flag_key, sort_order)
VALUES
  ('mp000000-0000-0000-0000-000000000001', 'scheduling', 'Staff Scheduling', 'Staff scheduling with availability, shift templates, and swap requests', 2900, 9900, 29000, FALSE, NULL, NULL, 'scheduling', 1),
  ('mp000000-0000-0000-0000-000000000002', 'inventory', 'Inventory Management', 'Inventory tracking with categories, checkouts, and low stock alerts', 1900, 6900, 19000, FALSE, NULL, NULL, 'inventory', 2),
  ('mp000000-0000-0000-0000-000000000003', 'virtual_queue', 'Virtual Queue', 'Real-time virtual queue with position tracking and notifications', 4900, 14900, 49000, FALSE, NULL, NULL, 'virtual_queue', 3),
  ('mp000000-0000-0000-0000-000000000004', 'analytics_pro', 'Analytics Pro', 'Advanced analytics with custom reports, exports, and forecasting', 2900, 9900, 29000, FALSE, NULL, NULL, 'analytics_pro', 4),
  ('mp000000-0000-0000-0000-000000000005', 'custom_domains', 'Custom Domains', 'Custom domain support for public storefronts with SSL', 900, NULL, 9900, FALSE, NULL, NULL, 'custom_domains', 5),
  ('mp000000-0000-0000-0000-000000000006', 'sms_notifications', 'SMS Notifications', 'SMS delivery for queue alerts, shift reminders, and guest communications', 0, NULL, NULL, TRUE, 'sms_message', 2, 'sms_notifications', 6)
ON CONFLICT (module_key) DO NOTHING;
```

## Dependencies

- F2: Organizations (org_id reference)
- F5: Feature Flags (sync module access)
- F6: Stripe Connect (payment processing)
- F8: Ticketing/Orders (sales volume calculation)

## Environment Variables

```bash
# Stripe Billing (separate from Connect)
STRIPE_BILLING_SECRET_KEY=sk_xxx          # Platform's Stripe key for billing
STRIPE_BILLING_WEBHOOK_SECRET=whsec_xxx   # Billing webhook secret

# Default pricing
DEFAULT_PLATFORM_FEE_PERCENT=2.5
```

## Migration Order

1. Add `billing_tier` column to organizations
2. Create enums
3. Create volume_discount_tiers table
4. Create module_pricing table
5. Create org_billing_settings table
6. Create org_module_subscriptions table
7. Create platform_transactions table
8. Create usage_records table
9. Create indexes
10. Create RLS policies
11. Create helper functions
12. Create triggers
13. Insert seed data
