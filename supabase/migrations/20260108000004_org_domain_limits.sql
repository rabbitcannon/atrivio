-- Migration: Add custom domain limits to organizations
-- This allows per-org customization of domain limits for tier upgrades

-- Add custom_domain_limit column to organizations
-- Default is 0 (free tier uses subdomain only)
-- Pro tier: 5 custom domains
-- Enterprise tier: 10 custom domains
ALTER TABLE organizations
ADD COLUMN custom_domain_limit INTEGER NOT NULL DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN organizations.custom_domain_limit IS
  'Maximum number of custom domains allowed for this organization. Free: 0, Pro: 5, Enterprise: 10';

-- Create a function to check domain limit before insert
CREATE OR REPLACE FUNCTION check_custom_domain_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  org_limit INTEGER;
BEGIN
  -- Only check for custom domains, not subdomains
  IF NEW.domain_type = 'subdomain' THEN
    RETURN NEW;
  END IF;

  -- Get current custom domain count for this org
  SELECT COUNT(*) INTO current_count
  FROM storefront_domains
  WHERE org_id = NEW.org_id
    AND domain_type = 'custom';

  -- Get the org's domain limit
  SELECT custom_domain_limit INTO org_limit
  FROM organizations
  WHERE id = NEW.org_id;

  -- Default to 0 if not found (free tier)
  IF org_limit IS NULL THEN
    org_limit := 0;
  END IF;

  -- Check if adding this domain would exceed the limit
  IF org_limit = 0 THEN
    RAISE EXCEPTION 'Custom domains are not available on the free plan. Upgrade to Pro to add custom domains.';
  ELSIF current_count >= org_limit THEN
    RAISE EXCEPTION 'Custom domain limit reached. Your plan allows up to % custom domains.', org_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce limit on insert
CREATE TRIGGER enforce_custom_domain_limit
  BEFORE INSERT ON storefront_domains
  FOR EACH ROW
  EXECUTE FUNCTION check_custom_domain_limit();

-- Helper function to get domain usage for an org
CREATE OR REPLACE FUNCTION get_org_domain_usage(p_org_id UUID)
RETURNS TABLE (
  custom_domain_count INTEGER,
  custom_domain_limit INTEGER,
  remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(
      (SELECT COUNT(*)::INTEGER
       FROM storefront_domains
       WHERE org_id = p_org_id AND domain_type = 'custom'),
      0
    ) as custom_domain_count,
    COALESCE(o.custom_domain_limit, 0) as custom_domain_limit,
    COALESCE(o.custom_domain_limit, 0) - COALESCE(
      (SELECT COUNT(*)::INTEGER
       FROM storefront_domains
       WHERE org_id = p_org_id AND domain_type = 'custom'),
      0
    ) as remaining
  FROM organizations o
  WHERE o.id = p_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_org_domain_usage(UUID) TO authenticated;
