-- Update is_feature_enabled to also check org subscription tier
-- This integrates the tier-based feature access from the subscription system

CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_flag_key VARCHAR,
  p_user_id UUID DEFAULT NULL,
  p_org_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  flag RECORD;
  v_tier subscription_tier;
  v_status subscription_status;
  v_tier_features TEXT[];
BEGIN
  SELECT * INTO flag FROM feature_flags WHERE key = p_flag_key;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if globally enabled (for all orgs)
  IF flag.enabled AND flag.rollout_percentage >= 100 THEN
    RETURN TRUE;
  END IF;

  -- Check specific user allowlist
  IF p_user_id IS NOT NULL AND p_user_id = ANY(flag.user_ids) THEN
    RETURN TRUE;
  END IF;

  -- Check specific org allowlist
  IF p_org_id IS NOT NULL AND p_org_id = ANY(flag.org_ids) THEN
    RETURN TRUE;
  END IF;

  -- Check org's subscription tier includes this feature
  IF p_org_id IS NOT NULL THEN
    SELECT subscription_tier, subscription_status
    INTO v_tier, v_status
    FROM organizations
    WHERE id = p_org_id;

    IF FOUND AND v_status IN ('active', 'trialing', 'canceled', 'past_due') THEN
      -- Get features available for this tier
      v_tier_features := ARRAY(
        SELECT jsonb_array_elements_text(get_tier_limits(v_tier)->'features')
      );

      IF p_flag_key = ANY(v_tier_features) THEN
        RETURN TRUE;
      END IF;
    END IF;
  END IF;

  -- Check percentage rollout (deterministic based on user_id)
  IF flag.rollout_percentage > 0 AND p_user_id IS NOT NULL THEN
    IF (abs(hashtext(p_user_id::text || p_flag_key)) % 100) < flag.rollout_percentage THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION is_feature_enabled IS 'Check if feature is enabled via flags OR org subscription tier';
