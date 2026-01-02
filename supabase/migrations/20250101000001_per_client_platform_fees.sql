-- Migration: Per-Client Platform Fees
-- Description: Adds platform_fee_percent column to organizations for custom fee deals
-- Only super_admin can modify this value

-- Add platform_fee_percent column to organizations
-- NULL = use global default from platform_settings
-- Value = custom fee percentage for this organization
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS platform_fee_percent DECIMAL(5,2) DEFAULT NULL
  CONSTRAINT valid_fee_percent CHECK (platform_fee_percent IS NULL OR (platform_fee_percent >= 0 AND platform_fee_percent <= 100));

-- Add comment explaining the column
COMMENT ON COLUMN public.organizations.platform_fee_percent IS
  'Custom platform fee percentage for this organization. NULL uses global default from platform_settings. Only super_admin can modify.';

-- Create a function to get effective platform fee for an organization
CREATE OR REPLACE FUNCTION public.get_org_platform_fee(org_id UUID)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_fee DECIMAL(5,2);
  default_fee DECIMAL(5,2);
BEGIN
  -- Get org-specific fee
  SELECT platform_fee_percent INTO org_fee
  FROM public.organizations
  WHERE id = org_id;

  -- If org has custom fee, return it
  IF org_fee IS NOT NULL THEN
    RETURN org_fee;
  END IF;

  -- Otherwise, get global default
  SELECT (value)::DECIMAL(5,2) INTO default_fee
  FROM public.platform_settings
  WHERE key = 'stripe_platform_fee_percent';

  -- Return default or fallback to 3%
  RETURN COALESCE(default_fee, 3.0);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_org_platform_fee(UUID) TO authenticated;

-- Add index for admin queries filtering by custom fees
CREATE INDEX IF NOT EXISTS idx_organizations_platform_fee
ON public.organizations(platform_fee_percent)
WHERE platform_fee_percent IS NOT NULL;
