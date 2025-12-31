-- Fix RLS infinite recursion issues
-- The policies were querying tables that triggered other RLS checks, causing infinite loops

-- ============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER bypasses RLS)
-- ============================================================================

-- Check if current user is a super admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Check if current user is a member of an org (bypasses RLS)
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_memberships
    WHERE org_id = check_org_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- Check if current user has admin role in an org (bypasses RLS)
CREATE OR REPLACE FUNCTION is_org_admin(check_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_memberships
    WHERE org_id = check_org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
  );
$$;

-- Get current user's org_id from membership
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT org_id FROM org_memberships
  WHERE user_id = auth.uid()
    AND status = 'active';
$$;

-- ============================================================================
-- DROP EXISTING PROBLEMATIC POLICIES
-- ============================================================================

-- Profiles policies
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;

-- Organizations policies
DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Admins can update organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins full access to organizations" ON organizations;

-- Org memberships policies
DROP POLICY IF EXISTS "Members can view org memberships" ON org_memberships;
DROP POLICY IF EXISTS "Admins can manage memberships" ON org_memberships;

-- ============================================================================
-- RECREATE POLICIES WITH HELPER FUNCTIONS
-- ============================================================================

-- Profiles: Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_super_admin());

-- Organizations: Members can view their organizations
CREATE POLICY "Members can view their organizations"
  ON organizations FOR SELECT
  USING (is_org_member(id));

-- Organizations: Admins can update organizations
CREATE POLICY "Admins can update organizations"
  ON organizations FOR UPDATE
  USING (is_org_admin(id));

-- Organizations: Super admins full access
CREATE POLICY "Super admins full access to organizations"
  ON organizations FOR ALL
  USING (is_super_admin());

-- Org memberships: Members can view memberships in their orgs
CREATE POLICY "Members can view org memberships"
  ON org_memberships FOR SELECT
  USING (
    user_id = auth.uid()  -- Can always see own memberships
    OR is_org_member(org_id)  -- Can see other members in same org
  );

-- Org memberships: Admins can manage memberships
CREATE POLICY "Admins can manage memberships"
  ON org_memberships FOR ALL
  USING (is_org_admin(org_id));

-- ============================================================================
-- GRANT EXECUTE ON HELPER FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_org_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_org_ids() TO authenticated;
