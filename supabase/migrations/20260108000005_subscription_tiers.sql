-- Subscription Tiers for Organizations
-- Integrates with Stripe Subscriptions to enable tier-based feature access

-- Create subscription tier enum
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');

-- Create subscription status enum
CREATE TYPE subscription_status AS ENUM (
  'active',           -- Subscription is active and paid
  'trialing',         -- In trial period
  'past_due',         -- Payment failed, grace period
  'canceled',         -- Canceled but still active until period end
  'unpaid',           -- Payment failed, access restricted
  'incomplete',       -- Initial payment pending
  'incomplete_expired' -- Initial payment failed
);

-- Add subscription fields to organizations
ALTER TABLE organizations
ADD COLUMN subscription_tier subscription_tier NOT NULL DEFAULT 'free',
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN stripe_subscription_id TEXT UNIQUE,
ADD COLUMN subscription_status subscription_status DEFAULT 'active',
ADD COLUMN subscription_current_period_end TIMESTAMPTZ,
ADD COLUMN subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Create index for Stripe lookups
CREATE INDEX idx_organizations_stripe_customer ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_organizations_stripe_subscription ON organizations(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_organizations_subscription_tier ON organizations(subscription_tier);

-- Create subscription history table for audit trail
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  previous_tier subscription_tier,
  new_tier subscription_tier NOT NULL,
  stripe_subscription_id TEXT,
  stripe_invoice_id TEXT,
  event_type TEXT NOT NULL, -- 'created', 'upgraded', 'downgraded', 'canceled', 'renewed'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_history_org ON subscription_history(org_id);
CREATE INDEX idx_subscription_history_created ON subscription_history(created_at DESC);

-- Enable RLS on subscription_history
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Only org owners/admins can view their subscription history
CREATE POLICY "Org members can view subscription history"
  ON subscription_history FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Function to get tier limits
CREATE OR REPLACE FUNCTION get_tier_limits(tier subscription_tier)
RETURNS JSONB AS $$
BEGIN
  CASE tier
    WHEN 'free' THEN
      RETURN jsonb_build_object(
        'custom_domains', 0,
        'attractions', 1,
        'staff_members', 10,
        'monthly_orders', 100,
        'features', ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications']
      );
    WHEN 'pro' THEN
      RETURN jsonb_build_object(
        'custom_domains', 5,
        'attractions', 5,
        'staff_members', 50,
        'monthly_orders', 1000,
        'features', ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications', 'scheduling', 'inventory', 'analytics_pro', 'storefronts']
      );
    WHEN 'enterprise' THEN
      RETURN jsonb_build_object(
        'custom_domains', 10,
        'attractions', -1, -- unlimited
        'staff_members', -1, -- unlimited
        'monthly_orders', -1, -- unlimited
        'features', ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications', 'scheduling', 'inventory', 'analytics_pro', 'storefronts', 'virtual_queue', 'sms_notifications', 'custom_domains']
      );
    ELSE
      RETURN jsonb_build_object('custom_domains', 0, 'features', ARRAY[]::TEXT[]);
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if org has access to a feature based on tier
CREATE OR REPLACE FUNCTION org_has_feature(p_org_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier subscription_tier;
  v_status subscription_status;
  v_limits JSONB;
  v_features TEXT[];
BEGIN
  -- Get org tier and status
  SELECT subscription_tier, subscription_status
  INTO v_tier, v_status
  FROM organizations
  WHERE id = p_org_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check subscription is active (active, trialing, or canceled but not yet expired)
  IF v_status NOT IN ('active', 'trialing', 'canceled') THEN
    RETURN FALSE;
  END IF;

  -- Get tier limits
  v_limits := get_tier_limits(v_tier);
  v_features := ARRAY(SELECT jsonb_array_elements_text(v_limits->'features'));

  RETURN p_feature = ANY(v_features);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update custom_domain_limit based on tier (make it a computed default)
-- Keep the column for per-org overrides, but default to tier limit
CREATE OR REPLACE FUNCTION get_org_domain_limit(p_org_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_custom_limit INTEGER;
  v_tier subscription_tier;
  v_tier_limit INTEGER;
BEGIN
  SELECT custom_domain_limit, subscription_tier
  INTO v_custom_limit, v_tier
  FROM organizations
  WHERE id = p_org_id;

  -- If custom limit is set and non-zero, use it (allows overrides)
  IF v_custom_limit IS NOT NULL AND v_custom_limit > 0 THEN
    RETURN v_custom_limit;
  END IF;

  -- Otherwise derive from tier
  v_tier_limit := (get_tier_limits(v_tier)->>'custom_domains')::INTEGER;
  RETURN COALESCE(v_tier_limit, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Update the domain limit check trigger to use tier-based limits
CREATE OR REPLACE FUNCTION check_custom_domain_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_current_count INTEGER;
  v_limit INTEGER;
  v_tier subscription_tier;
BEGIN
  -- Only check for custom domains (not subdomains)
  IF NEW.domain_type != 'custom' THEN
    RETURN NEW;
  END IF;

  -- Get org tier and limit
  SELECT subscription_tier INTO v_tier
  FROM organizations
  WHERE id = NEW.org_id;

  -- Get effective limit (tier-based or custom override)
  v_limit := get_org_domain_limit(NEW.org_id);

  -- Count existing custom domains for this org
  SELECT COUNT(*) INTO v_current_count
  FROM storefront_domains
  WHERE org_id = NEW.org_id
    AND domain_type = 'custom'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Check limit
  IF v_limit = 0 THEN
    RAISE EXCEPTION 'Custom domains are not available on the free plan. Upgrade to Pro to add custom domains.'
      USING ERRCODE = 'P0001';
  END IF;

  IF v_current_count >= v_limit THEN
    RAISE EXCEPTION 'Custom domain limit reached. Your % plan allows up to % custom domains. Upgrade to add more.', v_tier, v_limit
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON COLUMN organizations.subscription_tier IS 'Current subscription tier: free, pro, or enterprise';
COMMENT ON COLUMN organizations.stripe_customer_id IS 'Stripe Customer ID for billing';
COMMENT ON COLUMN organizations.stripe_subscription_id IS 'Active Stripe Subscription ID';
COMMENT ON COLUMN organizations.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN organizations.custom_domain_limit IS 'Override for tier-based domain limit (0 = use tier default)';
