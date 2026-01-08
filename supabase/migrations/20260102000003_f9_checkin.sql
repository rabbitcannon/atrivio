-- F9: Check-In System Migration
-- Tables: check_in_stations, check_ins, capacity_snapshots, guest_waivers

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE check_in_method AS ENUM (
  'barcode_scan',
  'qr_scan',
  'manual_lookup',
  'order_number',
  'walk_up'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Check-in stations (physical or virtual check-in points)
CREATE TABLE check_in_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  device_id VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-in records
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  time_slot_id UUID REFERENCES time_slots(id) ON DELETE SET NULL,
  station_id UUID REFERENCES check_in_stations(id) ON DELETE SET NULL,
  checked_in_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_in_method check_in_method NOT NULL,
  guest_count INTEGER DEFAULT 1,
  waiver_signed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capacity snapshots (point-in-time capacity tracking)
CREATE TABLE capacity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  current_count INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL,
  wait_time_minutes INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest waivers
CREATE TABLE guest_waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  guest_name VARCHAR(200) NOT NULL,
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  guest_dob DATE,
  is_minor BOOLEAN DEFAULT FALSE,
  guardian_name VARCHAR(200),
  guardian_email VARCHAR(255),
  guardian_phone VARCHAR(50),
  waiver_type VARCHAR(100) NOT NULL DEFAULT 'standard',
  waiver_version VARCHAR(50) DEFAULT '1.0',
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  signature_data TEXT,
  agreement_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Check-in stations
CREATE INDEX idx_check_in_stations_org ON check_in_stations(org_id);
CREATE INDEX idx_check_in_stations_attraction ON check_in_stations(attraction_id);
CREATE INDEX idx_check_in_stations_active ON check_in_stations(org_id, is_active) WHERE is_active = TRUE;

-- Check-ins
CREATE INDEX idx_check_ins_org ON check_ins(org_id);
CREATE INDEX idx_check_ins_attraction_time ON check_ins(attraction_id, check_in_time DESC);
CREATE INDEX idx_check_ins_ticket ON check_ins(ticket_id);
CREATE INDEX idx_check_ins_time_slot ON check_ins(time_slot_id, check_in_time);
CREATE INDEX idx_check_ins_station ON check_ins(station_id, check_in_time DESC);
-- Index for recent check-ins (query will filter by date)
CREATE INDEX idx_check_ins_recent ON check_ins(attraction_id, check_in_time DESC);

-- Capacity snapshots
CREATE INDEX idx_capacity_attraction_time ON capacity_snapshots(attraction_id, timestamp DESC);
CREATE INDEX idx_capacity_org ON capacity_snapshots(org_id);

-- Guest waivers
CREATE INDEX idx_waivers_org ON guest_waivers(org_id);
CREATE INDEX idx_waivers_attraction ON guest_waivers(attraction_id);
CREATE INDEX idx_waivers_ticket ON guest_waivers(ticket_id);
CREATE INDEX idx_waivers_order ON guest_waivers(order_id);
CREATE INDEX idx_waivers_guest_email ON guest_waivers(guest_email);
CREATE INDEX idx_waivers_signed_at ON guest_waivers(attraction_id, signed_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get current capacity for an attraction
CREATE OR REPLACE FUNCTION get_current_capacity(p_attraction_id UUID)
RETURNS TABLE (
  current_count INTEGER,
  capacity INTEGER,
  percentage NUMERIC,
  estimated_wait_minutes INTEGER,
  status TEXT
) AS $$
DECLARE
  v_capacity INTEGER;
  v_current INTEGER;
  v_percentage NUMERIC;
BEGIN
  -- Get attraction capacity
  SELECT a.capacity INTO v_capacity
  FROM attractions a
  WHERE a.id = p_attraction_id;

  IF v_capacity IS NULL THEN
    v_capacity := 200; -- Default capacity
  END IF;

  -- Count check-ins in last 4 hours (approximate current guests)
  SELECT COUNT(DISTINCT c.ticket_id)::INTEGER INTO v_current
  FROM check_ins c
  WHERE c.attraction_id = p_attraction_id
    AND c.check_in_time > NOW() - INTERVAL '4 hours';

  v_percentage := ROUND(v_current::NUMERIC / v_capacity * 100, 1);

  RETURN QUERY
  SELECT
    v_current,
    v_capacity,
    v_percentage,
    CASE
      WHEN v_current > v_capacity * 0.8
      THEN ((v_current - v_capacity * 0.8) / 10 * 5)::INTEGER
      ELSE 0
    END,
    CASE
      WHEN v_percentage >= 100 THEN 'full'
      WHEN v_percentage >= 90 THEN 'critical'
      WHEN v_percentage >= 70 THEN 'busy'
      ELSE 'normal'
    END;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get check-in stats for a date
CREATE OR REPLACE FUNCTION get_checkin_stats(
  p_attraction_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_checked_in INTEGER,
  total_expected INTEGER,
  check_in_rate NUMERIC,
  by_hour JSONB,
  by_station JSONB,
  by_method JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH hourly AS (
    SELECT
      DATE_TRUNC('hour', check_in_time) AS hour,
      COUNT(*)::INTEGER AS count
    FROM check_ins
    WHERE attraction_id = p_attraction_id
      AND check_in_time::DATE = p_date
    GROUP BY DATE_TRUNC('hour', check_in_time)
  ),
  station_stats AS (
    SELECT
      COALESCE(s.name, 'Unknown') AS station_name,
      COUNT(*)::INTEGER AS count
    FROM check_ins c
    LEFT JOIN check_in_stations s ON c.station_id = s.id
    WHERE c.attraction_id = p_attraction_id
      AND c.check_in_time::DATE = p_date
    GROUP BY COALESCE(s.name, 'Unknown')
  ),
  method_stats AS (
    SELECT
      check_in_method::TEXT AS method,
      COUNT(*)::INTEGER AS count
    FROM check_ins
    WHERE attraction_id = p_attraction_id
      AND check_in_time::DATE = p_date
    GROUP BY check_in_method
  ),
  expected AS (
    SELECT COALESCE(SUM(ts.capacity), 0)::INTEGER AS total
    FROM time_slots ts
    WHERE ts.attraction_id = p_attraction_id
      AND ts.date = p_date
  )
  SELECT
    (SELECT COUNT(*)::INTEGER FROM check_ins
     WHERE attraction_id = p_attraction_id AND check_in_time::DATE = p_date),
    (SELECT total FROM expected),
    CASE
      WHEN (SELECT total FROM expected) > 0
      THEN ROUND((SELECT COUNT(*) FROM check_ins
                  WHERE attraction_id = p_attraction_id AND check_in_time::DATE = p_date)::NUMERIC
                 / (SELECT total FROM expected) * 100, 1)
      ELSE 0
    END,
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('hour', hour, 'count', count) ORDER BY hour), '[]') FROM hourly),
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('station', station_name, 'count', count)), '[]') FROM station_stats),
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('method', method, 'count', count)), '[]') FROM method_stats);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE check_in_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_waivers ENABLE ROW LEVEL SECURITY;

-- Check-in stations policies
CREATE POLICY "check_in_stations_select" ON check_in_stations
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "check_in_stations_insert" ON check_in_stations
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "check_in_stations_update" ON check_in_stations
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "check_in_stations_delete" ON check_in_stations
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin')
    )
  );

-- Check-ins policies
CREATE POLICY "check_ins_select" ON check_ins
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "check_ins_insert" ON check_ins
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'manager', 'box_office', 'scanner')
    )
  );

CREATE POLICY "check_ins_update" ON check_ins
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Capacity snapshots policies
CREATE POLICY "capacity_snapshots_select" ON capacity_snapshots
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "capacity_snapshots_insert" ON capacity_snapshots
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'manager', 'box_office', 'scanner')
    )
  );

-- Guest waivers policies
CREATE POLICY "guest_waivers_select" ON guest_waivers
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "guest_waivers_insert" ON guest_waivers
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "guest_waivers_update" ON guest_waivers
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'admin', 'manager', 'box_office')
    )
  );

-- ============================================================================
-- SEED DATA (moved to supabase/seed.sql)
-- ============================================================================
-- Seed data is in supabase/seed.sql to ensure proper ordering after all tables exist

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update check_in_stations.updated_at
CREATE TRIGGER update_check_in_stations_updated_at
  BEFORE UPDATE ON check_in_stations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update station last_activity on check-in
CREATE OR REPLACE FUNCTION update_station_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.station_id IS NOT NULL THEN
    UPDATE check_in_stations
    SET last_activity = NOW()
    WHERE id = NEW.station_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_in_update_station_activity
  AFTER INSERT ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_station_last_activity();

-- Update ticket status to 'used' on check-in
CREATE OR REPLACE FUNCTION update_ticket_on_checkin()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tickets
  SET
    status = 'used',
    checked_in_at = NEW.check_in_time,
    checked_in_by = NEW.checked_in_by
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_in_update_ticket_status
  AFTER INSERT ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_on_checkin();
