# F7: Staff Scheduling - ERD

## Overview

Staff scheduling system for managing shifts, availability, and assignments. Supports recurring shifts, shift swaps, and availability management.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       schedule_roles                             │
│                       (Lookup Table)                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id                       │
│ key             VARCHAR(50) NOT NULL                             │
│ name            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ category        VARCHAR(50)                                      │
│ icon            VARCHAR(50)                                      │
│ color           VARCHAR(7)                                       │
│ is_schedulable  BOOLEAN DEFAULT TRUE                             │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ sort_order      INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, key) -- NULL org_id = system default              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       staff_profiles                             │
│                         (from F4)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   schedules   │    │ availability  │    │shift_templates│
└───────────────┘    └───────────────┘    └───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          schedules                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ staff_id        UUID FK → staff_profiles.id NOT NULL             │
│ zone_id         UUID FK → attraction_zones.id                    │
│ date            DATE NOT NULL                                    │
│ start_time      TIME NOT NULL                                    │
│ end_time        TIME NOT NULL                                    │
│ break_minutes   INTEGER DEFAULT 0                                │
│ role_id         UUID FK → schedule_roles.id NOT NULL             │
│ status          schedule_status DEFAULT 'scheduled'              │
│ notes           TEXT                                             │
│ created_by      UUID FK → profiles.id NOT NULL                   │
│ published_at    TIMESTAMPTZ                                      │
│ confirmed_at    TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ CHECK (end_time > start_time)                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     staff_availability                           │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ staff_id        UUID FK → staff_profiles.id NOT NULL             │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ date            DATE                                             │
│ day_of_week     INTEGER (0-6)                                    │
│ start_time      TIME                                             │
│ end_time        TIME                                             │
│ availability_type availability_type NOT NULL                     │
│ reason          TEXT                                             │
│ recurring       BOOLEAN DEFAULT FALSE                            │
│ effective_from  DATE                                             │
│ effective_until DATE                                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ CHECK (date IS NOT NULL OR day_of_week IS NOT NULL)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      shift_templates                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ name            VARCHAR(100) NOT NULL                            │
│ day_of_week     INTEGER NOT NULL (0-6)                           │
│ start_time      TIME NOT NULL                                    │
│ end_time        TIME NOT NULL                                    │
│ role_id         UUID FK → schedule_roles.id NOT NULL             │
│ zone_id         UUID FK → attraction_zones.id                    │
│ min_staff       INTEGER DEFAULT 1                                │
│ max_staff       INTEGER                                          │
│ required_skills staff_skill[]                                    │
│ color           VARCHAR(7)                                       │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       shift_swaps                                │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ schedule_id     UUID FK → schedules.id NOT NULL                  │
│ requested_by    UUID FK → staff_profiles.id NOT NULL             │
│ swap_type       swap_type NOT NULL                               │
│ target_staff_id UUID FK → staff_profiles.id                      │
│ target_schedule_id UUID FK → schedules.id                        │
│ reason          TEXT                                             │
│ status          swap_status DEFAULT 'pending'                    │
│ approved_by     UUID FK → profiles.id                            │
│ approved_at     TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     schedule_periods                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id                          │
│ name            VARCHAR(100) NOT NULL                            │
│ start_date      DATE NOT NULL                                    │
│ end_date        DATE NOT NULL                                    │
│ status          period_status DEFAULT 'draft'                    │
│ published_at    TIMESTAMPTZ                                      │
│ published_by    UUID FK → profiles.id                            │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    schedule_conflicts                            │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ staff_id        UUID FK → staff_profiles.id NOT NULL             │
│ schedule_id     UUID FK → schedules.id NOT NULL                  │
│ conflict_type   conflict_type NOT NULL                           │
│ conflicting_schedule_id UUID FK → schedules.id                   │
│ conflicting_availability_id UUID FK → staff_availability.id      │
│ resolved        BOOLEAN DEFAULT FALSE                            │
│ resolved_by     UUID FK → profiles.id                            │
│ resolved_at     TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
```

## Lookup Tables

### schedule_roles

Extensible role types for scheduling. Supports both system defaults and org-specific custom roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Role ID |
| org_id | UUID | FK | Org (NULL = system default) |
| key | VARCHAR(50) | NOT NULL | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | | Role description |
| category | VARCHAR(50) | | Group (performance, support, management) |
| icon | VARCHAR(50) | | Icon identifier |
| color | VARCHAR(7) | | Hex color code |
| is_schedulable | BOOLEAN | DEFAULT TRUE | Can be assigned to shifts |
| is_active | BOOLEAN | DEFAULT TRUE | Active for selection |
| sort_order | INTEGER | DEFAULT 0 | Display order |

**Seed Data:**
```sql
INSERT INTO schedule_roles (org_id, key, name, category, icon, color) VALUES
  (NULL, 'actor', 'Actor', 'performance', 'theater-masks', '#9333EA'),
  (NULL, 'scare_actor', 'Scare Actor', 'performance', 'ghost', '#DC2626'),
  (NULL, 'guide', 'Guide', 'performance', 'map', '#2563EB'),
  (NULL, 'queue_entertainer', 'Queue Entertainer', 'performance', 'music', '#7C3AED'),
  (NULL, 'makeup_artist', 'Makeup Artist', 'support', 'palette', '#EC4899'),
  (NULL, 'costume_assistant', 'Costume Assistant', 'support', 'shirt', '#F59E0B'),
  (NULL, 'tech_crew', 'Tech Crew', 'support', 'wrench', '#6B7280'),
  (NULL, 'security', 'Security', 'operations', 'shield', '#1F2937'),
  (NULL, 'first_aid', 'First Aid', 'operations', 'heart-pulse', '#EF4444'),
  (NULL, 'box_office', 'Box Office', 'operations', 'ticket', '#10B981'),
  (NULL, 'parking', 'Parking', 'operations', 'car', '#6366F1'),
  (NULL, 'manager', 'Manager', 'management', 'user-cog', '#0891B2'),
  (NULL, 'supervisor', 'Supervisor', 'management', 'user-check', '#0D9488'),
  (NULL, 'floater', 'Floater', 'operations', 'shuffle', '#8B5CF6');
```

## Enums

```sql
-- schedule_role removed - now uses schedule_roles lookup table

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
```

## Tables

### schedules

Individual shift assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Schedule ID |
| org_id | UUID | FK, NOT NULL | Organization |
| attraction_id | UUID | FK, NOT NULL | Attraction venue |
| staff_id | UUID | FK, NOT NULL | Assigned staff |
| zone_id | UUID | FK | Assigned zone |
| date | DATE | NOT NULL | Shift date |
| start_time | TIME | NOT NULL | Shift start |
| end_time | TIME | NOT NULL | Shift end |
| break_minutes | INTEGER | DEFAULT 0 | Scheduled break |
| role_id | UUID | FK, NOT NULL | Role for this shift |
| status | schedule_status | DEFAULT 'scheduled' | Shift status |
| notes | TEXT | | Shift notes |
| created_by | UUID | FK, NOT NULL | Who created |
| published_at | TIMESTAMPTZ | | When published |
| confirmed_at | TIMESTAMPTZ | | When staff confirmed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### staff_availability

Staff availability preferences and time-off.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Availability ID |
| staff_id | UUID | FK, NOT NULL | Staff member |
| org_id | UUID | FK, NOT NULL | Organization |
| date | DATE | | Specific date |
| day_of_week | INTEGER | 0-6 | Recurring day |
| start_time | TIME | | Available from |
| end_time | TIME | | Available until |
| availability_type | availability_type | NOT NULL | Type |
| reason | TEXT | | Reason for unavailability |
| recurring | BOOLEAN | DEFAULT FALSE | Is recurring |
| effective_from | DATE | | Recurring start |
| effective_until | DATE | | Recurring end |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### shift_templates

Reusable shift definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Template ID |
| org_id | UUID | FK, NOT NULL | Organization |
| attraction_id | UUID | FK, NOT NULL | Attraction venue |
| name | VARCHAR(100) | NOT NULL | Template name |
| day_of_week | INTEGER | NOT NULL, 0-6 | Day of week |
| start_time | TIME | NOT NULL | Start time |
| end_time | TIME | NOT NULL | End time |
| role_id | UUID | FK, NOT NULL | Role |
| zone_id | UUID | FK | Zone |
| min_staff | INTEGER | DEFAULT 1 | Minimum staff |
| max_staff | INTEGER | | Maximum staff |
| required_skills | staff_skill[] | | Required skills |
| color | VARCHAR(7) | | UI color |
| is_active | BOOLEAN | DEFAULT TRUE | Active flag |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### shift_swaps

Shift swap/drop requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Swap ID |
| org_id | UUID | FK, NOT NULL | Organization |
| schedule_id | UUID | FK, NOT NULL | Original shift |
| requested_by | UUID | FK, NOT NULL | Requester |
| swap_type | swap_type | NOT NULL | Swap type |
| target_staff_id | UUID | FK | Trade partner |
| target_schedule_id | UUID | FK | Partner's shift |
| reason | TEXT | | Request reason |
| status | swap_status | DEFAULT 'pending' | Request status |
| approved_by | UUID | FK | Approver |
| approved_at | TIMESTAMPTZ | | Approval time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

## Indexes

```sql
-- Schedules
CREATE INDEX schedules_org_date_idx ON schedules(org_id, date);
CREATE INDEX schedules_attraction_date_idx ON schedules(attraction_id, date);
CREATE INDEX schedules_staff_date_idx ON schedules(staff_id, date);
CREATE INDEX schedules_status_idx ON schedules(status);
CREATE INDEX schedules_zone_idx ON schedules(zone_id, date);

-- Availability
CREATE INDEX availability_staff_idx ON staff_availability(staff_id);
CREATE INDEX availability_date_idx ON staff_availability(date);
CREATE INDEX availability_dow_idx ON staff_availability(day_of_week)
  WHERE recurring = TRUE;

-- Templates
CREATE INDEX templates_attraction_idx ON shift_templates(attraction_id)
  WHERE is_active = TRUE;
CREATE INDEX templates_dow_idx ON shift_templates(attraction_id, day_of_week);

-- Swaps
CREATE INDEX swaps_staff_idx ON shift_swaps(requested_by, status);
CREATE INDEX swaps_pending_idx ON shift_swaps(status)
  WHERE status = 'pending';

-- Conflicts
CREATE INDEX conflicts_unresolved_idx ON schedule_conflicts(org_id, resolved)
  WHERE resolved = FALSE;
```

## RLS Policies

```sql
-- Schedules: Staff can view their own and org-wide if manager
CREATE POLICY "Staff can view own schedules"
  ON schedules FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = schedules.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager', 'hr')
        AND status = 'active'
    )
  );

-- Managers can create/update schedules
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

-- Staff can manage own availability
CREATE POLICY "Staff can manage own availability"
  ON staff_availability FOR ALL
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- Staff can create swap requests for own shifts
CREATE POLICY "Staff can request swaps"
  ON shift_swaps FOR INSERT
  WITH CHECK (
    requested_by IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );
```

## Functions

### Check Availability

```sql
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
  -- Check for unavailability
  IF EXISTS (
    SELECT 1 FROM staff_availability
    WHERE staff_id = p_staff_id
      AND availability_type IN ('unavailable', 'time_off_approved')
      AND (
        (date = p_date) OR
        (recurring = TRUE AND day_of_week = EXTRACT(DOW FROM p_date)
         AND (effective_from IS NULL OR effective_from <= p_date)
         AND (effective_until IS NULL OR effective_until >= p_date))
      )
      AND (start_time IS NULL OR (start_time < p_end_time AND end_time > p_start_time))
  ) THEN
    RETURN QUERY SELECT FALSE, 'unavailable', 'Staff marked as unavailable';
    RETURN;
  END IF;

  -- Check for existing schedules
  IF EXISTS (
    SELECT 1 FROM schedules
    WHERE staff_id = p_staff_id
      AND date = p_date
      AND status NOT IN ('canceled', 'no_show')
      AND start_time < p_end_time
      AND end_time > p_start_time
  ) THEN
    RETURN QUERY SELECT FALSE, 'double_booked', 'Staff already scheduled';
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, NULL::TEXT, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
```

### Auto-Generate from Templates

```sql
CREATE OR REPLACE FUNCTION generate_schedules_from_templates(
  p_attraction_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_template RECORD;
  v_date DATE;
BEGIN
  FOR v_template IN
    SELECT * FROM shift_templates
    WHERE attraction_id = p_attraction_id AND is_active = TRUE
  LOOP
    v_date := p_start_date;
    WHILE v_date <= p_end_date LOOP
      IF EXTRACT(DOW FROM v_date) = v_template.day_of_week THEN
        -- Create empty shift slots (to be filled)
        FOR i IN 1..v_template.min_staff LOOP
          INSERT INTO schedules (
            org_id, attraction_id, date, start_time, end_time,
            role, zone_id, status, staff_id, created_by
          )
          SELECT
            v_template.org_id, v_template.attraction_id, v_date,
            v_template.start_time, v_template.end_time,
            v_template.role, v_template.zone_id, 'draft',
            NULL, auth.uid()
          WHERE NOT EXISTS (
            SELECT 1 FROM schedules
            WHERE attraction_id = v_template.attraction_id
              AND date = v_date
              AND start_time = v_template.start_time
              AND role = v_template.role
          );
          v_count := v_count + 1;
        END LOOP;
      END IF;
      v_date := v_date + INTERVAL '1 day';
    END LOOP;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
```

## Business Rules

1. **Conflict Detection**: System detects scheduling conflicts automatically.

2. **Availability Priority**: Time-off requests take precedence over recurring availability.

3. **Minimum Break**: Configurable minimum break between shifts (default 8 hours).

4. **Maximum Hours**: Weekly hour limits for overtime prevention.

5. **Swap Approval**: Swaps require manager approval by default.

6. **Publish Lock**: Published schedules require approval to modify.

7. **Confirmation Window**: Staff must confirm within X hours of publishing.

## Dependencies

- **F3 Attractions**: attraction_id and zone references
- **F4 Staff**: staff_profiles references

## Migration Order

1. Create enums (schedule_status, availability_type, swap_type, swap_status, period_status, conflict_type)
2. Create schedule_roles lookup table with seed data
3. Create schedule_periods table
3. Create shift_templates table
4. Create staff_availability table
5. Create schedules table
6. Create shift_swaps table
7. Create schedule_conflicts table
8. Create indexes
9. Create RLS policies
10. Create helper functions
