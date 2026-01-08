# F3: Attractions - ERD

## Overview

Attractions are the individual venues owned by organizations. Each organization can have multiple attractions. Attractions are the operational unit for ticketing, scheduling, and check-in.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      attraction_types                            │
│                      (Lookup Table)                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ key             VARCHAR(50) UNIQUE NOT NULL                      │
│ name            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ category        VARCHAR(50)                                      │
│ icon            VARCHAR(50)                                      │
│ color           VARCHAR(7)                                       │
│ default_settings JSONB DEFAULT '{}'                              │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ sort_order      INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       amenity_types                              │
│                      (Lookup Table)                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ key             VARCHAR(50) UNIQUE NOT NULL                      │
│ name            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ icon            VARCHAR(50)                                      │
│ category        VARCHAR(50)                                      │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ sort_order      INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        organizations                             │
│                          (from F2)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         attractions                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ name            VARCHAR(200) NOT NULL                            │
│ slug            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ type_id         UUID FK → attraction_types.id NOT NULL           │
│ logo_url        TEXT                                             │
│ cover_image_url TEXT                                             │
│ website         VARCHAR(255)                                     │
│ email           VARCHAR(255)                                     │
│ phone           VARCHAR(20)                                      │
│ address_line1   VARCHAR(255)                                     │
│ address_line2   VARCHAR(255)                                     │
│ city            VARCHAR(100)                                     │
│ state           VARCHAR(50)                                      │
│ postal_code     VARCHAR(20)                                      │
│ country         VARCHAR(2) DEFAULT 'US'                          │
│ latitude        DECIMAL(10, 8)                                   │
│ longitude       DECIMAL(11, 8)                                   │
│ timezone        VARCHAR(50)                                      │
│ capacity        INTEGER                                          │
│ min_age         INTEGER                                          │
│ intensity_level INTEGER CHECK (1-5)                              │
│ duration_minutes INTEGER                                         │
│ status          attraction_status DEFAULT 'draft'                │
│ settings        JSONB DEFAULT '{}'                               │
│ seo_metadata    JSONB DEFAULT '{}'                               │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, slug)                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          seasons                                 │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ name            VARCHAR(100) NOT NULL                            │
│ year            INTEGER NOT NULL                                 │
│ start_date      DATE NOT NULL                                    │
│ end_date        DATE NOT NULL                                    │
│ status          season_status DEFAULT 'upcoming'                 │
│ settings        JSONB DEFAULT '{}'                               │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(attraction_id, year, name)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       operating_hours                            │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ season_id       UUID FK → seasons.id                             │
│ date            DATE                                             │
│ day_of_week     INTEGER (0-6, NULL if specific date)             │
│ open_time       TIME NOT NULL                                    │
│ close_time      TIME NOT NULL                                    │
│ is_closed       BOOLEAN DEFAULT FALSE                            │
│ notes           VARCHAR(255)                                     │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ CHECK (date IS NOT NULL OR day_of_week IS NOT NULL)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      attraction_images                           │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ url             TEXT NOT NULL                                    │
│ alt_text        VARCHAR(255)                                     │
│ sort_order      INTEGER DEFAULT 0                                │
│ is_featured     BOOLEAN DEFAULT FALSE                            │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     attraction_amenities                         │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ amenity_type_id UUID FK → amenity_types.id NOT NULL              │
│ description     VARCHAR(255)                                     │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(attraction_id, amenity_type_id)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           zones                                  │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ name            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ capacity        INTEGER                                          │
│ sort_order      INTEGER DEFAULT 0                                │
│ color           VARCHAR(7)                                       │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(attraction_id, name)                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

Status enums remain as database enums since they represent fixed workflow states:

```sql
CREATE TYPE attraction_status AS ENUM (
  'draft',        -- Being set up
  'published',    -- Visible but not selling
  'active',       -- Selling tickets
  'paused',       -- Temporarily stopped
  'archived'      -- Season ended
);

CREATE TYPE season_status AS ENUM (
  'upcoming',
  'active',
  'completed'
);
```

## Lookup Tables

Dynamic types stored in database tables for runtime customization:

### attraction_types

Platform-managed attraction categories. Can be extended via admin UI.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| key | VARCHAR(50) | Unique identifier (e.g., 'escape_room') |
| name | VARCHAR(100) | Display name (e.g., 'Escape Room') |
| description | TEXT | Category description |
| category | VARCHAR(50) | Grouping (indoor, outdoor, hybrid) |
| icon | VARCHAR(50) | Icon name for UI |
| color | VARCHAR(7) | Hex color for UI |
| default_settings | JSONB | Default settings for this type |
| is_active | BOOLEAN | Whether type is available |
| sort_order | INTEGER | Display order |

**Seed Data:**
```sql
INSERT INTO attraction_types (key, name, category, icon) VALUES
  ('haunted_house', 'Haunted House', 'indoor', 'ghost'),
  ('haunted_trail', 'Haunted Trail', 'outdoor', 'tree'),
  ('escape_room', 'Escape Room', 'indoor', 'key'),
  ('corn_maze', 'Corn Maze', 'outdoor', 'wheat'),
  ('hayride', 'Haunted Hayride', 'outdoor', 'tractor'),
  ('immersive_experience', 'Immersive Experience', 'indoor', 'theater'),
  ('walkthrough', 'Walkthrough Attraction', 'indoor', 'footprints'),
  ('dark_ride', 'Dark Ride', 'indoor', 'car'),
  ('zombie_paintball', 'Zombie Paintball', 'outdoor', 'target'),
  ('tour', 'Guided Tour', 'hybrid', 'map'),
  ('other', 'Other', 'hybrid', 'help-circle');
```

### amenity_types

Platform-managed amenity options. Can be extended via admin UI.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| key | VARCHAR(50) | Unique identifier (e.g., 'parking') |
| name | VARCHAR(100) | Display name (e.g., 'Free Parking') |
| description | TEXT | Amenity description |
| icon | VARCHAR(50) | Icon name for UI |
| category | VARCHAR(50) | Grouping (facilities, accessibility, services) |
| is_active | BOOLEAN | Whether amenity is available |
| sort_order | INTEGER | Display order |

**Seed Data:**
```sql
INSERT INTO amenity_types (key, name, category, icon) VALUES
  ('parking_free', 'Free Parking', 'facilities', 'car'),
  ('parking_paid', 'Paid Parking', 'facilities', 'parking-meter'),
  ('restrooms', 'Restrooms', 'facilities', 'toilet'),
  ('food', 'Food & Drinks', 'services', 'utensils'),
  ('gift_shop', 'Gift Shop', 'services', 'shopping-bag'),
  ('photo_ops', 'Photo Opportunities', 'services', 'camera'),
  ('wheelchair', 'Wheelchair Accessible', 'accessibility', 'wheelchair'),
  ('atm', 'ATM', 'services', 'credit-card'),
  ('lockers', 'Lockers', 'facilities', 'lock'),
  ('coat_check', 'Coat Check', 'services', 'shirt'),
  ('vip_lounge', 'VIP Lounge', 'services', 'star'),
  ('warming_area', 'Warming Area', 'facilities', 'flame'),
  ('first_aid', 'First Aid Station', 'facilities', 'first-aid');
```

## Tables

### attractions

Individual attraction venues.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Attraction ID |
| org_id | UUID | FK, NOT NULL | Parent organization |
| name | VARCHAR(200) | NOT NULL | Display name |
| slug | VARCHAR(100) | NOT NULL | URL-safe identifier |
| description | TEXT | | Full description |
| type_id | UUID | FK, NOT NULL | Reference to attraction_types |
| logo_url | TEXT | | Attraction logo |
| cover_image_url | TEXT | | Hero image |
| website | VARCHAR(255) | | Public website |
| email | VARCHAR(255) | | Contact email |
| phone | VARCHAR(20) | | Contact phone |
| address_line1 | VARCHAR(255) | | Street address |
| address_line2 | VARCHAR(255) | | Suite/unit |
| city | VARCHAR(100) | | City |
| state | VARCHAR(50) | | State/province |
| postal_code | VARCHAR(20) | | ZIP/postal |
| country | VARCHAR(2) | DEFAULT 'US' | Country code |
| latitude | DECIMAL(10,8) | | GPS latitude |
| longitude | DECIMAL(11,8) | | GPS longitude |
| timezone | VARCHAR(50) | | Venue timezone |
| capacity | INTEGER | | Max concurrent guests |
| min_age | INTEGER | | Minimum age requirement |
| intensity_level | INTEGER | CHECK 1-5 | Scare/thrill intensity (1=mild, 5=extreme) |
| duration_minutes | INTEGER | | Average experience time |
| status | attraction_status | DEFAULT 'draft' | Publication status |
| settings | JSONB | DEFAULT '{}' | Attraction-specific settings |
| seo_metadata | JSONB | DEFAULT '{}' | SEO title, description, keywords |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### seasons

Operating seasons for an attraction.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Season ID |
| attraction_id | UUID | FK, NOT NULL | Parent attraction |
| name | VARCHAR(100) | NOT NULL | Season name (e.g., "Halloween 2024") |
| year | INTEGER | NOT NULL | Operating year |
| start_date | DATE | NOT NULL | Season start |
| end_date | DATE | NOT NULL | Season end |
| status | season_status | DEFAULT 'upcoming' | Season status |
| settings | JSONB | DEFAULT '{}' | Season-specific settings |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### operating_hours

Operating hours by day or specific date.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Hours ID |
| attraction_id | UUID | FK, NOT NULL | Parent attraction |
| season_id | UUID | FK | Optional season |
| date | DATE | | Specific date (overrides day_of_week) |
| day_of_week | INTEGER | 0-6 | Day of week (0=Sunday) |
| open_time | TIME | NOT NULL | Opening time |
| close_time | TIME | NOT NULL | Closing time |
| is_closed | BOOLEAN | DEFAULT FALSE | Closed this day |
| notes | VARCHAR(255) | | Special notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

### zones

Areas within an attraction for staff assignment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Zone ID |
| attraction_id | UUID | FK, NOT NULL | Parent attraction |
| name | VARCHAR(100) | NOT NULL | Zone name |
| description | TEXT | | Zone description |
| capacity | INTEGER | | Zone capacity |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| color | VARCHAR(7) | | Hex color for UI |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

## Indexes

```sql
-- Attractions
CREATE UNIQUE INDEX attractions_org_slug_idx ON attractions(org_id, slug);
CREATE INDEX attractions_org_id_idx ON attractions(org_id);
CREATE INDEX attractions_status_idx ON attractions(status);
CREATE INDEX attractions_type_idx ON attractions(type_id);
CREATE INDEX attractions_location_idx ON attractions(latitude, longitude);

-- Seasons
CREATE UNIQUE INDEX seasons_unique_idx ON seasons(attraction_id, year, name);
CREATE INDEX seasons_dates_idx ON seasons(start_date, end_date);
CREATE INDEX seasons_status_idx ON seasons(status);

-- Operating Hours
CREATE INDEX operating_hours_attraction_date_idx ON operating_hours(attraction_id, date);
CREATE INDEX operating_hours_attraction_dow_idx ON operating_hours(attraction_id, day_of_week);

-- Zones
CREATE UNIQUE INDEX zones_unique_idx ON zones(attraction_id, name);
CREATE INDEX zones_attraction_idx ON zones(attraction_id);
```

## RLS Policies

```sql
-- Attractions: Org members can view
CREATE POLICY "Org members can view attractions"
  ON attractions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = attractions.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Attractions: Managers+ can create/update
CREATE POLICY "Managers can manage attractions"
  ON attractions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = attractions.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- Published attractions visible publicly (for ticket purchasing)
CREATE POLICY "Published attractions are public"
  ON attractions FOR SELECT
  USING (status IN ('published', 'active'));

-- Zones: Same as attractions
CREATE POLICY "Org members can view zones"
  ON zones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM attractions a
      JOIN org_memberships om ON om.org_id = a.org_id
      WHERE a.id = zones.attraction_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );
```

## Settings Schema

### attraction.settings

```json
{
  "ticketing": {
    "require_timed_entry": true,
    "time_slot_duration_minutes": 15,
    "max_tickets_per_slot": 50,
    "allow_group_bookings": true,
    "max_group_size": 10
  },
  "check_in": {
    "allow_early_minutes": 30,
    "allow_late_minutes": 15,
    "require_waiver": true
  },
  "notifications": {
    "send_reminders": true,
    "reminder_hours_before": 24
  },
  "display": {
    "show_wait_times": true,
    "show_capacity": false
  }
}
```

## Business Rules

1. **Slug Uniqueness**: Slugs are unique within an organization.

2. **Season Dates**: Season end_date must be after start_date.

3. **Hours Priority**: Specific date hours override day_of_week hours.

4. **Status Transitions**:
   - draft → published (requires: name, type, address, at least 1 season)
   - published → active (requires: Stripe connected, at least 1 ticket type)
   - active → paused (instant)
   - any → archived (soft archive)

5. **Timezone Inheritance**: If attraction timezone is null, inherit from organization.

## Dependencies

- **F2 Organizations**: org_id foreign key

## Migration Order

1. Create status enums (attraction_status, season_status)
2. Create attraction_types lookup table
3. Create amenity_types lookup table
4. Seed lookup tables with initial data
5. Create attractions table
6. Create seasons table
7. Create operating_hours table
8. Create attraction_images table
9. Create attraction_amenities table
10. Create zones table
11. Create indexes
12. Create RLS policies
