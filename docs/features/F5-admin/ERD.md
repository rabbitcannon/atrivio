# F5: Platform Admin - ERD

## Overview

Platform administration for super admins. Provides god-mode access to all organizations, users, and system configuration. Super admins bypass RLS using service-role keys.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          profiles                                │
│                         (from F1)                                │
│                   is_super_admin = TRUE                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Manages
                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │                   PLATFORM SCOPE                         │
    ├─────────────────────────────────────────────────────────┤
    │  • All Organizations                                     │
    │  • All Users                                             │
    │  • All Attractions                                       │
    │  • Platform Settings                                     │
    │  • Audit Logs                                            │
    │  • Feature Flags                                         │
    └─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      platform_settings                           │
├─────────────────────────────────────────────────────────────────┤
│ key             VARCHAR(100) PK                                  │
│ value           JSONB NOT NULL                                   │
│ description     TEXT                                             │
│ updated_by      UUID FK → profiles.id                            │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       feature_flags                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ key             VARCHAR(100) UNIQUE NOT NULL                     │
│ name            VARCHAR(200) NOT NULL                            │
│ description     TEXT                                             │
│ enabled         BOOLEAN DEFAULT FALSE                            │
│ rollout_percentage INTEGER DEFAULT 0                             │
│ org_ids         UUID[]                                           │
│ user_ids        UUID[]                                           │
│ metadata        JSONB DEFAULT '{}'                               │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        audit_logs                                │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ actor_id        UUID FK → profiles.id                            │
│ actor_type      actor_type NOT NULL                              │
│ action          VARCHAR(100) NOT NULL                            │
│ resource_type   VARCHAR(100) NOT NULL                            │
│ resource_id     UUID                                             │
│ org_id          UUID FK → organizations.id                       │
│ changes         JSONB                                            │
│ metadata        JSONB DEFAULT '{}'                               │
│ ip_address      INET                                             │
│ user_agent      TEXT                                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ -- Partitioned by created_at for performance                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     platform_announcements                       │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ title           VARCHAR(200) NOT NULL                            │
│ content         TEXT NOT NULL                                    │
│ type            announcement_type DEFAULT 'info'                 │
│ target_roles    org_role[]                                       │
│ target_org_ids  UUID[]                                           │
│ starts_at       TIMESTAMPTZ DEFAULT NOW()                        │
│ expires_at      TIMESTAMPTZ                                      │
│ is_dismissible  BOOLEAN DEFAULT TRUE                             │
│ created_by      UUID FK → profiles.id NOT NULL                   │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 announcement_dismissals                          │
├─────────────────────────────────────────────────────────────────┤
│ announcement_id UUID FK → platform_announcements.id              │
│ user_id         UUID FK → profiles.id                            │
│ dismissed_at    TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ PRIMARY KEY (announcement_id, user_id)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      system_health_logs                          │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ service         VARCHAR(100) NOT NULL                            │
│ status          health_status NOT NULL                           │
│ latency_ms      INTEGER                                          │
│ error_message   TEXT                                             │
│ metadata        JSONB DEFAULT '{}'                               │
│ checked_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       rate_limit_rules                           │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ name            VARCHAR(100) NOT NULL                            │
│ endpoint_pattern VARCHAR(255) NOT NULL                           │
│ requests_per_minute INTEGER NOT NULL                             │
│ requests_per_hour INTEGER                                        │
│ burst_limit     INTEGER                                          │
│ applies_to      rate_limit_scope DEFAULT 'all'                   │
│ org_ids         UUID[]                                           │
│ enabled         BOOLEAN DEFAULT TRUE                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

```sql
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
```

## Tables

### platform_settings

Global platform configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key | VARCHAR(100) | PK | Setting key |
| value | JSONB | NOT NULL | Setting value |
| description | TEXT | | Human description |
| updated_by | UUID | FK | Last updater |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### feature_flags

Feature flag system for gradual rollouts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Flag ID |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Flag key |
| name | VARCHAR(200) | NOT NULL | Display name |
| description | TEXT | | Flag description |
| enabled | BOOLEAN | DEFAULT FALSE | Global enable |
| rollout_percentage | INTEGER | DEFAULT 0 | Percentage rollout |
| org_ids | UUID[] | | Specific orgs enabled |
| user_ids | UUID[] | | Specific users enabled |
| metadata | JSONB | DEFAULT '{}' | Additional config |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### audit_logs

System-wide audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Log ID |
| actor_id | UUID | FK | Who performed action |
| actor_type | actor_type | NOT NULL | Type of actor |
| action | VARCHAR(100) | NOT NULL | Action performed |
| resource_type | VARCHAR(100) | NOT NULL | Affected resource type |
| resource_id | UUID | | Affected resource ID |
| org_id | UUID | FK | Organization context |
| changes | JSONB | | Before/after values |
| metadata | JSONB | DEFAULT '{}' | Additional context |
| ip_address | INET | | Request IP |
| user_agent | TEXT | | Request user agent |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

### platform_announcements

System-wide announcements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Announcement ID |
| title | VARCHAR(200) | NOT NULL | Announcement title |
| content | TEXT | NOT NULL | Full content (markdown) |
| type | announcement_type | DEFAULT 'info' | Severity type |
| target_roles | org_role[] | | Roles to show to |
| target_org_ids | UUID[] | | Orgs to show to |
| starts_at | TIMESTAMPTZ | DEFAULT NOW() | Start showing |
| expires_at | TIMESTAMPTZ | | Stop showing |
| is_dismissible | BOOLEAN | DEFAULT TRUE | Can be dismissed |
| created_by | UUID | FK, NOT NULL | Creator |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

## Indexes

```sql
-- Audit logs (partitioned)
CREATE INDEX audit_logs_actor_idx ON audit_logs(actor_id, created_at DESC);
CREATE INDEX audit_logs_resource_idx ON audit_logs(resource_type, resource_id, created_at DESC);
CREATE INDEX audit_logs_org_idx ON audit_logs(org_id, created_at DESC);
CREATE INDEX audit_logs_action_idx ON audit_logs(action, created_at DESC);

-- Feature flags
CREATE UNIQUE INDEX feature_flags_key_idx ON feature_flags(key);

-- Announcements
CREATE INDEX announcements_active_idx ON platform_announcements(starts_at, expires_at)
  WHERE expires_at IS NULL OR expires_at > NOW();

-- Health logs
CREATE INDEX health_logs_service_idx ON system_health_logs(service, checked_at DESC);
```

## RLS Policies

```sql
-- Platform settings: Super admins only
CREATE POLICY "Super admins manage platform settings"
  ON platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- Audit logs: Super admins see all, users see their own org
CREATE POLICY "Super admins view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

CREATE POLICY "Users view own org audit logs"
  ON audit_logs FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

-- Announcements: Anyone can read active announcements
CREATE POLICY "Anyone can view active announcements"
  ON platform_announcements FOR SELECT
  USING (
    starts_at <= NOW()
    AND (expires_at IS NULL OR expires_at > NOW())
  );
```

## Functions

### Check Feature Flag

```sql
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

  -- Check percentage rollout
  IF flag.rollout_percentage > 0 AND p_user_id IS NOT NULL THEN
    -- Deterministic hash based on user_id and flag_key
    IF (hashtext(p_user_id::text || p_flag_key) % 100) < flag.rollout_percentage THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Log Audit Event

```sql
CREATE OR REPLACE FUNCTION log_audit_event(
  p_actor_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID DEFAULT NULL,
  p_org_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_logs (
    actor_id,
    actor_type,
    action,
    resource_type,
    resource_id,
    org_id,
    changes,
    metadata
  ) VALUES (
    p_actor_id,
    CASE WHEN p_actor_id IS NULL THEN 'system' ELSE 'user' END,
    p_action,
    p_resource_type,
    p_resource_id,
    p_org_id,
    p_changes,
    p_metadata
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Default Platform Settings

```sql
INSERT INTO platform_settings (key, value, description) VALUES
  ('maintenance_mode', '{"enabled": false, "message": null}', 'Platform maintenance mode'),
  ('registration_enabled', 'true', 'Allow new user registrations'),
  ('max_orgs_per_user', '5', 'Maximum organizations a user can create'),
  ('default_trial_days', '14', 'Default trial period for new orgs'),
  ('stripe_platform_fee_percent', '2.9', 'Platform fee percentage on transactions'),
  ('support_email', '"support@attractionplatform.com"', 'Platform support email'),
  ('terms_version', '"2024-01-01"', 'Current terms of service version'),
  ('privacy_version', '"2024-01-01"', 'Current privacy policy version');
```

## Business Rules

1. **Super Admin Access**: Super admins bypass all RLS policies using service-role key.

2. **Audit Everything**: All admin actions must be logged.

3. **Feature Flag Precedence**: User-specific > Org-specific > Percentage rollout > Global.

4. **Announcement Targeting**: Empty arrays mean "all" for roles/orgs.

5. **Settings Immutability**: Some settings (like stripe keys) should trigger warnings.

## Admin Actions Matrix

| Action | Audit Level | Requires Confirmation |
|--------|-------------|----------------------|
| View user data | info | No |
| Edit user | warning | No |
| Delete user | critical | Yes |
| Suspend org | warning | Yes |
| Delete org | critical | Yes, with typing |
| Change super admin | critical | Yes, with 2FA |
| Toggle maintenance | warning | Yes |
| Modify rate limits | info | No |
| Create announcement | info | No |

## Dependencies

- **F1 Auth**: profiles for super_admin flag
- **F2 Organizations**: org references in audit logs
- **F3 Attractions**: attraction references in audit logs
- **F4 Staff**: staff references in audit logs

## Migration Order

1. Create enums
2. Create platform_settings table
3. Insert default settings
4. Create feature_flags table
5. Create audit_logs table (partitioned)
6. Create platform_announcements table
7. Create announcement_dismissals table
8. Create system_health_logs table
9. Create rate_limit_rules table
10. Create indexes
11. Create RLS policies
12. Create helper functions
