-- F11: Virtual Queue System Migration
-- Tables: queue_configs, queue_entries, queue_notifications, queue_stats

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE queue_status AS ENUM (
  'waiting',      -- In queue
  'notified',     -- Notification sent
  'called',       -- Called to enter
  'checked_in',   -- Entered attraction
  'expired',      -- Missed their turn
  'left',         -- Left queue voluntarily
  'no_show'       -- Didn't show after being called
);

CREATE TYPE queue_notification_type AS ENUM (
  'joined',       -- Confirmation of joining
  'reminder',     -- Reminder of position
  'almost_ready', -- 10 min warning
  'ready',        -- Time to enter
  'final_call',   -- Last call before expiry
  'expired'       -- Slot expired
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Queue configuration per attraction
CREATE TABLE queue_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_paused BOOLEAN DEFAULT FALSE,
  capacity_per_batch INTEGER DEFAULT 10,
  batch_interval_minutes INTEGER DEFAULT 5,
  max_wait_minutes INTEGER DEFAULT 120,
  max_queue_size INTEGER DEFAULT 500,
  allow_rejoin BOOLEAN DEFAULT FALSE,
  require_check_in BOOLEAN DEFAULT TRUE,
  notification_lead_minutes INTEGER DEFAULT 10,
  expiry_minutes INTEGER DEFAULT 15,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(attraction_id)
);

-- Individual queue entries (guests in line)
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  queue_id UUID NOT NULL REFERENCES queue_configs(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  confirmation_code VARCHAR(10) NOT NULL,
  guest_name VARCHAR(200),
  guest_phone VARCHAR(20),
  guest_email VARCHAR(255),
  party_size INTEGER DEFAULT 1 CHECK (party_size >= 1 AND party_size <= 20),
  position INTEGER NOT NULL,
  status queue_status DEFAULT 'waiting',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_time TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  called_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT queue_entries_confirmation_unique UNIQUE(confirmation_code)
);

-- Notification history for queue entries
CREATE TABLE queue_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES queue_entries(id) ON DELETE CASCADE,
  type queue_notification_type NOT NULL,
  channel VARCHAR(20) NOT NULL, -- 'sms', 'push', 'email'
  recipient VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error TEXT,
  provider_response JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hourly queue statistics for analytics
CREATE TABLE queue_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  queue_id UUID NOT NULL REFERENCES queue_configs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  entries_joined INTEGER DEFAULT 0,
  entries_served INTEGER DEFAULT 0,
  entries_expired INTEGER DEFAULT 0,
  entries_left INTEGER DEFAULT 0,
  entries_no_show INTEGER DEFAULT 0,
  avg_wait_minutes NUMERIC(10,2),
  max_wait_minutes INTEGER,
  max_queue_size INTEGER,
  total_party_size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(queue_id, date, hour)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Queue configs
CREATE INDEX idx_queue_configs_org ON queue_configs(org_id);
CREATE INDEX idx_queue_configs_attraction ON queue_configs(attraction_id);
CREATE INDEX idx_queue_configs_active ON queue_configs(org_id, is_active) WHERE is_active = TRUE;

-- Queue entries
CREATE INDEX idx_queue_entries_org ON queue_entries(org_id);
CREATE INDEX idx_queue_entries_queue ON queue_entries(queue_id);
CREATE INDEX idx_queue_entries_queue_status ON queue_entries(queue_id, status);
CREATE INDEX idx_queue_entries_waiting ON queue_entries(queue_id, position) WHERE status = 'waiting';
CREATE INDEX idx_queue_entries_confirmation ON queue_entries(confirmation_code);
CREATE INDEX idx_queue_entries_ticket ON queue_entries(ticket_id) WHERE ticket_id IS NOT NULL;
CREATE INDEX idx_queue_entries_joined_at ON queue_entries(queue_id, joined_at DESC);
CREATE INDEX idx_queue_entries_phone ON queue_entries(guest_phone) WHERE guest_phone IS NOT NULL;

-- Queue notifications
CREATE INDEX idx_queue_notifications_entry ON queue_notifications(entry_id);
CREATE INDEX idx_queue_notifications_org ON queue_notifications(org_id);
CREATE INDEX idx_queue_notifications_sent ON queue_notifications(entry_id, sent_at DESC);

-- Queue stats
CREATE INDEX idx_queue_stats_queue ON queue_stats(queue_id);
CREATE INDEX idx_queue_stats_date ON queue_stats(queue_id, date DESC);
CREATE INDEX idx_queue_stats_org ON queue_stats(org_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Generate unique confirmation code
CREATE OR REPLACE FUNCTION generate_queue_confirmation_code()
RETURNS VARCHAR(10) AS $$
DECLARE
  chars VARCHAR := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result VARCHAR := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Get next position in queue
CREATE OR REPLACE FUNCTION get_next_queue_position(p_queue_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_max_position INTEGER;
BEGIN
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_max_position
  FROM queue_entries
  WHERE queue_id = p_queue_id
    AND status IN ('waiting', 'notified', 'called');

  RETURN v_max_position;
END;
$$ LANGUAGE plpgsql;

-- Calculate estimated wait time for an entry
CREATE OR REPLACE FUNCTION calculate_queue_wait_time(p_entry_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_queue RECORD;
  v_entry RECORD;
  v_ahead INTEGER;
  v_wait_minutes INTEGER;
BEGIN
  -- Get entry and queue info
  SELECT qe.*, qc.capacity_per_batch, qc.batch_interval_minutes
  INTO v_entry
  FROM queue_entries qe
  JOIN queue_configs qc ON qc.id = qe.queue_id
  WHERE qe.id = p_entry_id;

  IF v_entry IS NULL THEN
    RETURN NULL;
  END IF;

  -- Count people/parties ahead
  SELECT COALESCE(SUM(party_size), 0) INTO v_ahead
  FROM queue_entries
  WHERE queue_id = v_entry.queue_id
    AND status = 'waiting'
    AND position < v_entry.position;

  -- Calculate wait time based on batches
  v_wait_minutes := CEIL(v_ahead::NUMERIC / v_entry.capacity_per_batch)
                    * v_entry.batch_interval_minutes;

  RETURN v_wait_minutes;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get queue status summary
CREATE OR REPLACE FUNCTION get_queue_status(p_queue_id UUID)
RETURNS TABLE (
  is_active BOOLEAN,
  is_paused BOOLEAN,
  current_queue_size INTEGER,
  people_waiting INTEGER,
  avg_wait_minutes INTEGER,
  estimated_end_time TIMESTAMPTZ,
  next_batch_time TIMESTAMPTZ
) AS $$
DECLARE
  v_config RECORD;
  v_total_waiting INTEGER;
  v_people_waiting INTEGER;
BEGIN
  SELECT * INTO v_config
  FROM queue_configs
  WHERE id = p_queue_id;

  IF v_config IS NULL THEN
    RETURN;
  END IF;

  -- Count waiting entries
  SELECT
    COUNT(*),
    COALESCE(SUM(party_size), 0)
  INTO v_total_waiting, v_people_waiting
  FROM queue_entries
  WHERE queue_id = p_queue_id
    AND status = 'waiting';

  RETURN QUERY
  SELECT
    v_config.is_active,
    v_config.is_paused,
    v_total_waiting,
    v_people_waiting,
    CEIL(v_people_waiting::NUMERIC / v_config.capacity_per_batch)::INTEGER
      * v_config.batch_interval_minutes,
    NOW() + (CEIL(v_people_waiting::NUMERIC / v_config.capacity_per_batch)
      * v_config.batch_interval_minutes * INTERVAL '1 minute'),
    NOW() + (v_config.batch_interval_minutes * INTERVAL '1 minute');
END;
$$ LANGUAGE plpgsql STABLE;

-- Get queue entry position info
CREATE OR REPLACE FUNCTION get_queue_position_info(p_confirmation_code VARCHAR)
RETURNS TABLE (
  entry_id UUID,
  conf_code VARCHAR,
  queue_position INTEGER,
  entry_status queue_status,
  guests_in_party INTEGER,
  people_ahead INTEGER,
  estimated_wait_minutes INTEGER,
  estimated_time TIMESTAMPTZ,
  time_joined TIMESTAMPTZ,
  queue_name VARCHAR,
  attraction_name VARCHAR
) AS $$
DECLARE
  v_entry RECORD;
  v_ahead INTEGER;
  v_wait INTEGER;
BEGIN
  -- Get entry
  SELECT qe.*, qc.name as queue_name, qc.capacity_per_batch, qc.batch_interval_minutes, a.name as attraction_name
  INTO v_entry
  FROM queue_entries qe
  JOIN queue_configs qc ON qc.id = qe.queue_id
  JOIN attractions a ON a.id = qc.attraction_id
  WHERE qe.confirmation_code = p_confirmation_code;

  IF v_entry IS NULL THEN
    RETURN;
  END IF;

  -- Count people ahead
  SELECT COALESCE(SUM(party_size), 0) INTO v_ahead
  FROM queue_entries
  WHERE queue_id = v_entry.queue_id
    AND status = 'waiting'
    AND position < v_entry.position;

  -- Calculate wait
  v_wait := CEIL(v_ahead::NUMERIC / v_entry.capacity_per_batch)
            * v_entry.batch_interval_minutes;

  RETURN QUERY
  SELECT
    v_entry.id,
    v_entry.confirmation_code,
    v_entry.position,
    v_entry.status,
    v_entry.party_size,
    v_ahead,
    v_wait,
    NOW() + (v_wait * INTERVAL '1 minute'),
    v_entry.joined_at,
    v_entry.queue_name::VARCHAR,
    v_entry.attraction_name::VARCHAR;
END;
$$ LANGUAGE plpgsql STABLE;

-- Recalculate positions after entry leaves
CREATE OR REPLACE FUNCTION recalculate_queue_positions(p_queue_id UUID)
RETURNS VOID AS $$
BEGIN
  WITH ordered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY position) as new_pos
    FROM queue_entries
    WHERE queue_id = p_queue_id
      AND status = 'waiting'
  )
  UPDATE queue_entries qe
  SET position = ordered.new_pos
  FROM ordered
  WHERE qe.id = ordered.id;
END;
$$ LANGUAGE plpgsql;

-- Get daily queue stats
CREATE OR REPLACE FUNCTION get_queue_daily_stats(
  p_queue_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_joined INTEGER,
  total_served INTEGER,
  total_expired INTEGER,
  total_left INTEGER,
  total_no_show INTEGER,
  avg_wait_minutes NUMERIC,
  max_wait_minutes INTEGER,
  peak_queue_size INTEGER,
  by_hour JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH hourly AS (
    SELECT
      qs.hour,
      qs.entries_joined,
      qs.entries_served,
      qs.entries_expired,
      qs.avg_wait_minutes as wait_avg,
      qs.max_queue_size
    FROM queue_stats qs
    WHERE qs.queue_id = p_queue_id AND qs.date = p_date
    ORDER BY qs.hour
  ),
  daily_entries AS (
    SELECT
      COUNT(*) FILTER (WHERE status IN ('checked_in', 'expired', 'left', 'no_show', 'waiting', 'notified', 'called')) as joined,
      COUNT(*) FILTER (WHERE status = 'checked_in') as served,
      COUNT(*) FILTER (WHERE status = 'expired') as expired,
      COUNT(*) FILTER (WHERE status = 'left') as left_queue,
      COUNT(*) FILTER (WHERE status = 'no_show') as no_show,
      AVG(EXTRACT(EPOCH FROM (COALESCE(checked_in_at, expired_at, left_at, NOW()) - joined_at)) / 60)::NUMERIC(10,2) as avg_wait,
      MAX(EXTRACT(EPOCH FROM (COALESCE(checked_in_at, expired_at, left_at, NOW()) - joined_at)) / 60)::INTEGER as max_wait
    FROM queue_entries
    WHERE queue_id = p_queue_id
      AND joined_at::DATE = p_date
  )
  SELECT
    COALESCE((SELECT joined FROM daily_entries), 0)::INTEGER,
    COALESCE((SELECT served FROM daily_entries), 0)::INTEGER,
    COALESCE((SELECT expired FROM daily_entries), 0)::INTEGER,
    COALESCE((SELECT left_queue FROM daily_entries), 0)::INTEGER,
    COALESCE((SELECT no_show FROM daily_entries), 0)::INTEGER,
    (SELECT avg_wait FROM daily_entries),
    (SELECT max_wait FROM daily_entries),
    COALESCE((SELECT MAX(max_queue_size) FROM hourly), 0),
    COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'hour', hour,
      'joined', entries_joined,
      'served', entries_served,
      'expired', entries_expired,
      'avg_wait', wait_avg,
      'max_size', max_queue_size
    ) ORDER BY hour) FROM hourly), '[]'::JSONB);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE queue_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_stats ENABLE ROW LEVEL SECURITY;

-- Queue configs policies
CREATE POLICY "queue_configs_select" ON queue_configs
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "queue_configs_insert" ON queue_configs
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "queue_configs_update" ON queue_configs
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "queue_configs_delete" ON queue_configs
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin')
    )
  );

-- Queue entries policies (authenticated users in org)
CREATE POLICY "queue_entries_select" ON queue_entries
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "queue_entries_insert" ON queue_entries
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "queue_entries_update" ON queue_entries
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "queue_entries_delete" ON queue_entries
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Queue notifications policies
CREATE POLICY "queue_notifications_select" ON queue_notifications
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "queue_notifications_insert" ON queue_notifications
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Queue stats policies
CREATE POLICY "queue_stats_select" ON queue_stats
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "queue_stats_insert" ON queue_stats
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "queue_stats_update" ON queue_stats
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE TRIGGER update_queue_configs_updated_at
  BEFORE UPDATE ON queue_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_entries_updated_at
  BEFORE UPDATE ON queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate confirmation code
CREATE OR REPLACE FUNCTION set_queue_entry_confirmation_code()
RETURNS TRIGGER AS $$
DECLARE
  v_code VARCHAR(10);
  v_exists BOOLEAN;
BEGIN
  IF NEW.confirmation_code IS NULL OR NEW.confirmation_code = '' THEN
    LOOP
      v_code := generate_queue_confirmation_code();
      SELECT EXISTS(SELECT 1 FROM queue_entries WHERE confirmation_code = v_code) INTO v_exists;
      EXIT WHEN NOT v_exists;
    END LOOP;
    NEW.confirmation_code := v_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queue_entry_set_confirmation_code
  BEFORE INSERT ON queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION set_queue_entry_confirmation_code();

-- Auto-set position
CREATE OR REPLACE FUNCTION set_queue_entry_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position IS NULL OR NEW.position = 0 THEN
    NEW.position := get_next_queue_position(NEW.queue_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queue_entry_set_position
  BEFORE INSERT ON queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION set_queue_entry_position();

-- Auto-calculate estimated time
CREATE OR REPLACE FUNCTION set_queue_entry_estimated_time()
RETURNS TRIGGER AS $$
DECLARE
  v_wait_minutes INTEGER;
BEGIN
  v_wait_minutes := calculate_queue_wait_time(NEW.id);
  IF v_wait_minutes IS NOT NULL THEN
    NEW.estimated_time := NOW() + (v_wait_minutes * INTERVAL '1 minute');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger runs AFTER insert to have access to the position
CREATE OR REPLACE FUNCTION update_queue_entry_estimated_time()
RETURNS TRIGGER AS $$
DECLARE
  v_wait_minutes INTEGER;
BEGIN
  v_wait_minutes := calculate_queue_wait_time(NEW.id);
  IF v_wait_minutes IS NOT NULL THEN
    UPDATE queue_entries
    SET estimated_time = NOW() + (v_wait_minutes * INTERVAL '1 minute')
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queue_entry_update_estimated_time
  AFTER INSERT ON queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_entry_estimated_time();

-- Update timestamps when status changes
CREATE OR REPLACE FUNCTION update_queue_entry_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    CASE NEW.status
      WHEN 'notified' THEN
        NEW.notified_at := NOW();
      WHEN 'called' THEN
        NEW.called_at := NOW();
      WHEN 'checked_in' THEN
        NEW.checked_in_at := NOW();
      WHEN 'expired' THEN
        NEW.expired_at := NOW();
      WHEN 'left' THEN
        NEW.left_at := NOW();
      WHEN 'no_show' THEN
        NEW.expired_at := NOW();
      ELSE
        -- No timestamp update needed
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queue_entry_status_timestamps
  BEFORE UPDATE ON queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_entry_status_timestamps();

-- ============================================================================
-- FEATURE FLAG NOTE
-- ============================================================================
-- The 'virtual_queue' feature flag is defined in supabase/seed.sql
-- with tier: enterprise, feature: F11, module: true
