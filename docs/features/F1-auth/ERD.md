# F1: Authentication & Users - ERD

## Overview

Foundation authentication system using Supabase Auth with PKCE flow. Supports email/password, magic links, and OAuth providers.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         auth.users                               │
│                    (Supabase managed)                            │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ email           VARCHAR(255) UNIQUE NOT NULL                     │
│ encrypted_password TEXT                                          │
│ email_confirmed_at TIMESTAMPTZ                                   │
│ created_at      TIMESTAMPTZ                                      │
│ updated_at      TIMESTAMPTZ                                      │
│ raw_user_meta_data JSONB                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          profiles                                │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK FK → auth.users.id                       │
│ email           VARCHAR(255) NOT NULL                            │
│ first_name      VARCHAR(100)                                     │
│ last_name       VARCHAR(100)                                     │
│ display_name    VARCHAR(200)                                     │
│ avatar_url      TEXT                                             │
│ phone           VARCHAR(20)                                      │
│ timezone        VARCHAR(50) DEFAULT 'America/New_York'           │
│ is_super_admin  BOOLEAN DEFAULT FALSE                            │
│ email_verified  BOOLEAN DEFAULT FALSE                            │
│ last_login_at   TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N (via F2)
                              ▼
                    ┌─────────────────┐
                    │ org_memberships │
                    │    (see F2)     │
                    └─────────────────┘
```

## Tables

### profiles

Public user profile data synced from Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users | User ID from Supabase Auth |
| email | VARCHAR(255) | NOT NULL | User's email (synced) |
| first_name | VARCHAR(100) | | First name |
| last_name | VARCHAR(100) | | Last name |
| display_name | VARCHAR(200) | | Computed or custom display name |
| avatar_url | TEXT | | Profile picture URL |
| phone | VARCHAR(20) | | Phone number |
| timezone | VARCHAR(50) | DEFAULT 'America/New_York' | User's timezone |
| is_super_admin | BOOLEAN | DEFAULT FALSE | Platform super admin flag |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| last_login_at | TIMESTAMPTZ | | Last login timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

## Indexes

```sql
CREATE UNIQUE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_is_super_admin_idx ON profiles(is_super_admin) WHERE is_super_admin = TRUE;
```

## RLS Policies

```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );
```

## Triggers

```sql
-- Create profile on user signup
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

-- Update updated_at on profile changes
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Auth Flows

### Email/Password Registration
1. User submits email + password + metadata
2. Supabase creates auth.users record
3. Trigger creates profiles record
4. Confirmation email sent
5. User confirms email
6. email_verified set to TRUE

### Magic Link
1. User submits email
2. Supabase sends magic link
3. User clicks link
4. Session created
5. Profile created if new user

### OAuth (Google, GitHub)
1. User initiates OAuth flow
2. Supabase handles OAuth callback
3. auth.users record created/updated
4. Profile synced with OAuth data

## Dependencies

- Supabase Auth (external)
- No internal feature dependencies

## Migration Order

1. Create profiles table
2. Create indexes
3. Create RLS policies
4. Create triggers
