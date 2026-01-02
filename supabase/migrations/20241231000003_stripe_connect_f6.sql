-- ============================================================================
-- STRIPE CONNECT MIGRATION: F6
-- Stripe Connect integration for marketplace payments
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

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

-- ============================================================================
-- STRIPE ACCOUNTS
-- Connected Stripe Express accounts for organizations
-- ============================================================================

CREATE TABLE stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_account_id VARCHAR(255) NOT NULL,
  status account_status DEFAULT 'pending',
  type VARCHAR(50) DEFAULT 'express',
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,
  onboarding_url TEXT,
  dashboard_url TEXT,
  country VARCHAR(2) DEFAULT 'US',
  default_currency VARCHAR(3) DEFAULT 'usd',
  business_type VARCHAR(50),
  business_name VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT stripe_accounts_org_id_unique UNIQUE (org_id),
  CONSTRAINT stripe_accounts_stripe_id_unique UNIQUE (stripe_account_id)
);

-- Indexes
CREATE INDEX stripe_accounts_status_idx ON stripe_accounts(status);

-- Trigger
CREATE TRIGGER update_stripe_accounts_updated_at
  BEFORE UPDATE ON stripe_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STRIPE PAYOUTS
-- Payout records for connected accounts
-- ============================================================================

CREATE TABLE stripe_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_account_id UUID NOT NULL REFERENCES stripe_accounts(id) ON DELETE CASCADE,
  stripe_payout_id VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status payout_status DEFAULT 'pending',
  arrival_date DATE,
  method VARCHAR(50),
  destination_type VARCHAR(50),
  destination_last4 VARCHAR(4),
  failure_code VARCHAR(100),
  failure_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT stripe_payouts_payout_id_unique UNIQUE (stripe_payout_id)
);

-- Indexes
CREATE INDEX stripe_payouts_account_idx ON stripe_payouts(stripe_account_id);
CREATE INDEX stripe_payouts_status_idx ON stripe_payouts(status);
CREATE INDEX stripe_payouts_created_idx ON stripe_payouts(created_at DESC);

-- Trigger
CREATE TRIGGER update_stripe_payouts_updated_at
  BEFORE UPDATE ON stripe_payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STRIPE TRANSACTIONS
-- All financial transactions through the platform
-- ============================================================================

CREATE TABLE stripe_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_account_id UUID NOT NULL REFERENCES stripe_accounts(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  stripe_refund_id VARCHAR(255),
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  platform_fee INTEGER DEFAULT 0,
  stripe_fee INTEGER DEFAULT 0,
  net_amount INTEGER NOT NULL,
  description TEXT,
  customer_email VARCHAR(255),
  order_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate transactions from webhook race conditions
  CONSTRAINT stripe_transactions_stripe_charge_id_unique UNIQUE (stripe_charge_id)
);

-- Indexes
CREATE INDEX stripe_transactions_account_idx ON stripe_transactions(stripe_account_id);
CREATE INDEX stripe_transactions_status_idx ON stripe_transactions(status);
CREATE INDEX stripe_transactions_type_idx ON stripe_transactions(type);
CREATE INDEX stripe_transactions_created_idx ON stripe_transactions(created_at DESC);
CREATE INDEX stripe_transactions_payment_intent_idx ON stripe_transactions(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_stripe_transactions_updated_at
  BEFORE UPDATE ON stripe_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to calculate net_amount automatically
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

-- ============================================================================
-- STRIPE WEBHOOKS
-- Webhook event log for idempotency and debugging
-- ============================================================================

CREATE TABLE stripe_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  api_version VARCHAR(50),
  processed BOOLEAN DEFAULT FALSE,
  payload JSONB NOT NULL,
  error TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,

  CONSTRAINT stripe_webhooks_event_id_unique UNIQUE (stripe_event_id)
);

-- Indexes
CREATE INDEX stripe_webhooks_type_idx ON stripe_webhooks(type);
CREATE INDEX stripe_webhooks_processed_idx ON stripe_webhooks(processed);
CREATE INDEX stripe_webhooks_created_idx ON stripe_webhooks(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- stripe_accounts: Org members can view, owners/admins can manage
CREATE POLICY "Org members can view stripe account"
  ON stripe_accounts FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Org owners/admins can manage stripe account"
  ON stripe_accounts FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
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

-- stripe_payouts: Org finance roles can view
CREATE POLICY "Org finance roles can view payouts"
  ON stripe_payouts FOR SELECT
  USING (
    stripe_account_id IN (
      SELECT sa.id FROM stripe_accounts sa
      JOIN org_memberships om ON om.org_id = sa.org_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'finance')
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

-- stripe_transactions: Org finance roles can view
CREATE POLICY "Org finance roles can view transactions"
  ON stripe_transactions FOR SELECT
  USING (
    stripe_account_id IN (
      SELECT sa.id FROM stripe_accounts sa
      JOIN org_memberships om ON om.org_id = sa.org_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'finance')
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

-- stripe_webhooks: Super admins only (processed by service role)
CREATE POLICY "Super admins can view webhooks"
  ON stripe_webhooks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

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
    (sa.id IS NULL OR sa.status IN ('pending', 'onboarding')) AS needs_onboarding
  FROM organizations o
  LEFT JOIN stripe_accounts sa ON sa.org_id = o.id
  WHERE o.id = p_org_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Calculate platform fees for a transaction
CREATE OR REPLACE FUNCTION calculate_platform_fee(
  p_amount INTEGER,
  p_fee_percent NUMERIC DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_fee_percent NUMERIC;
BEGIN
  -- Get fee from platform settings if not provided
  IF p_fee_percent IS NULL THEN
    SELECT (value::NUMERIC) INTO v_fee_percent
    FROM platform_settings
    WHERE key = 'stripe_platform_fee_percent';
    
    IF v_fee_percent IS NULL THEN
      v_fee_percent := 2.9; -- Default 2.9%
    END IF;
  ELSE
    v_fee_percent := p_fee_percent;
  END IF;

  -- Fee is percentage of amount, rounded to nearest cent
  RETURN ROUND(p_amount * (v_fee_percent / 100.0))::INTEGER;
END;
$$ LANGUAGE plpgsql STABLE;

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
    COALESCE(SUM(CASE WHEN st.type = 'charge' AND st.status = 'succeeded' THEN st.amount ELSE 0 END), 0)::INTEGER AS total_charges,
    COALESCE(SUM(CASE WHEN st.type = 'refund' THEN st.amount ELSE 0 END), 0)::INTEGER AS total_refunds,
    COALESCE(SUM(st.platform_fee + st.stripe_fee), 0)::INTEGER AS total_fees,
    COALESCE(SUM(CASE WHEN st.status = 'succeeded' THEN st.net_amount ELSE 0 END), 0)::INTEGER AS net_revenue,
    COUNT(*)::BIGINT AS transaction_count
  FROM stripe_transactions st
  WHERE st.stripe_account_id = p_stripe_account_id
    AND (p_start_date IS NULL OR st.created_at >= p_start_date)
    AND (p_end_date IS NULL OR st.created_at <= p_end_date);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- COMPLETE
-- ============================================================================
