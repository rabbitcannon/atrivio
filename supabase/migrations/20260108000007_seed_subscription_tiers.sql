-- Seed subscription tiers for demo organizations
-- This runs after seed.sql has created the organizations

-- Set subscription tiers for each demo organization
UPDATE public.organizations SET subscription_tier = 'pro'
WHERE id = 'b0000000-0000-0000-0000-000000000001'; -- Nightmare Manor

UPDATE public.organizations SET subscription_tier = 'free'
WHERE id = 'b0000000-0000-0000-0000-000000000002'; -- Spooky Hollow

UPDATE public.organizations SET subscription_tier = 'enterprise'
WHERE id = 'b0000000-0000-0000-0000-000000000003'; -- Terror Collective

UPDATE public.organizations SET subscription_tier = 'free'
WHERE id = 'b0000000-0000-0000-0000-000000000004'; -- Newhouse Haunts (onboarding)

-- Create tier-specific demo users for easy testing
-- These are easier to remember than the existing role-based emails

-- Free tier demo account (new user)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES (
  'a0000000-0000-0000-0000-000000000f01',
  '00000000-0000-0000-0000-000000000000',
  'free@haunt.dev',
  crypt('password123', gen_salt('bf')),
  NOW(), '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Free", "last_name": "Demo"}',
  NOW(), NOW(), 'authenticated', 'authenticated',
  '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
) ON CONFLICT (id) DO NOTHING;

-- Pro tier demo account (new user)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES (
  'a0000000-0000-0000-0000-000000000f02',
  '00000000-0000-0000-0000-000000000000',
  'pro@haunt.dev',
  crypt('password123', gen_salt('bf')),
  NOW(), '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Pro", "last_name": "Demo"}',
  NOW(), NOW(), 'authenticated', 'authenticated',
  '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
) ON CONFLICT (id) DO NOTHING;

-- Enterprise tier demo account (new user)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES (
  'a0000000-0000-0000-0000-000000000f03',
  '00000000-0000-0000-0000-000000000000',
  'enterprise@haunt.dev',
  crypt('password123', gen_salt('bf')),
  NOW(), '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Enterprise", "last_name": "Demo"}',
  NOW(), NOW(), 'authenticated', 'authenticated',
  '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
) ON CONFLICT (id) DO NOTHING;

-- Create org memberships for the tier demo accounts
-- Free tier user -> Spooky Hollow (free org)
INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES (
  'd0000000-0000-0000-0000-000000000f01',
  'b0000000-0000-0000-0000-000000000002',  -- Spooky Hollow (free)
  'a0000000-0000-0000-0000-000000000f01',
  'owner', TRUE, 'active', NOW()
) ON CONFLICT (org_id, user_id) DO NOTHING;

-- Pro tier user -> Nightmare Manor (pro org)
INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES (
  'd0000000-0000-0000-0000-000000000f02',
  'b0000000-0000-0000-0000-000000000001',  -- Nightmare Manor (pro)
  'a0000000-0000-0000-0000-000000000f02',
  'owner', TRUE, 'active', NOW()
) ON CONFLICT (org_id, user_id) DO NOTHING;

-- Enterprise tier user -> Terror Collective (enterprise org)
INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES (
  'd0000000-0000-0000-0000-000000000f03',
  'b0000000-0000-0000-0000-000000000003',  -- Terror Collective (enterprise)
  'a0000000-0000-0000-0000-000000000f03',
  'owner', TRUE, 'active', NOW()
) ON CONFLICT (org_id, user_id) DO NOTHING;

-- Add comment for documentation
COMMENT ON EXTENSION pgcrypto IS 'Cryptographic functions for password hashing';
