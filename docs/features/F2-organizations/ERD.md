# F2: Organizations - ERD

## Overview

Multi-tenant organization system. Users can belong to multiple organizations with different roles. Organizations are the primary tenant boundary for all data.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        organizations                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ name            VARCHAR(200) NOT NULL                            │
│ slug            VARCHAR(100) UNIQUE NOT NULL                     │
│ logo_url        TEXT                                             │
│ website         VARCHAR(255)                                     │
│ email           VARCHAR(255)                                     │
│ phone           VARCHAR(20)                                      │
│ address_line1   VARCHAR(255)                                     │
│ address_line2   VARCHAR(255)                                     │
│ city            VARCHAR(100)                                     │
│ state           VARCHAR(50)                                      │
│ postal_code     VARCHAR(20)                                      │
│ country         VARCHAR(2) DEFAULT 'US'                          │
│ timezone        VARCHAR(50) DEFAULT 'America/New_York'           │
│ status          org_status DEFAULT 'active'                      │
│ settings        JSONB DEFAULT '{}'                               │
│ stripe_account_id VARCHAR(255)                                   │
│ stripe_onboarding_complete BOOLEAN DEFAULT FALSE                 │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       org_memberships                            │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ user_id         UUID FK → profiles.id NOT NULL                   │
│ role            org_role NOT NULL                                │
│ is_owner        BOOLEAN DEFAULT FALSE                            │
│ invited_by      UUID FK → profiles.id                            │
│ invited_at      TIMESTAMPTZ                                      │
│ accepted_at     TIMESTAMPTZ                                      │
│ status          membership_status DEFAULT 'active'               │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, user_id)                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ N:1
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         profiles                                 │
│                        (from F1)                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       org_invitations                            │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ email           VARCHAR(255) NOT NULL                            │
│ role            org_role NOT NULL                                │
│ token           VARCHAR(255) UNIQUE NOT NULL                     │
│ invited_by      UUID FK → profiles.id NOT NULL                   │
│ expires_at      TIMESTAMPTZ NOT NULL                             │
│ accepted_at     TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, email) WHERE accepted_at IS NULL                  │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

```sql
CREATE TYPE org_status AS ENUM ('active', 'suspended', 'deleted');

CREATE TYPE org_role AS ENUM (
  'owner',      -- Full control, cannot be removed
  'admin',      -- Full control except owner actions
  'manager',    -- Manage attractions, staff, schedules
  'hr',         -- Manage staff, view schedules
  'box_office', -- Manage tickets, check-in
  'finance',    -- View financial reports, manage payments
  'actor',      -- View own schedule, check-in
  'scanner'     -- Check-in only
);

CREATE TYPE membership_status AS ENUM ('pending', 'active', 'suspended', 'removed');
```

## Tables

### organizations

Primary tenant entity. All business data is scoped to an organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Organization ID |
| name | VARCHAR(200) | NOT NULL | Display name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-safe identifier |
| logo_url | TEXT | | Organization logo |
| website | VARCHAR(255) | | Public website |
| email | VARCHAR(255) | | Contact email |
| phone | VARCHAR(20) | | Contact phone |
| address_line1 | VARCHAR(255) | | Street address |
| address_line2 | VARCHAR(255) | | Suite/unit |
| city | VARCHAR(100) | | City |
| state | VARCHAR(50) | | State/province |
| postal_code | VARCHAR(20) | | ZIP/postal code |
| country | VARCHAR(2) | DEFAULT 'US' | ISO country code |
| timezone | VARCHAR(50) | DEFAULT 'America/New_York' | Org timezone |
| status | org_status | DEFAULT 'active' | Account status |
| settings | JSONB | DEFAULT '{}' | Org-specific settings |
| stripe_account_id | VARCHAR(255) | | Stripe Connect account |
| stripe_onboarding_complete | BOOLEAN | DEFAULT FALSE | Stripe setup status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### org_memberships

Links users to organizations with roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Membership ID |
| org_id | UUID | FK, NOT NULL | Organization reference |
| user_id | UUID | FK, NOT NULL | User reference |
| role | org_role | NOT NULL | User's role in org |
| is_owner | BOOLEAN | DEFAULT FALSE | Protected owner flag |
| invited_by | UUID | FK | Who invited this user |
| invited_at | TIMESTAMPTZ | | When invitation sent |
| accepted_at | TIMESTAMPTZ | | When user accepted |
| status | membership_status | DEFAULT 'active' | Membership status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### org_invitations

Pending invitations to join an organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Invitation ID |
| org_id | UUID | FK, NOT NULL | Organization reference |
| email | VARCHAR(255) | NOT NULL | Invitee email |
| role | org_role | NOT NULL | Role to assign |
| token | VARCHAR(255) | UNIQUE, NOT NULL | Secure invitation token |
| invited_by | UUID | FK, NOT NULL | Inviter user |
| expires_at | TIMESTAMPTZ | NOT NULL | Expiration time |
| accepted_at | TIMESTAMPTZ | | When accepted |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

## Indexes

```sql
-- Organizations
CREATE INDEX orgs_status_idx ON organizations(status);
CREATE INDEX orgs_stripe_account_idx ON organizations(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

-- Memberships
CREATE UNIQUE INDEX org_memberships_unique_idx ON org_memberships(org_id, user_id);
CREATE INDEX org_memberships_user_idx ON org_memberships(user_id);
CREATE INDEX org_memberships_org_role_idx ON org_memberships(org_id, role);
CREATE INDEX org_memberships_owner_idx ON org_memberships(org_id) WHERE is_owner = TRUE;

-- Invitations
CREATE INDEX org_invitations_token_idx ON org_invitations(token) WHERE accepted_at IS NULL;
CREATE INDEX org_invitations_email_idx ON org_invitations(email) WHERE accepted_at IS NULL;
CREATE UNIQUE INDEX org_invitations_pending_idx ON org_invitations(org_id, email) WHERE accepted_at IS NULL;
```

## RLS Policies

```sql
-- Organizations: Members can view their orgs
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

-- Organizations: Admins+ can update
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

-- Memberships: Members can view org members
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

-- Memberships: Admins+ can manage
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

-- Super admins bypass all
CREATE POLICY "Super admins full access"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );
```

## Role Hierarchy & Permissions

```
owner (100)
  └── admin (90)
        ├── manager (70)
        │     ├── hr (50)
        │     └── box_office (50)
        ├── finance (60)
        └── actor (30)
              └── scanner (20)
```

### Permission Matrix

| Permission | owner | admin | manager | hr | box_office | finance | actor | scanner |
|------------|-------|-------|---------|-----|------------|---------|-------|---------|
| org:update | ✓ | ✓ | | | | | | |
| org:delete | ✓ | | | | | | | |
| member:invite | ✓ | ✓ | ✓ | ✓ | | | | |
| member:remove | ✓ | ✓ | | | | | | |
| member:change_role | ✓ | ✓ | | | | | | |
| attraction:create | ✓ | ✓ | ✓ | | | | | |
| attraction:update | ✓ | ✓ | ✓ | | | | | |
| attraction:delete | ✓ | ✓ | | | | | | |
| staff:manage | ✓ | ✓ | ✓ | ✓ | | | | |
| schedule:view | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | |
| schedule:manage | ✓ | ✓ | ✓ | | | | | |
| ticket:sell | ✓ | ✓ | ✓ | | ✓ | | | |
| ticket:refund | ✓ | ✓ | | | | ✓ | | |
| checkin:scan | ✓ | ✓ | ✓ | | ✓ | | | ✓ |
| finance:view | ✓ | ✓ | | | | ✓ | | |
| finance:manage | ✓ | ✓ | | | | | | |
| analytics:view | ✓ | ✓ | ✓ | | | ✓ | | |

## Business Rules

1. **Owner Protection**: The `is_owner` flag can only be set during org creation. Owners cannot be removed or demoted.

2. **Single Owner**: Each org has exactly one owner (the creator).

3. **Admin Promotion**: Only owners can promote users to admin role.

4. **Self-Demotion**: Users cannot demote themselves if they're the last admin.

5. **Invitation Expiry**: Invitations expire after 7 days.

6. **Slug Uniqueness**: Organization slugs are globally unique and URL-safe.

## Triggers

```sql
-- Update org updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Prevent owner removal
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
```

## Dependencies

- **F1 Auth**: profiles table for user references

## Migration Order

1. Create enums (org_status, org_role, membership_status)
2. Create organizations table
3. Create org_memberships table
4. Create org_invitations table
5. Create indexes
6. Create RLS policies
7. Create triggers
