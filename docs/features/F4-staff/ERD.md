# F4: Staff & Roles - ERD

## Overview

Staff management extends org_memberships with attraction-specific assignments, skills tracking, and certifications. Staff can be assigned to specific attractions and zones within an organization.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        skill_types                               │
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
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ sort_order      INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, key) -- NULL org_id = system default              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    certification_types                           │
│                       (Lookup Table)                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id                       │
│ key             VARCHAR(50) NOT NULL                             │
│ name            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ issuing_authority VARCHAR(200)                                   │
│ validity_months INTEGER                                          │
│ is_required     BOOLEAN DEFAULT FALSE                            │
│ icon            VARCHAR(50)                                      │
│ color           VARCHAR(7)                                       │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ sort_order      INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, key) -- NULL org_id = system default              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      document_types                              │
│                       (Lookup Table)                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id                       │
│ key             VARCHAR(50) NOT NULL                             │
│ name            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ category        VARCHAR(50)                                      │
│ is_required     BOOLEAN DEFAULT FALSE                            │
│ requires_expiry BOOLEAN DEFAULT FALSE                            │
│ icon            VARCHAR(50)                                      │
│ color           VARCHAR(7)                                       │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ sort_order      INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, key) -- NULL org_id = system default              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       org_memberships                            │
│                          (from F2)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       staff_profiles                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK FK → org_memberships.id                  │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ employee_id     VARCHAR(50)                                      │
│ emergency_contact_name VARCHAR(200)                              │
│ emergency_contact_phone VARCHAR(20)                              │
│ emergency_contact_relation VARCHAR(50)                           │
│ date_of_birth   DATE                                             │
│ shirt_size      VARCHAR(10)                                      │
│ notes           TEXT                                             │
│ hire_date       DATE                                             │
│ termination_date DATE                                            │
│ hourly_rate     INTEGER                                          │
│ employment_type employment_type DEFAULT 'seasonal'               │
│ status          staff_status DEFAULT 'active'                    │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ staff_attraction│ │  staff_skills   │ │staff_certifica- │
│  _assignments   │ │                 │ │     tions       │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ id        PK    │ │ id        PK    │ │ id        PK    │
│ staff_id  FK    │ │ staff_id  FK    │ │ staff_id  FK    │
│ attraction_id FK│ │ skill_type_id FK│ │ cert_type_id FK │
│ is_primary BOOL │ │ level     INT   │ │ issued_at DATE  │
│ zones     UUID[]│ │ endorsed_by FK  │ │ issued_at DATE  │
│ created_at      │ │ created_at      │ │ expires_at DATE │
│                 │ │                 │ │ verified_by FK  │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      staff_documents                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ staff_id        UUID FK → staff_profiles.id NOT NULL             │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ document_type_id UUID FK → document_types.id NOT NULL            │
│ name            VARCHAR(200) NOT NULL                            │
│ file_url        TEXT NOT NULL                                    │
│ file_size       INTEGER                                          │
│ mime_type       VARCHAR(100)                                     │
│ uploaded_by     UUID FK → profiles.id NOT NULL                   │
│ expires_at      DATE                                             │
│ notes           TEXT                                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       staff_waivers                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ staff_id        UUID FK → staff_profiles.id NOT NULL             │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ waiver_type     VARCHAR(100) NOT NULL                            │
│ signed_at       TIMESTAMPTZ NOT NULL                             │
│ ip_address      INET                                             │
│ signature_data  TEXT                                             │
│ waiver_version  VARCHAR(50)                                      │
│ expires_at      DATE                                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(staff_id, waiver_type, waiver_version)                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      staff_time_entries                          │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ staff_id        UUID FK → staff_profiles.id NOT NULL             │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id                         │
│ clock_in        TIMESTAMPTZ NOT NULL                             │
│ clock_out       TIMESTAMPTZ                                      │
│ break_minutes   INTEGER DEFAULT 0                                │
│ notes           TEXT                                             │
│ approved_by     UUID FK → profiles.id                            │
│ approved_at     TIMESTAMPTZ                                      │
│ status          time_entry_status DEFAULT 'pending'              │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
```

## Lookup Tables

### skill_types

Extensible skill types for staff. Supports both system defaults and org-specific custom skills.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Skill type ID |
| org_id | UUID | FK | Org (NULL = system default) |
| key | VARCHAR(50) | NOT NULL | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | | Skill description |
| category | VARCHAR(50) | | Group (performance, technical, operations) |
| icon | VARCHAR(50) | | Icon identifier |
| color | VARCHAR(7) | | Hex color code |
| is_active | BOOLEAN | DEFAULT TRUE | Active for selection |
| sort_order | INTEGER | DEFAULT 0 | Display order |

**Seed Data:**
```sql
INSERT INTO skill_types (org_id, key, name, category, icon, color) VALUES
  (NULL, 'acting', 'Acting', 'performance', 'theater-masks', '#9333EA'),
  (NULL, 'makeup', 'Makeup', 'performance', 'palette', '#EC4899'),
  (NULL, 'sfx_makeup', 'SFX Makeup', 'performance', 'wand', '#DC2626'),
  (NULL, 'costume', 'Costume', 'performance', 'shirt', '#F59E0B'),
  (NULL, 'props', 'Props', 'technical', 'box', '#8B5CF6'),
  (NULL, 'lighting', 'Lighting', 'technical', 'lightbulb', '#FBBF24'),
  (NULL, 'sound', 'Sound', 'technical', 'volume-2', '#3B82F6'),
  (NULL, 'fog_effects', 'Fog Effects', 'technical', 'cloud', '#6B7280'),
  (NULL, 'animatronics', 'Animatronics', 'technical', 'bot', '#14B8A6'),
  (NULL, 'crowd_control', 'Crowd Control', 'operations', 'users', '#0891B2'),
  (NULL, 'first_aid', 'First Aid', 'operations', 'heart-pulse', '#EF4444'),
  (NULL, 'customer_service', 'Customer Service', 'operations', 'smile', '#10B981'),
  (NULL, 'cash_handling', 'Cash Handling', 'operations', 'banknote', '#22C55E'),
  (NULL, 'photography', 'Photography', 'creative', 'camera', '#6366F1'),
  (NULL, 'social_media', 'Social Media', 'creative', 'share-2', '#E11D48');
```

### certification_types

Extensible certification types. Supports both system defaults and org-specific custom certifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Certification type ID |
| org_id | UUID | FK | Org (NULL = system default) |
| key | VARCHAR(50) | NOT NULL | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | | Certification description |
| issuing_authority | VARCHAR(200) | | Who issues this cert |
| validity_months | INTEGER | | How long cert is valid |
| is_required | BOOLEAN | DEFAULT FALSE | Required for all staff |
| icon | VARCHAR(50) | | Icon identifier |
| color | VARCHAR(7) | | Hex color code |
| is_active | BOOLEAN | DEFAULT TRUE | Active for selection |
| sort_order | INTEGER | DEFAULT 0 | Display order |

**Seed Data:**
```sql
INSERT INTO certification_types (org_id, key, name, issuing_authority, validity_months, icon, color) VALUES
  (NULL, 'first_aid', 'First Aid', 'American Red Cross', 24, 'heart-pulse', '#EF4444'),
  (NULL, 'cpr', 'CPR', 'American Red Cross', 24, 'activity', '#DC2626'),
  (NULL, 'aed', 'AED', 'American Red Cross', 24, 'zap', '#F97316'),
  (NULL, 'food_handler', 'Food Handler', 'State/Local Health Dept', 36, 'utensils', '#22C55E'),
  (NULL, 'alcohol_server', 'Alcohol Server', 'State ABC', 24, 'wine', '#8B5CF6'),
  (NULL, 'crowd_management', 'Crowd Management', 'FEMA/Private', 36, 'users', '#0891B2'),
  (NULL, 'fire_safety', 'Fire Safety', 'OSHA/State', 12, 'flame', '#EF4444'),
  (NULL, 'osha_10', 'OSHA 10', 'OSHA', NULL, 'hard-hat', '#F59E0B'),
  (NULL, 'background_check', 'Background Check', 'Employer', 12, 'shield-check', '#6B7280');
```

### document_types

Extensible document types for staff HR records. Supports both system defaults and org/country-specific documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Document type ID |
| org_id | UUID | FK | Org (NULL = system default) |
| key | VARCHAR(50) | NOT NULL | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | | Document description |
| category | VARCHAR(50) | | Group (tax, identity, payroll, compliance) |
| is_required | BOOLEAN | DEFAULT FALSE | Required for all staff |
| requires_expiry | BOOLEAN | DEFAULT FALSE | Has expiration date |
| icon | VARCHAR(50) | | Icon identifier |
| color | VARCHAR(7) | | Hex color code |
| is_active | BOOLEAN | DEFAULT TRUE | Active for selection |
| sort_order | INTEGER | DEFAULT 0 | Display order |

**Seed Data:**
```sql
INSERT INTO document_types (org_id, key, name, category, is_required, icon, color) VALUES
  (NULL, 'w4', 'W-4 Tax Withholding', 'tax', TRUE, 'file-text', '#3B82F6'),
  (NULL, 'i9', 'I-9 Employment Eligibility', 'identity', TRUE, 'user-check', '#10B981'),
  (NULL, 'direct_deposit', 'Direct Deposit Form', 'payroll', FALSE, 'banknote', '#22C55E'),
  (NULL, 'id_copy', 'ID Copy', 'identity', FALSE, 'credit-card', '#6B7280'),
  (NULL, 'signed_waiver', 'Signed Waiver', 'compliance', FALSE, 'file-signature', '#8B5CF6'),
  (NULL, 'photo', 'Staff Photo', 'identity', FALSE, 'camera', '#EC4899'),
  (NULL, 'other', 'Other Document', 'other', FALSE, 'file', '#6B7280');
```

## Enums

```sql
CREATE TYPE employment_type AS ENUM (
  'full_time',
  'part_time',
  'seasonal',
  'volunteer',
  'contractor'
);

CREATE TYPE staff_status AS ENUM (
  'pending',       -- Invited but not onboarded
  'active',        -- Currently working
  'inactive',      -- Temporarily unavailable
  'on_leave',      -- Extended leave
  'terminated'     -- No longer employed
);

-- staff_skill removed - now uses skill_types lookup table
-- certification_type removed - now uses certification_types lookup table
-- document_type removed - now uses document_types lookup table

CREATE TYPE time_entry_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'disputed'
);
```

## Tables

### staff_profiles

Extended profile for staff members with HR data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → org_memberships.id | Links to membership |
| org_id | UUID | FK, NOT NULL | Organization reference |
| employee_id | VARCHAR(50) | | Internal employee number |
| emergency_contact_name | VARCHAR(200) | | Emergency contact |
| emergency_contact_phone | VARCHAR(20) | | Emergency phone |
| emergency_contact_relation | VARCHAR(50) | | Relationship |
| date_of_birth | DATE | | DOB for age verification |
| shirt_size | VARCHAR(10) | | Uniform size |
| notes | TEXT | | HR notes |
| hire_date | DATE | | Start date |
| termination_date | DATE | | End date if terminated |
| hourly_rate | INTEGER | | Pay rate in cents |
| employment_type | employment_type | DEFAULT 'seasonal' | Employment type |
| status | staff_status | DEFAULT 'active' | Current status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### staff_attraction_assignments

Links staff to specific attractions they work at.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Assignment ID |
| staff_id | UUID | FK, NOT NULL | Staff reference |
| attraction_id | UUID | FK, NOT NULL | Attraction reference |
| is_primary | BOOLEAN | DEFAULT FALSE | Primary attraction |
| zones | UUID[] | | Assigned zones |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

### staff_skills

Skills and proficiency levels.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Skill ID |
| staff_id | UUID | FK, NOT NULL | Staff reference |
| skill_type_id | UUID | FK, NOT NULL | Skill type reference |
| level | INTEGER | CHECK 1-5 | Proficiency level |
| endorsed_by | UUID | FK | Who endorsed this skill |
| notes | TEXT | | Additional notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

### staff_certifications

Required certifications and their status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Certification ID |
| staff_id | UUID | FK, NOT NULL | Staff reference |
| cert_type_id | UUID | FK, NOT NULL | Certification type reference |
| issued_at | DATE | NOT NULL | Issue date |
| expires_at | DATE | | Expiration date |
| certificate_number | VARCHAR(100) | | Certificate ID |
| verified_by | UUID | FK | Who verified |
| verified_at | TIMESTAMPTZ | | Verification time |
| document_url | TEXT | | Certificate file |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

### staff_time_entries

Time tracking for payroll.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Entry ID |
| staff_id | UUID | FK, NOT NULL | Staff reference |
| org_id | UUID | FK, NOT NULL | Organization |
| attraction_id | UUID | FK | Which attraction |
| clock_in | TIMESTAMPTZ | NOT NULL | Start time |
| clock_out | TIMESTAMPTZ | | End time |
| break_minutes | INTEGER | DEFAULT 0 | Break time |
| notes | TEXT | | Entry notes |
| approved_by | UUID | FK | Approver |
| approved_at | TIMESTAMPTZ | | Approval time |
| status | time_entry_status | DEFAULT 'pending' | Approval status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

## Indexes

```sql
-- Staff profiles
CREATE INDEX staff_profiles_org_idx ON staff_profiles(org_id);
CREATE INDEX staff_profiles_status_idx ON staff_profiles(status);
CREATE INDEX staff_profiles_employee_id_idx ON staff_profiles(org_id, employee_id);

-- Attraction assignments
CREATE UNIQUE INDEX staff_attraction_assignments_unique_idx
  ON staff_attraction_assignments(staff_id, attraction_id);
CREATE INDEX staff_attraction_assignments_attraction_idx ON staff_attraction_assignments(attraction_id);

-- Skills
CREATE UNIQUE INDEX staff_skills_unique_idx ON staff_skills(staff_id, skill_type_id);
CREATE INDEX staff_skills_type_idx ON staff_skills(skill_type_id);

-- Certifications
CREATE INDEX staff_certs_expires_idx ON staff_certifications(expires_at);
CREATE INDEX staff_certs_type_idx ON staff_certifications(cert_type_id);

-- Time entries
CREATE INDEX staff_time_org_date_idx ON staff_time_entries(org_id, clock_in);
CREATE INDEX staff_time_staff_date_idx ON staff_time_entries(staff_id, clock_in);
CREATE INDEX staff_time_status_idx ON staff_time_entries(status);
```

## RLS Policies

```sql
-- Staff can view own profile
CREATE POLICY "Staff can view own profile"
  ON staff_profiles FOR SELECT
  USING (
    id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- HR/Managers can view org staff
CREATE POLICY "HR can view org staff"
  ON staff_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = staff_profiles.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager', 'hr')
        AND status = 'active'
    )
  );

-- HR/Managers can manage org staff
CREATE POLICY "HR can manage org staff"
  ON staff_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = staff_profiles.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager', 'hr')
        AND status = 'active'
    )
  );

-- Time entries: Staff can view own
CREATE POLICY "Staff can view own time entries"
  ON staff_time_entries FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- Staff can create own time entries
CREATE POLICY "Staff can clock in/out"
  ON staff_time_entries FOR INSERT
  WITH CHECK (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );
```

## Computed Fields

### Available Staff for Shift

```sql
CREATE OR REPLACE FUNCTION get_available_staff(
  p_attraction_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS TABLE (
  staff_id UUID,
  user_name TEXT,
  skills staff_skill[],
  has_conflicts BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id,
    p.first_name || ' ' || p.last_name,
    ARRAY_AGG(DISTINCT ss.skill),
    EXISTS (
      SELECT 1 FROM schedules s
      WHERE s.staff_id = sp.id
        AND s.date = p_date
        AND s.start_time < p_end_time
        AND s.end_time > p_start_time
    )
  FROM staff_profiles sp
  JOIN org_memberships om ON om.id = sp.id
  JOIN profiles p ON p.id = om.user_id
  JOIN staff_attraction_assignments saa ON saa.staff_id = sp.id
  LEFT JOIN staff_skills ss ON ss.staff_id = sp.id
  WHERE saa.attraction_id = p_attraction_id
    AND sp.status = 'active'
    AND om.status = 'active'
  GROUP BY sp.id, p.first_name, p.last_name;
END;
$$ LANGUAGE plpgsql;
```

## Business Rules

1. **Membership Required**: staff_profiles.id must reference an existing org_membership.

2. **Status Sync**: When org_membership.status changes, staff_profile.status should update.

3. **Certification Expiry**: Expired certifications should trigger notifications.

4. **Primary Attraction**: Each staff should have at most one primary attraction assignment.

5. **Time Entry Rules**:
   - Cannot clock in if already clocked in
   - Cannot have overlapping time entries
   - Must clock out before creating new entry

6. **Termination**: Setting termination_date should update status to 'terminated'.

## Dependencies

- **F2 Organizations**: org_id references
- **F3 Attractions**: attraction_id and zone references

## Migration Order

1. Create enums (employment_type, staff_status, time_entry_status)
2. Create skill_types lookup table with seed data
3. Create certification_types lookup table with seed data
4. Create document_types lookup table with seed data
5. Create staff_profiles table
3. Create staff_attraction_assignments table
4. Create staff_skills table
5. Create staff_certifications table
6. Create staff_documents table
7. Create staff_waivers table
8. Create staff_time_entries table
9. Create indexes
10. Create RLS policies
11. Create helper functions
