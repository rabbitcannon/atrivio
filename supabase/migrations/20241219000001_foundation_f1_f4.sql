-- ============================================================================
-- FOUNDATION MIGRATION: F1-F4
-- Auth, Organizations, Attractions, Staff
-- ============================================================================

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Updated at trigger function (used by all tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- F1: AUTHENTICATION & USERS
-- ============================================================================

-- Profiles table (1:1 with auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(200),
  avatar_url TEXT,
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  is_super_admin BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles indexes
CREATE UNIQUE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_is_super_admin_idx ON profiles(is_super_admin) WHERE is_super_admin = TRUE;

-- Profiles trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- F2: ORGANIZATIONS
-- ============================================================================

-- Enums
CREATE TYPE org_status AS ENUM ('active', 'suspended', 'deleted');

CREATE TYPE org_role AS ENUM (
  'owner',
  'admin',
  'manager',
  'hr',
  'box_office',
  'finance',
  'actor',
  'scanner'
);

CREATE TYPE membership_status AS ENUM ('pending', 'active', 'suspended', 'removed');

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'US',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  status org_status DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  stripe_account_id VARCHAR(255),
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization indexes
CREATE INDEX orgs_status_idx ON organizations(status);
CREATE INDEX orgs_stripe_account_idx ON organizations(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

-- Organizations trigger
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Org memberships table
CREATE TABLE org_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role org_role NOT NULL,
  is_owner BOOLEAN DEFAULT FALSE,
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  status membership_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, user_id)
);

-- Membership indexes
CREATE INDEX org_memberships_user_idx ON org_memberships(user_id);
CREATE INDEX org_memberships_org_role_idx ON org_memberships(org_id, role);
CREATE INDEX org_memberships_owner_idx ON org_memberships(org_id) WHERE is_owner = TRUE;

-- Memberships trigger
CREATE TRIGGER update_org_memberships_updated_at
  BEFORE UPDATE ON org_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Prevent owner removal trigger
CREATE OR REPLACE FUNCTION prevent_owner_removal()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_owner = TRUE AND (TG_OP = 'DELETE' OR NEW.status = 'removed') THEN
    RAISE EXCEPTION 'Cannot remove organization owner';
  END IF;
  IF OLD.is_owner = TRUE AND NEW.role != 'owner' THEN
    RAISE EXCEPTION 'Cannot demote organization owner';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_org_owner
  BEFORE UPDATE OR DELETE ON org_memberships
  FOR EACH ROW
  EXECUTE FUNCTION prevent_owner_removal();

-- Org invitations table
CREATE TABLE org_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role org_role NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invitation indexes
CREATE INDEX org_invitations_token_idx ON org_invitations(token) WHERE accepted_at IS NULL;
CREATE INDEX org_invitations_email_idx ON org_invitations(email) WHERE accepted_at IS NULL;
CREATE UNIQUE INDEX org_invitations_pending_idx ON org_invitations(org_id, email) WHERE accepted_at IS NULL;

-- ============================================================================
-- F3: ATTRACTIONS
-- ============================================================================

-- Status enums
CREATE TYPE attraction_status AS ENUM (
  'draft',
  'published',
  'active',
  'paused',
  'archived'
);

CREATE TYPE season_status AS ENUM (
  'upcoming',
  'active',
  'completed'
);

-- Attraction types lookup table
CREATE TABLE attraction_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  icon VARCHAR(50),
  color VARCHAR(7),
  default_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_attraction_types_updated_at
  BEFORE UPDATE ON attraction_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed attraction types
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

-- Amenity types lookup table
CREATE TABLE amenity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed amenity types
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

-- Attractions table
CREATE TABLE attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  type_id UUID NOT NULL REFERENCES attraction_types(id),
  logo_url TEXT,
  cover_image_url TEXT,
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone VARCHAR(50),
  capacity INTEGER,
  min_age INTEGER,
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 5),
  duration_minutes INTEGER,
  status attraction_status DEFAULT 'draft',
  settings JSONB DEFAULT '{}',
  seo_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, slug)
);

-- Attractions indexes
CREATE INDEX attractions_org_id_idx ON attractions(org_id);
CREATE INDEX attractions_status_idx ON attractions(status);
CREATE INDEX attractions_type_idx ON attractions(type_id);
CREATE INDEX attractions_location_idx ON attractions(latitude, longitude);

-- Attractions trigger
CREATE TRIGGER update_attractions_updated_at
  BEFORE UPDATE ON attractions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seasons table
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status season_status DEFAULT 'upcoming',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(attraction_id, year, name),
  CHECK (end_date > start_date)
);

-- Seasons indexes
CREATE INDEX seasons_dates_idx ON seasons(start_date, end_date);
CREATE INDEX seasons_status_idx ON seasons(status);

-- Seasons trigger
CREATE TRIGGER update_seasons_updated_at
  BEFORE UPDATE ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Operating hours table
CREATE TABLE operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  date DATE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  notes VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (date IS NOT NULL OR day_of_week IS NOT NULL)
);

-- Operating hours indexes
CREATE INDEX operating_hours_attraction_date_idx ON operating_hours(attraction_id, date);
CREATE INDEX operating_hours_attraction_dow_idx ON operating_hours(attraction_id, day_of_week);

-- Attraction images table
CREATE TABLE attraction_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX attraction_images_attraction_idx ON attraction_images(attraction_id);

-- Attraction amenities junction table
CREATE TABLE attraction_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  amenity_type_id UUID NOT NULL REFERENCES amenity_types(id),
  description VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(attraction_id, amenity_type_id)
);

CREATE INDEX attraction_amenities_attraction_idx ON attraction_amenities(attraction_id);

-- Zones table
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  capacity INTEGER,
  sort_order INTEGER DEFAULT 0,
  color VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(attraction_id, name)
);

-- Zones indexes
CREATE INDEX zones_attraction_idx ON zones(attraction_id);

-- Zones trigger
CREATE TRIGGER update_zones_updated_at
  BEFORE UPDATE ON zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- F4: STAFF & ROLES
-- ============================================================================

-- Enums
CREATE TYPE employment_type AS ENUM (
  'full_time',
  'part_time',
  'seasonal',
  'volunteer',
  'contractor'
);

CREATE TYPE staff_status AS ENUM (
  'pending',
  'active',
  'inactive',
  'on_leave',
  'terminated'
);

CREATE TYPE time_entry_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'disputed'
);

-- Skill types lookup table
CREATE TABLE skill_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  icon VARCHAR(50),
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, key)
);

CREATE INDEX skill_types_org_idx ON skill_types(org_id);

CREATE TRIGGER update_skill_types_updated_at
  BEFORE UPDATE ON skill_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed skill types (org_id NULL = system defaults)
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

-- Certification types lookup table
CREATE TABLE certification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  issuing_authority VARCHAR(200),
  validity_months INTEGER,
  is_required BOOLEAN DEFAULT FALSE,
  icon VARCHAR(50),
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, key)
);

CREATE INDEX certification_types_org_idx ON certification_types(org_id);

CREATE TRIGGER update_certification_types_updated_at
  BEFORE UPDATE ON certification_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed certification types
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

-- Document types lookup table
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_required BOOLEAN DEFAULT FALSE,
  requires_expiry BOOLEAN DEFAULT FALSE,
  icon VARCHAR(50),
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, key)
);

CREATE INDEX document_types_org_idx ON document_types(org_id);

CREATE TRIGGER update_document_types_updated_at
  BEFORE UPDATE ON document_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed document types
INSERT INTO document_types (org_id, key, name, category, is_required, icon, color) VALUES
  (NULL, 'w4', 'W-4 Tax Withholding', 'tax', TRUE, 'file-text', '#3B82F6'),
  (NULL, 'i9', 'I-9 Employment Eligibility', 'identity', TRUE, 'user-check', '#10B981'),
  (NULL, 'direct_deposit', 'Direct Deposit Form', 'payroll', FALSE, 'banknote', '#22C55E'),
  (NULL, 'id_copy', 'ID Copy', 'identity', FALSE, 'credit-card', '#6B7280'),
  (NULL, 'signed_waiver', 'Signed Waiver', 'compliance', FALSE, 'file-signature', '#8B5CF6'),
  (NULL, 'photo', 'Staff Photo', 'identity', FALSE, 'camera', '#EC4899'),
  (NULL, 'other', 'Other Document', 'other', FALSE, 'file', '#6B7280');

-- Staff profiles table
CREATE TABLE staff_profiles (
  id UUID PRIMARY KEY REFERENCES org_memberships(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id VARCHAR(50),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  date_of_birth DATE,
  shirt_size VARCHAR(10),
  notes TEXT,
  hire_date DATE,
  termination_date DATE,
  hourly_rate INTEGER,
  employment_type employment_type DEFAULT 'seasonal',
  status staff_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff profiles indexes
CREATE INDEX staff_profiles_org_idx ON staff_profiles(org_id);
CREATE INDEX staff_profiles_status_idx ON staff_profiles(status);
CREATE INDEX staff_profiles_employee_id_idx ON staff_profiles(org_id, employee_id);

-- Staff profiles trigger
CREATE TRIGGER update_staff_profiles_updated_at
  BEFORE UPDATE ON staff_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Staff attraction assignments table
CREATE TABLE staff_attraction_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  zones UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(staff_id, attraction_id)
);

CREATE INDEX staff_attraction_assignments_attraction_idx ON staff_attraction_assignments(attraction_id);

-- Staff skills table
CREATE TABLE staff_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  skill_type_id UUID NOT NULL REFERENCES skill_types(id),
  level INTEGER CHECK (level >= 1 AND level <= 5),
  endorsed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(staff_id, skill_type_id)
);

CREATE INDEX staff_skills_type_idx ON staff_skills(skill_type_id);

-- Staff certifications table
CREATE TABLE staff_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  cert_type_id UUID NOT NULL REFERENCES certification_types(id),
  issued_at DATE NOT NULL,
  expires_at DATE,
  certificate_number VARCHAR(100),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX staff_certs_expires_idx ON staff_certifications(expires_at);
CREATE INDEX staff_certs_type_idx ON staff_certifications(cert_type_id);

-- Staff documents table
CREATE TABLE staff_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id),
  name VARCHAR(200) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  expires_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX staff_documents_staff_idx ON staff_documents(staff_id);
CREATE INDEX staff_documents_type_idx ON staff_documents(document_type_id);

-- Staff waivers table
CREATE TABLE staff_waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  waiver_type VARCHAR(100) NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  signature_data TEXT,
  waiver_version VARCHAR(50),
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(staff_id, waiver_type, waiver_version)
);

CREATE INDEX staff_waivers_staff_idx ON staff_waivers(staff_id);

-- Staff time entries table
CREATE TABLE staff_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID REFERENCES attractions(id) ON DELETE SET NULL,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  status time_entry_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time entries indexes
CREATE INDEX staff_time_org_date_idx ON staff_time_entries(org_id, clock_in);
CREATE INDEX staff_time_staff_date_idx ON staff_time_entries(staff_id, clock_in);
CREATE INDEX staff_time_status_idx ON staff_time_entries(status);

-- Time entries trigger
CREATE TRIGGER update_staff_time_entries_updated_at
  BEFORE UPDATE ON staff_time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attraction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE attraction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE attraction_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attraction_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_time_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- F1: PROFILES RLS
-- ============================================================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

-- ============================================================================
-- F2: ORGANIZATIONS RLS
-- ============================================================================

CREATE POLICY "Members can view their organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = organizations.id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Admins can update organizations"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = organizations.id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Super admins full access to organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );

CREATE POLICY "Members can view org memberships"
  ON org_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships m
      WHERE m.org_id = org_memberships.org_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

CREATE POLICY "Admins can manage memberships"
  ON org_memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships m
      WHERE m.org_id = org_memberships.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ============================================================================
-- F3: ATTRACTIONS RLS
-- ============================================================================

-- Lookup tables are public read
CREATE POLICY "Anyone can view attraction types"
  ON attraction_types FOR SELECT
  USING (TRUE);

CREATE POLICY "Anyone can view amenity types"
  ON amenity_types FOR SELECT
  USING (TRUE);

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

CREATE POLICY "Published attractions are public"
  ON attractions FOR SELECT
  USING (status IN ('published', 'active'));

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

CREATE POLICY "Org members can view seasons"
  ON seasons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM attractions a
      JOIN org_memberships om ON om.org_id = a.org_id
      WHERE a.id = seasons.attraction_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can manage seasons"
  ON seasons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM attractions a
      JOIN org_memberships om ON om.org_id = a.org_id
      WHERE a.id = seasons.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

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

-- Operating hours policies (similar pattern)
CREATE POLICY "Org members can view operating hours"
  ON operating_hours FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM attractions a
      JOIN org_memberships om ON om.org_id = a.org_id
      WHERE a.id = operating_hours.attraction_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

-- Images and amenities follow same pattern
CREATE POLICY "Org members can view attraction images"
  ON attraction_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM attractions a
      JOIN org_memberships om ON om.org_id = a.org_id
      WHERE a.id = attraction_images.attraction_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

CREATE POLICY "Org members can view attraction amenities"
  ON attraction_amenities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM attractions a
      JOIN org_memberships om ON om.org_id = a.org_id
      WHERE a.id = attraction_amenities.attraction_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

-- ============================================================================
-- F4: STAFF RLS
-- ============================================================================

-- Lookup tables: system defaults public, org-specific scoped
CREATE POLICY "Anyone can view system skill types"
  ON skill_types FOR SELECT
  USING (org_id IS NULL);

CREATE POLICY "Org members can view their skill types"
  ON skill_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = skill_types.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Anyone can view system certification types"
  ON certification_types FOR SELECT
  USING (org_id IS NULL);

CREATE POLICY "Org members can view their certification types"
  ON certification_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = certification_types.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Anyone can view system document types"
  ON document_types FOR SELECT
  USING (org_id IS NULL);

CREATE POLICY "Org members can view their document types"
  ON document_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = document_types.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Staff profiles
CREATE POLICY "Staff can view own profile"
  ON staff_profiles FOR SELECT
  USING (
    id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

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

-- Time entries
CREATE POLICY "Staff can view own time entries"
  ON staff_time_entries FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can clock in/out"
  ON staff_time_entries FOR INSERT
  WITH CHECK (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "HR can manage time entries"
  ON staff_time_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = staff_time_entries.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager', 'hr')
        AND status = 'active'
    )
  );

-- Staff skills, certifications, documents - similar patterns
CREATE POLICY "Staff can view own skills"
  ON staff_skills FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view own certifications"
  ON staff_certifications FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view own documents"
  ON staff_documents FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view own waivers"
  ON staff_waivers FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view own attraction assignments"
  ON staff_attraction_assignments FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMPLETE
-- ============================================================================
