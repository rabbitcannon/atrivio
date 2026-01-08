# F5: Platform Admin - ERD

## Overview

Platform-level administration for super admins. Provides cross-tenant oversight, audit logging, feature flags, and system configuration. Super admins are identified by `is_super_admin = TRUE` on the profiles table (from F1).

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          profiles                                │
│                         (from F1)                                │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ is_super_admin  BOOLEAN DEFAULT FALSE  ◄── Platform admin check  │
│ ...                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   audit_logs     │ │  feature_flags   │ │ system_settings  │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ id         UUID  │ │ id         UUID  │ │ key        TEXT  │
│ actor_id   UUID  │ │ name       TEXT  │ │ value      JSONB │
│ action     TEXT  │ │ enabled    BOOL  │ │ updated_by UUID  │
│ resource   TEXT  │ │ metadata   JSONB │ │ updated_at TSTZ  │
│ org_id     UUID? │ │ updated_by UUID  │ └──────────────────┘
│ details    JSONB │ │ updated_at TSTZ  │
│ ip_address INET  │ └──────────────────┘
│ user_agent TEXT  │
│ created_at TSTZ  │
└──────────────────┘
```

## Tables

### audit_logs

Immutable log of all significant actions across the platform.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique log entry ID |
| actor_id | UUID | FK → profiles.id | User who performed the action |
| action | VARCHAR(100) | NOT NULL | Action type (e.g., 'create', 'update', 'delete', 'login') |
| resource_type | VARCHAR(100) | NOT NULL | Type of resource (e.g., 'organization', 'attraction', 'staff') |
| resource_id | UUID | | ID of the affected resource |
| org_id | UUID | FK → organizations.id | Organization context (NULL for platform-level) |
| details | JSONB | DEFAULT '{}' | Additional context (before/after values, etc.) |
| ip_address | INET | | Client IP address |
| user_agent | TEXT | | Client user agent string |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When the action occurred |

### feature_flags

Platform-wide feature toggles for gradual rollouts and A/B testing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique flag ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Flag identifier (e.g., 'virtual_queue_enabled') |
| display_name | VARCHAR(200) | NOT NULL | Human-readable name |
| description | TEXT | | What this flag controls |
| enabled | BOOLEAN | DEFAULT FALSE | Global enabled state |
| rollout_percentage | INTEGER | DEFAULT 0, CHECK (0-100) | Percentage rollout (0-100) |
| org_overrides | JSONB | DEFAULT '{}' | Per-org overrides {org_id: boolean} |
| metadata | JSONB | DEFAULT '{}' | Additional configuration |
| updated_by | UUID | FK → profiles.id | Last user to update |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

### system_settings

Platform configuration key-value store.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key | VARCHAR(100) | PK | Setting key (e.g., 'platform_name', 'support_email') |
| value | JSONB | NOT NULL | Setting value (any JSON type) |
| description | TEXT | | What this setting controls |
| category | VARCHAR(50) | DEFAULT 'general' | Setting category for grouping |
| is_public | BOOLEAN | DEFAULT FALSE | Whether setting is visible to non-admins |
| updated_by | UUID | FK → profiles.id | Last user to update |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

## Indexes

```sql
-- Audit logs: query by actor, resource, org, time range
CREATE INDEX audit_logs_actor_id_idx ON audit_logs(actor_id);
CREATE INDEX audit_logs_resource_type_idx ON audit_logs(resource_type);
CREATE INDEX audit_logs_org_id_idx ON audit_logs(org_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);

-- Feature flags: lookup by name
CREATE UNIQUE INDEX feature_flags_name_idx ON feature_flags(name);

-- System settings: lookup by category
CREATE INDEX system_settings_category_idx ON system_settings(category);
```

## RLS Policies

```sql
-- Audit logs: Super admins can read all, org admins can read their org's logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can read all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

CREATE POLICY "Org owners/admins can read their org audit logs"
  ON audit_logs FOR SELECT
  USING (
    org_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE user_id = auth.uid()
        AND org_id = audit_logs.org_id
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

-- Audit logs are append-only via service role
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (TRUE);  -- Controlled by service role key

-- Feature flags: Super admins only
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

CREATE POLICY "Anyone can read enabled flags"
  ON feature_flags FOR SELECT
  USING (enabled = TRUE);

-- System settings: Super admins can manage, public settings readable by all
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage system settings"
  ON system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

CREATE POLICY "Public settings readable by all"
  ON system_settings FOR SELECT
  USING (is_public = TRUE);
```

## Helper Functions

```sql
-- Log an audit event (called from API via service role)
CREATE OR REPLACE FUNCTION log_audit_event(
  p_actor_id UUID,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(100),
  p_resource_id UUID DEFAULT NULL,
  p_org_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    actor_id, action, resource_type, resource_id,
    org_id, details, ip_address, user_agent
  )
  VALUES (
    p_actor_id, p_action, p_resource_type, p_resource_id,
    p_org_id, p_details, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if a feature flag is enabled for an org
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_flag_name VARCHAR(100),
  p_org_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_flag RECORD;
  v_org_override BOOLEAN;
BEGIN
  SELECT * INTO v_flag
  FROM feature_flags
  WHERE name = p_flag_name;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check org-specific override first
  IF p_org_id IS NOT NULL AND v_flag.org_overrides ? p_org_id::TEXT THEN
    RETURN (v_flag.org_overrides->>p_org_id::TEXT)::BOOLEAN;
  END IF;

  -- Check global enabled state
  IF v_flag.enabled THEN
    -- If rollout_percentage < 100, use deterministic hash
    IF v_flag.rollout_percentage < 100 AND p_org_id IS NOT NULL THEN
      RETURN (abs(hashtext(p_org_id::TEXT)) % 100) < v_flag.rollout_percentage;
    END IF;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get a system setting value
CREATE OR REPLACE FUNCTION get_system_setting(p_key VARCHAR(100))
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT value FROM system_settings WHERE key = p_key);
END;
$$ LANGUAGE plpgsql STABLE;
```

## Triggers

```sql
-- Update updated_at on feature_flags changes
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on system_settings changes
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Default System Settings

```sql
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('platform_name', '"Atrivio"', 'Platform display name', 'branding', TRUE),
  ('support_email', '"support@haunt.dev"', 'Support contact email', 'support', TRUE),
  ('max_orgs_per_user', '5', 'Maximum organizations a user can own', 'limits', FALSE),
  ('max_attractions_per_org', '10', 'Maximum attractions per organization', 'limits', FALSE),
  ('enable_signups', 'true', 'Whether new user signups are allowed', 'auth', FALSE),
  ('maintenance_mode', 'false', 'Platform-wide maintenance mode', 'system', TRUE),
  ('stripe_platform_fee_percent', '2.5', 'Platform fee percentage on transactions', 'payments', FALSE),
  ('default_timezone', '"America/New_York"', 'Default timezone for new users', 'defaults', FALSE);
```

## Default Feature Flags

```sql
INSERT INTO feature_flags (name, display_name, description, enabled, rollout_percentage) VALUES
  ('virtual_queue', 'Virtual Queue', 'Enable virtual queue system for attractions', FALSE, 0),
  ('mobile_tickets', 'Mobile Tickets', 'Enable mobile ticket scanning', TRUE, 100),
  ('staff_scheduling', 'Staff Scheduling', 'Enable advanced staff scheduling module', FALSE, 0),
  ('real_time_analytics', 'Real-Time Analytics', 'Enable real-time analytics dashboard', FALSE, 25),
  ('dark_mode', 'Dark Mode', 'Enable dark mode theme option', TRUE, 100);
```

## Dependencies

- F1: Auth & Users (profiles table, is_super_admin flag)
- F2: Organizations (org_id references for audit logs)

## Migration Order

1. Create audit_logs table
2. Create feature_flags table
3. Create system_settings table
4. Create indexes
5. Create RLS policies
6. Create helper functions
7. Create triggers
8. Insert default settings and flags
