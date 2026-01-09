-- Subscription Tier Configuration Table
-- Moves hardcoded tier limits to database for admin management

-- Create table to store tier configuration
CREATE TABLE subscription_tier_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  transaction_fee_percentage NUMERIC(4,2) NOT NULL DEFAULT 3.90,
  transaction_fee_fixed_cents INTEGER NOT NULL DEFAULT 30,
  custom_domains_limit INTEGER NOT NULL DEFAULT 0, -- -1 for unlimited
  attractions_limit INTEGER NOT NULL DEFAULT 1, -- -1 for unlimited
  staff_members_limit INTEGER NOT NULL DEFAULT 10, -- -1 for unlimited
  features TEXT[] NOT NULL DEFAULT ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications'],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_subscription_tier_config_updated_at
  BEFORE UPDATE ON subscription_tier_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on tier for lookups
CREATE INDEX idx_subscription_tier_config_tier ON subscription_tier_config(tier);

-- Enable RLS
ALTER TABLE subscription_tier_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read tier config (needed for pricing pages, etc.)
CREATE POLICY "Anyone can read tier config"
  ON subscription_tier_config FOR SELECT
  USING (TRUE);

-- Only super admins can modify tier config (handled by service-role key)
-- No INSERT/UPDATE/DELETE policies = only admin client can modify

-- Seed with current tier configuration
INSERT INTO subscription_tier_config (
  tier, name, description, monthly_price_cents,
  transaction_fee_percentage, transaction_fee_fixed_cents,
  custom_domains_limit, attractions_limit, staff_members_limit,
  features, display_order
) VALUES
(
  'free',
  'Free',
  'Get started with essential features for free.',
  0,
  3.90,
  30,
  0, -- no custom domains
  1, -- 1 attraction
  10, -- 10 staff
  ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications'],
  1
),
(
  'pro',
  'Pro',
  'For growing operations that need advanced features.',
  14900, -- $149
  2.90,
  30,
  5, -- 5 custom domains
  5, -- 5 attractions
  50, -- 50 staff
  ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications', 'scheduling', 'inventory', 'analytics_pro', 'storefronts'],
  2
),
(
  'enterprise',
  'Enterprise',
  'For multi-location operators with complex needs.',
  49900, -- $499
  2.50,
  30,
  10, -- 10 custom domains
  -1, -- unlimited attractions
  -1, -- unlimited staff
  ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications', 'scheduling', 'inventory', 'analytics_pro', 'storefronts', 'virtual_queue', 'sms_notifications', 'custom_domains'],
  3
);

-- Update get_tier_limits function to read from database
CREATE OR REPLACE FUNCTION get_tier_limits(tier subscription_tier)
RETURNS JSONB AS $$
DECLARE
  v_config RECORD;
BEGIN
  SELECT * INTO v_config
  FROM subscription_tier_config stc
  WHERE stc.tier = get_tier_limits.tier;

  IF NOT FOUND THEN
    -- Fallback for unknown tier
    RETURN jsonb_build_object(
      'custom_domains', 0,
      'attractions', 1,
      'staff_members', 10,
      'monthly_orders', -1,
      'features', ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications']
    );
  END IF;

  RETURN jsonb_build_object(
    'custom_domains', v_config.custom_domains_limit,
    'attractions', v_config.attractions_limit,
    'staff_members', v_config.staff_members_limit,
    'monthly_orders', -1, -- Always unlimited (revenue from transactions)
    'features', v_config.features
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get full tier config (for admin panel)
CREATE OR REPLACE FUNCTION get_tier_config(p_tier subscription_tier)
RETURNS JSONB AS $$
DECLARE
  v_config RECORD;
BEGIN
  SELECT * INTO v_config
  FROM subscription_tier_config
  WHERE tier = p_tier;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'tier', v_config.tier,
    'name', v_config.name,
    'description', v_config.description,
    'monthly_price_cents', v_config.monthly_price_cents,
    'transaction_fee_percentage', v_config.transaction_fee_percentage,
    'transaction_fee_fixed_cents', v_config.transaction_fee_fixed_cents,
    'custom_domains_limit', v_config.custom_domains_limit,
    'attractions_limit', v_config.attractions_limit,
    'staff_members_limit', v_config.staff_members_limit,
    'features', v_config.features,
    'is_active', v_config.is_active,
    'display_order', v_config.display_order,
    'metadata', v_config.metadata
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments for documentation
COMMENT ON TABLE subscription_tier_config IS 'Configuration for subscription tiers (editable via admin panel)';
COMMENT ON COLUMN subscription_tier_config.monthly_price_cents IS 'Monthly subscription price in cents (0 for free tier)';
COMMENT ON COLUMN subscription_tier_config.transaction_fee_percentage IS 'Transaction fee percentage (e.g., 3.90 = 3.9%)';
COMMENT ON COLUMN subscription_tier_config.transaction_fee_fixed_cents IS 'Fixed transaction fee in cents (e.g., 30 = $0.30)';
COMMENT ON COLUMN subscription_tier_config.custom_domains_limit IS 'Max custom domains (-1 = unlimited)';
COMMENT ON COLUMN subscription_tier_config.attractions_limit IS 'Max attractions (-1 = unlimited)';
COMMENT ON COLUMN subscription_tier_config.staff_members_limit IS 'Max staff members (-1 = unlimited)';
COMMENT ON COLUMN subscription_tier_config.features IS 'Array of feature flags enabled for this tier';
