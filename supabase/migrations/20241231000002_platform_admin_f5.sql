-- ============================================================================
-- PLATFORM ADMIN MIGRATION: F5
-- Super admin dashboard, audit logs, feature flags, announcements
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE actor_type AS ENUM (
  'user',
  'system',
  'api_key',
  'webhook'
);

CREATE TYPE announcement_type AS ENUM (
  'info',
  'warning',
  'critical',
  'maintenance',
  'feature'
);

CREATE TYPE health_status AS ENUM (
  'healthy',
  'degraded',
  'unhealthy',
  'unknown'
);

CREATE TYPE rate_limit_scope AS ENUM (
  'all',
  'authenticated',
  'anonymous',
  'specific_orgs'
);

-- ============================================================================
-- PLATFORM SETTINGS
-- ============================================================================

CREATE TABLE platform_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================

CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  org_ids UUID[] DEFAULT '{}',
  user_ids UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX feature_flags_key_idx ON feature_flags(key);

-- Trigger
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  actor_type actor_type NOT NULL DEFAULT 'user',
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX audit_logs_actor_idx ON audit_logs(actor_id, created_at DESC);
CREATE INDEX audit_logs_resource_idx ON audit_logs(resource_type, resource_id, created_at DESC);
CREATE INDEX audit_logs_org_idx ON audit_logs(org_id, created_at DESC);
CREATE INDEX audit_logs_action_idx ON audit_logs(action, created_at DESC);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- ============================================================================
-- PLATFORM ANNOUNCEMENTS
-- ============================================================================

CREATE TABLE platform_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type announcement_type DEFAULT 'info',
  target_roles org_role[] DEFAULT '{}',
  target_org_ids UUID[] DEFAULT '{}',
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_dismissible BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (note: partial index with NOW() removed as it's not IMMUTABLE)
CREATE INDEX announcements_active_idx ON platform_announcements(starts_at, expires_at);
CREATE INDEX announcements_expires_idx ON platform_announcements(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX announcements_type_idx ON platform_announcements(type);

-- Trigger
CREATE TRIGGER update_platform_announcements_updated_at
  BEFORE UPDATE ON platform_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ANNOUNCEMENT DISMISSALS
-- ============================================================================

CREATE TABLE announcement_dismissals (
  announcement_id UUID NOT NULL REFERENCES platform_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (announcement_id, user_id)
);

-- ============================================================================
-- SYSTEM HEALTH LOGS
-- ============================================================================

CREATE TABLE system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(100) NOT NULL,
  status health_status NOT NULL,
  latency_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX health_logs_service_idx ON system_health_logs(service, checked_at DESC);
CREATE INDEX health_logs_status_idx ON system_health_logs(status, checked_at DESC);

-- ============================================================================
-- RATE LIMIT RULES
-- ============================================================================

CREATE TABLE rate_limit_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  endpoint_pattern VARCHAR(255) NOT NULL,
  requests_per_minute INTEGER NOT NULL,
  requests_per_hour INTEGER,
  burst_limit INTEGER,
  applies_to rate_limit_scope DEFAULT 'all',
  org_ids UUID[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_rate_limit_rules_updated_at
  BEFORE UPDATE ON rate_limit_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_dismissals ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_rules ENABLE ROW LEVEL SECURITY;

-- Platform settings: Super admins only
CREATE POLICY "Super admins manage platform settings"
  ON platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- Feature flags: Super admins can manage, anyone can read enabled flags
CREATE POLICY "Super admins manage feature flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

CREATE POLICY "Anyone can read enabled feature flags"
  ON feature_flags FOR SELECT
  USING (enabled = TRUE);

-- Audit logs: Super admins see all, org admins see their org
CREATE POLICY "Super admins view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

CREATE POLICY "Org admins view own org audit logs"
  ON audit_logs FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

-- Super admins can insert audit logs
CREATE POLICY "Super admins insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- Platform announcements: Super admins manage, users read active
CREATE POLICY "Super admins manage announcements"
  ON platform_announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

CREATE POLICY "Anyone can view active announcements"
  ON platform_announcements FOR SELECT
  USING (
    starts_at <= NOW()
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Announcement dismissals: Users manage their own
CREATE POLICY "Users manage own dismissals"
  ON announcement_dismissals FOR ALL
  USING (user_id = auth.uid());

-- System health logs: Super admins only
CREATE POLICY "Super admins manage health logs"
  ON system_health_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- Rate limit rules: Super admins only
CREATE POLICY "Super admins manage rate limits"
  ON rate_limit_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if a feature flag is enabled for a user/org
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_flag_key VARCHAR,
  p_user_id UUID DEFAULT NULL,
  p_org_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  flag RECORD;
BEGIN
  SELECT * INTO flag FROM feature_flags WHERE key = p_flag_key;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if globally enabled
  IF flag.enabled THEN
    RETURN TRUE;
  END IF;

  -- Check specific user
  IF p_user_id IS NOT NULL AND p_user_id = ANY(flag.user_ids) THEN
    RETURN TRUE;
  END IF;

  -- Check specific org
  IF p_org_id IS NOT NULL AND p_org_id = ANY(flag.org_ids) THEN
    RETURN TRUE;
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

-- Log an audit event
CREATE OR REPLACE FUNCTION log_audit_event(
  p_actor_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID DEFAULT NULL,
  p_org_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_actor_type actor_type;
BEGIN
  -- Determine actor type
  IF p_actor_id IS NULL THEN
    v_actor_type := 'system';
  ELSE
    v_actor_type := 'user';
  END IF;

  INSERT INTO audit_logs (
    actor_id,
    actor_type,
    action,
    resource_type,
    resource_id,
    org_id,
    changes,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_actor_id,
    v_actor_type,
    p_action,
    p_resource_type,
    p_resource_id,
    p_org_id,
    p_changes,
    p_metadata,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DEFAULT PLATFORM SETTINGS
-- ============================================================================

INSERT INTO platform_settings (key, value, description) VALUES
  ('maintenance_mode', '{"enabled": false, "message": null, "allow_admins": true}', 'Platform maintenance mode'),
  ('registration_enabled', 'true', 'Allow new user registrations'),
  ('max_orgs_per_user', '5', 'Maximum organizations a user can create'),
  ('default_trial_days', '14', 'Default trial period for new orgs'),
  ('stripe_platform_fee_percent', '3.0', 'Platform fee percentage on transactions'),
  ('support_email', '"support@haunt.dev"', 'Platform support email'),
  ('terms_version', '"2024-12-31"', 'Current terms of service version'),
  ('privacy_version', '"2024-12-31"', 'Current privacy policy version'),
  ('max_attractions_per_org', '10', 'Maximum attractions per organization'),
  ('default_timezone', '"America/New_York"', 'Default timezone for new organizations');

-- ============================================================================
-- DEFAULT RATE LIMIT RULES
-- ============================================================================

INSERT INTO rate_limit_rules (name, endpoint_pattern, requests_per_minute, requests_per_hour, burst_limit, applies_to) VALUES
  -- Authentication (strict to prevent brute force/spam)
  ('Login Rate Limit', '/api/v1/auth/login', 5, 50, 10, 'all'),
  ('Registration Rate Limit', '/api/v1/auth/register', 3, 20, 5, 'all'),
  ('Password Reset Rate Limit', '/api/v1/auth/forgot-password', 3, 15, 5, 'all'),

  -- General API (realistic for SPA with multiple calls per page)
  ('API General Rate Limit', '/api/v1/*', 200, 5000, 50, 'authenticated'),
  ('Public API Rate Limit', '/api/v1/public/*', 60, 1000, 30, 'anonymous'),

  -- Ticketing (prevent scalping/bot abuse)
  ('Ticket Purchase Rate Limit', '/api/v1/*/orders', 10, 100, 15, 'all'),
  ('Promo Code Validation', '/api/v1/*/promo-codes/validate', 20, 200, 10, 'all'),

  -- Check-in (higher limits for busy scanning periods)
  ('Check-In Scanning', '/api/v1/*/check-in/scan', 120, 10000, 30, 'authenticated'),
  ('Check-In Status', '/api/v1/*/check-in/status', 60, 3000, 20, 'authenticated'),

  -- Storefronts (public-facing, high traffic during sales)
  ('Storefront Public Pages', '/api/v1/storefronts/*', 100, 3000, 50, 'anonymous'),

  -- File uploads (prevent resource exhaustion)
  ('File Upload Rate Limit', '/api/v1/*/media/upload', 10, 100, 5, 'authenticated'),

  -- Virtual Queue (frequent polling expected)
  ('Queue Position Updates', '/api/v1/*/queue/position', 30, 1800, 10, 'all'),
  ('Queue Join Rate Limit', '/api/v1/*/queue/join', 5, 30, 3, 'all');

-- ============================================================================
-- COMPLETE
-- ============================================================================
