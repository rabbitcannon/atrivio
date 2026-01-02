-- ============================================================================
-- F7B: SCHEDULING MIGRATION
-- Shifts, availability, templates, and swap requests
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE schedule_status AS ENUM (
  'draft',
  'scheduled',
  'published',
  'confirmed',
  'checked_in',
  'completed',
  'no_show',
  'canceled'
);

CREATE TYPE availability_type AS ENUM (
  'available',
  'unavailable',
  'preferred',
  'time_off_approved',
  'time_off_pending'
);

CREATE TYPE swap_type AS ENUM (
  'swap',       -- Trade with another person
  'drop',       -- Give up shift (needs coverage)
  'pickup'      -- Take open shift
);

CREATE TYPE swap_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'canceled',
  'expired'
);

CREATE TYPE period_status AS ENUM (
  'draft',
  'published',
  'locked'
);

CREATE TYPE conflict_type AS ENUM (
  'double_booked',
  'unavailable',
  'overtime',
  'insufficient_break',
  'skill_mismatch'
);

-- ============================================================================
-- TABLE 1: SCHEDULE_ROLES (Lookup Table)
-- ============================================================================

CREATE TABLE schedule_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  icon VARCHAR(50),
  color VARCHAR(7),
  is_schedulable BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, key)
);

-- Index for schedule_roles
CREATE INDEX schedule_roles_org_idx ON schedule_roles(org_id);
CREATE INDEX schedule_roles_active_idx ON schedule_roles(is_active) WHERE is_active = TRUE;

-- Trigger for schedule_roles
CREATE TRIGGER update_schedule_roles_updated_at
  BEFORE UPDATE ON schedule_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed system default schedule roles (NULL org_id = system defaults)
INSERT INTO schedule_roles (org_id, key, name, category, icon, color, sort_order) VALUES
  (NULL, 'actor', 'Actor', 'performance', 'theater-masks', '#9333EA', 1),
  (NULL, 'scare_actor', 'Scare Actor', 'performance', 'ghost', '#DC2626', 2),
  (NULL, 'guide', 'Guide', 'performance', 'map', '#2563EB', 3),
  (NULL, 'queue_entertainer', 'Queue Entertainer', 'performance', 'music', '#7C3AED', 4),
  (NULL, 'makeup_artist', 'Makeup Artist', 'support', 'palette', '#EC4899', 5),
  (NULL, 'costume_assistant', 'Costume Assistant', 'support', 'shirt', '#F59E0B', 6),
  (NULL, 'tech_crew', 'Tech Crew', 'support', 'wrench', '#6B7280', 7),
  (NULL, 'security', 'Security', 'operations', 'shield', '#1F2937', 8),
  (NULL, 'first_aid', 'First Aid', 'operations', 'heart-pulse', '#EF4444', 9),
  (NULL, 'box_office', 'Box Office', 'operations', 'ticket', '#10B981', 10),
  (NULL, 'parking', 'Parking', 'operations', 'car', '#6366F1', 11),
  (NULL, 'manager', 'Manager', 'management', 'user-cog', '#0891B2', 12),
  (NULL, 'supervisor', 'Supervisor', 'management', 'user-check', '#0D9488', 13),
  (NULL, 'floater', 'Floater', 'operations', 'shuffle', '#8B5CF6', 14);

-- ============================================================================
-- TABLE 2: SCHEDULE_PERIODS
-- ============================================================================

CREATE TABLE schedule_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status period_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (end_date >= start_date)
);

-- Indexes for schedule_periods
CREATE INDEX schedule_periods_org_idx ON schedule_periods(org_id);
CREATE INDEX schedule_periods_dates_idx ON schedule_periods(start_date, end_date);
CREATE INDEX schedule_periods_status_idx ON schedule_periods(status);

-- Trigger for schedule_periods
CREATE TRIGGER update_schedule_periods_updated_at
  BEFORE UPDATE ON schedule_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 3: SHIFT_TEMPLATES
-- ============================================================================

CREATE TABLE shift_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  role_id UUID NOT NULL REFERENCES schedule_roles(id),
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  min_staff INTEGER DEFAULT 1,
  max_staff INTEGER,
  required_skill_ids UUID[],
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Note: No end_time > start_time check because shifts can cross midnight
  CHECK (max_staff IS NULL OR max_staff >= min_staff)
);

-- Indexes for shift_templates
CREATE INDEX shift_templates_attraction_idx ON shift_templates(attraction_id) WHERE is_active = TRUE;
CREATE INDEX shift_templates_dow_idx ON shift_templates(attraction_id, day_of_week);
CREATE INDEX shift_templates_role_idx ON shift_templates(role_id);

-- Trigger for shift_templates
CREATE TRIGGER update_shift_templates_updated_at
  BEFORE UPDATE ON shift_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 4: STAFF_AVAILABILITY
-- ============================================================================

CREATE TABLE staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME,
  end_time TIME,
  availability_type availability_type NOT NULL,
  reason TEXT,
  recurring BOOLEAN DEFAULT FALSE,
  effective_from DATE,
  effective_until DATE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (date IS NOT NULL OR day_of_week IS NOT NULL)
  -- Note: No end_time > start_time check because availability can span midnight
);

-- Indexes for staff_availability
CREATE INDEX staff_availability_staff_idx ON staff_availability(staff_id);
CREATE INDEX staff_availability_org_idx ON staff_availability(org_id);
CREATE INDEX staff_availability_date_idx ON staff_availability(date);
CREATE INDEX staff_availability_dow_idx ON staff_availability(day_of_week) WHERE recurring = TRUE;
CREATE INDEX staff_availability_type_idx ON staff_availability(availability_type);

-- Trigger for staff_availability
CREATE TRIGGER update_staff_availability_updated_at
  BEFORE UPDATE ON staff_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 5: SCHEDULES (Shift Assignments)
-- ============================================================================

CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER DEFAULT 0,
  role_id UUID NOT NULL REFERENCES schedule_roles(id),
  status schedule_status DEFAULT 'scheduled',
  notes TEXT,
  period_id UUID REFERENCES schedule_periods(id) ON DELETE SET NULL,
  template_id UUID REFERENCES shift_templates(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Note: No end_time > start_time check because shifts can cross midnight
  CHECK (break_minutes >= 0)
);

-- Indexes for schedules
CREATE INDEX schedules_org_date_idx ON schedules(org_id, date);
CREATE INDEX schedules_attraction_date_idx ON schedules(attraction_id, date);
CREATE INDEX schedules_staff_date_idx ON schedules(staff_id, date);
CREATE INDEX schedules_status_idx ON schedules(status);
CREATE INDEX schedules_zone_idx ON schedules(zone_id, date);
CREATE INDEX schedules_role_idx ON schedules(role_id);
CREATE INDEX schedules_period_idx ON schedules(period_id);
CREATE INDEX schedules_unassigned_idx ON schedules(org_id, date) WHERE staff_id IS NULL;

-- Trigger for schedules
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 6: SHIFT_SWAPS
-- ============================================================================

CREATE TABLE shift_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  swap_type swap_type NOT NULL,
  target_staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  target_schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  reason TEXT,
  status swap_status DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for shift_swaps
CREATE INDEX shift_swaps_org_idx ON shift_swaps(org_id);
CREATE INDEX shift_swaps_schedule_idx ON shift_swaps(schedule_id);
CREATE INDEX shift_swaps_requester_idx ON shift_swaps(requested_by, status);
CREATE INDEX shift_swaps_pending_idx ON shift_swaps(status) WHERE status = 'pending';
CREATE INDEX shift_swaps_target_idx ON shift_swaps(target_staff_id) WHERE target_staff_id IS NOT NULL;

-- Trigger for shift_swaps
CREATE TRIGGER update_shift_swaps_updated_at
  BEFORE UPDATE ON shift_swaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 7: SCHEDULE_CONFLICTS
-- ============================================================================

CREATE TABLE schedule_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  conflict_type conflict_type NOT NULL,
  conflicting_schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  conflicting_availability_id UUID REFERENCES staff_availability(id) ON DELETE CASCADE,
  details JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for schedule_conflicts
CREATE INDEX schedule_conflicts_org_idx ON schedule_conflicts(org_id);
CREATE INDEX schedule_conflicts_staff_idx ON schedule_conflicts(staff_id);
CREATE INDEX schedule_conflicts_schedule_idx ON schedule_conflicts(schedule_id);
CREATE INDEX schedule_conflicts_unresolved_idx ON schedule_conflicts(org_id, resolved) WHERE resolved = FALSE;
CREATE INDEX schedule_conflicts_type_idx ON schedule_conflicts(conflict_type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE schedule_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_conflicts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SCHEDULE_ROLES RLS
-- ============================================================================

-- Anyone can view system default roles
CREATE POLICY "Anyone can view system schedule roles"
  ON schedule_roles FOR SELECT
  USING (org_id IS NULL);

-- Org members can view their custom roles
CREATE POLICY "Org members can view custom schedule roles"
  ON schedule_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = schedule_roles.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Managers can manage org-specific roles
CREATE POLICY "Managers can manage schedule roles"
  ON schedule_roles FOR ALL
  USING (
    org_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = schedule_roles.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- ============================================================================
-- SCHEDULE_PERIODS RLS
-- ============================================================================

CREATE POLICY "Org members can view schedule periods"
  ON schedule_periods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = schedule_periods.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage schedule periods"
  ON schedule_periods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = schedule_periods.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- ============================================================================
-- SHIFT_TEMPLATES RLS
-- ============================================================================

CREATE POLICY "Org members can view shift templates"
  ON shift_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = shift_templates.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage shift templates"
  ON shift_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = shift_templates.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- ============================================================================
-- STAFF_AVAILABILITY RLS
-- ============================================================================

-- Staff can view own availability
CREATE POLICY "Staff can view own availability"
  ON staff_availability FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- Staff can manage own availability
CREATE POLICY "Staff can manage own availability"
  ON staff_availability FOR ALL
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- Managers can view all org availability
CREATE POLICY "Managers can view org availability"
  ON staff_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = staff_availability.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager', 'hr')
        AND status = 'active'
    )
  );

-- Managers can manage org availability (approve time-off, etc.)
CREATE POLICY "Managers can manage org availability"
  ON staff_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = staff_availability.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager', 'hr')
        AND status = 'active'
    )
  );

-- ============================================================================
-- SCHEDULES RLS
-- ============================================================================

-- Staff can view own schedules
CREATE POLICY "Staff can view own schedules"
  ON schedules FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- Org members can view published schedules
CREATE POLICY "Org members can view published schedules"
  ON schedules FOR SELECT
  USING (
    status IN ('published', 'confirmed', 'checked_in', 'completed') AND
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = schedules.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Managers can view all org schedules
CREATE POLICY "Managers can view all schedules"
  ON schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = schedules.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager', 'hr')
        AND status = 'active'
    )
  );

-- Managers can manage schedules
CREATE POLICY "Managers can manage schedules"
  ON schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = schedules.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- Staff can update their own schedule (confirm, check-in)
CREATE POLICY "Staff can update own schedule status"
  ON schedules FOR UPDATE
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- SHIFT_SWAPS RLS
-- ============================================================================

-- Staff can view own swap requests
CREATE POLICY "Staff can view own swap requests"
  ON shift_swaps FOR SELECT
  USING (
    requested_by IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
    OR
    target_staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- Staff can create swap requests for own shifts
CREATE POLICY "Staff can create swap requests"
  ON shift_swaps FOR INSERT
  WITH CHECK (
    requested_by IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- Staff can cancel own swap requests
CREATE POLICY "Staff can cancel own swap requests"
  ON shift_swaps FOR UPDATE
  USING (
    requested_by IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
    AND status = 'pending'
  );

-- Managers can view all org swap requests
CREATE POLICY "Managers can view org swap requests"
  ON shift_swaps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = shift_swaps.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- Managers can manage swap requests
CREATE POLICY "Managers can manage swap requests"
  ON shift_swaps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = shift_swaps.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- ============================================================================
-- SCHEDULE_CONFLICTS RLS
-- ============================================================================

-- Managers can view conflicts
CREATE POLICY "Managers can view conflicts"
  ON schedule_conflicts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = schedule_conflicts.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- Managers can manage conflicts
CREATE POLICY "Managers can manage conflicts"
  ON schedule_conflicts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = schedule_conflicts.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check staff availability for a specific date/time
CREATE OR REPLACE FUNCTION check_staff_availability(
  p_staff_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS TABLE (
  is_available BOOLEAN,
  conflict_type TEXT,
  conflict_details TEXT
) AS $$
BEGIN
  -- Check for explicit unavailability
  IF EXISTS (
    SELECT 1 FROM staff_availability
    WHERE staff_id = p_staff_id
      AND availability_type IN ('unavailable', 'time_off_approved')
      AND (
        (date = p_date) OR
        (recurring = TRUE
         AND day_of_week = EXTRACT(DOW FROM p_date)::INTEGER
         AND (effective_from IS NULL OR effective_from <= p_date)
         AND (effective_until IS NULL OR effective_until >= p_date))
      )
      AND (start_time IS NULL OR (start_time < p_end_time AND end_time > p_start_time))
  ) THEN
    RETURN QUERY SELECT FALSE, 'unavailable'::TEXT, 'Staff marked as unavailable'::TEXT;
    RETURN;
  END IF;

  -- Check for pending time-off
  IF EXISTS (
    SELECT 1 FROM staff_availability
    WHERE staff_id = p_staff_id
      AND availability_type = 'time_off_pending'
      AND date = p_date
  ) THEN
    RETURN QUERY SELECT FALSE, 'time_off_pending'::TEXT, 'Staff has pending time-off request'::TEXT;
    RETURN;
  END IF;

  -- Check for existing schedules (double-booking)
  IF EXISTS (
    SELECT 1 FROM schedules
    WHERE staff_id = p_staff_id
      AND date = p_date
      AND status NOT IN ('canceled', 'no_show')
      AND start_time < p_end_time
      AND end_time > p_start_time
  ) THEN
    RETURN QUERY SELECT FALSE, 'double_booked'::TEXT, 'Staff already scheduled during this time'::TEXT;
    RETURN;
  END IF;

  -- Staff is available
  RETURN QUERY SELECT TRUE, NULL::TEXT, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get staff schedule for a date range
CREATE OR REPLACE FUNCTION get_staff_schedules(
  p_org_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_staff_id UUID DEFAULT NULL,
  p_attraction_id UUID DEFAULT NULL
)
RETURNS TABLE (
  schedule_id UUID,
  staff_id UUID,
  staff_name TEXT,
  attraction_id UUID,
  attraction_name TEXT,
  zone_id UUID,
  zone_name TEXT,
  role_id UUID,
  role_name TEXT,
  role_color VARCHAR(7),
  date DATE,
  start_time TIME,
  end_time TIME,
  status schedule_status,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.staff_id,
    COALESCE(p.display_name, p.first_name || ' ' || p.last_name) as staff_name,
    s.attraction_id,
    a.name as attraction_name,
    s.zone_id,
    z.name as zone_name,
    s.role_id,
    sr.name as role_name,
    sr.color as role_color,
    s.date,
    s.start_time,
    s.end_time,
    s.status,
    s.notes
  FROM schedules s
  LEFT JOIN staff_profiles sp ON sp.id = s.staff_id
  LEFT JOIN org_memberships om ON om.id = sp.id
  LEFT JOIN profiles p ON p.id = om.user_id
  LEFT JOIN attractions a ON a.id = s.attraction_id
  LEFT JOIN zones z ON z.id = s.zone_id
  LEFT JOIN schedule_roles sr ON sr.id = s.role_id
  WHERE s.org_id = p_org_id
    AND s.date BETWEEN p_start_date AND p_end_date
    AND (p_staff_id IS NULL OR s.staff_id = p_staff_id)
    AND (p_attraction_id IS NULL OR s.attraction_id = p_attraction_id)
  ORDER BY s.date, s.start_time, sr.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- NOTE: Seed data for scheduling is in seed.sql (runs after organizations exist)
