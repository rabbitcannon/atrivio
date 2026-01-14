-- Add Stripe Price ID to subscription tier configuration
-- Allows super admins to configure Stripe subscription prices via admin UI
-- instead of requiring environment variables

-- Add the column
ALTER TABLE subscription_tier_config
ADD COLUMN stripe_price_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN subscription_tier_config.stripe_price_id IS 'Stripe Price ID for subscription checkout (e.g., price_xxxxx). Required for paid tiers.';

-- Seed default Stripe price IDs for demo data
-- These match the prices created in the demo Stripe account
UPDATE subscription_tier_config
SET stripe_price_id = 'price_1SpYYSKC0cR77yPIttWQnyg5'
WHERE tier = 'pro';

UPDATE subscription_tier_config
SET stripe_price_id = 'price_1SpYYoKC0cR77yPIrcKU4h6p'
WHERE tier = 'enterprise';

-- Update the get_tier_config function to include stripe_price_id
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
    'metadata', v_config.metadata,
    'stripe_price_id', v_config.stripe_price_id
  );
END;
$$ LANGUAGE plpgsql STABLE;
