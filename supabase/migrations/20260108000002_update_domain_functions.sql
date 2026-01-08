-- Update get_org_by_domain function to use atrivio.io
CREATE OR REPLACE FUNCTION get_org_by_domain(p_domain VARCHAR)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- First check custom domains
  SELECT org_id INTO v_org_id
  FROM storefront_domains
  WHERE domain = p_domain
    AND status = 'active';

  IF v_org_id IS NOT NULL THEN
    RETURN v_org_id;
  END IF;

  -- Check subdomain pattern (slug.atrivio.io)
  IF p_domain LIKE '%.atrivio.io' THEN
    SELECT id INTO v_org_id
    FROM organizations
    WHERE slug = SPLIT_PART(p_domain, '.', 1)
      AND status = 'active';
  END IF;

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update resolve_storefront_domain function to use atrivio.io
CREATE OR REPLACE FUNCTION resolve_storefront_domain(p_domain VARCHAR)
RETURNS TABLE (org_id UUID, attraction_id UUID) AS $$
BEGIN
  -- First check custom domains
  RETURN QUERY
  SELECT sd.org_id, sd.attraction_id
  FROM storefront_domains sd
  WHERE sd.domain = p_domain
    AND sd.status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    -- Check subdomain pattern (slug.atrivio.io)
    IF p_domain LIKE '%.atrivio.io' THEN
      -- First try attraction slug
      RETURN QUERY
      SELECT a.org_id, a.id as attraction_id
      FROM attractions a
      WHERE a.slug = SPLIT_PART(p_domain, '.', 1)
        AND a.status = 'active'
      LIMIT 1;

      -- If no attraction found, try org slug with first attraction
      IF NOT FOUND THEN
        RETURN QUERY
        SELECT o.id as org_id, a.id as attraction_id
        FROM organizations o
        JOIN attractions a ON a.org_id = o.id
        WHERE o.slug = SPLIT_PART(p_domain, '.', 1)
          AND o.status = 'active'
          AND a.status = 'active'
        ORDER BY a.created_at
        LIMIT 1;
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
