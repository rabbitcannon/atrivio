-- ============================================================================
-- Add media_uploads feature flag and update tier limits
-- ============================================================================

-- Add the feature flag entry
-- Note: rollout_percentage is dropped in a subsequent migration (tier-based access only)
INSERT INTO feature_flags (key, name, description, enabled, metadata)
VALUES (
  'media_uploads',
  'Media Uploads',
  'Organization media storage with R2 integration',
  true,
  '{"tier": "pro", "module": true, "storage_based": true}'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  enabled = true,
  metadata = '{"tier": "pro", "module": true, "storage_based": true}'::jsonb;

-- Update get_tier_limits to include media_uploads for pro and enterprise
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
        'storage_limit_bytes', 0,
        'features', ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications']
      );
    WHEN 'pro' THEN
      RETURN jsonb_build_object(
        'custom_domains', 5,
        'attractions', 5,
        'staff_members', 50,
        'monthly_orders', 1000,
        'storage_limit_bytes', 524288000, -- 500MB
        'features', ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications', 'scheduling', 'inventory', 'analytics_pro', 'storefronts', 'media_uploads']
      );
    WHEN 'enterprise' THEN
      RETURN jsonb_build_object(
        'custom_domains', 10,
        'attractions', -1, -- unlimited
        'staff_members', -1, -- unlimited
        'monthly_orders', -1, -- unlimited
        'storage_limit_bytes', 5368709120, -- 5GB
        'features', ARRAY['ticketing', 'checkin', 'time_tracking', 'notifications', 'scheduling', 'inventory', 'analytics_pro', 'storefronts', 'media_uploads', 'virtual_queue', 'sms_notifications', 'custom_domains']
      );
    ELSE
      RETURN jsonb_build_object('custom_domains', 0, 'storage_limit_bytes', 0, 'features', ARRAY[]::TEXT[]);
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update is_feature_enabled to check tier FIRST, then fallback to other checks
-- This makes tier-based access the primary control mechanism
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

  -- First, check if feature is disabled globally
  IF NOT flag.enabled THEN
    RETURN FALSE;
  END IF;

  -- Check org's subscription tier FIRST (primary access control)
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

      -- If feature is in tier's feature list, allow access
      IF p_flag_key = ANY(v_tier_features) THEN
        RETURN TRUE;
      END IF;
    END IF;
  END IF;

  -- Check specific user allowlist (for beta testers, etc.)
  IF p_user_id IS NOT NULL AND p_user_id = ANY(flag.user_ids) THEN
    RETURN TRUE;
  END IF;

  -- Check specific org allowlist (for custom deals, etc.)
  IF p_org_id IS NOT NULL AND p_org_id = ANY(flag.org_ids) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_feature_enabled IS 'Check if feature is enabled - tier-based access is the primary control';
