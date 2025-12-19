# Database - Migrations & Types

Supabase PostgreSQL database management.

## Structure

```
├── migrations/     # SQL migration files
├── seeds/          # Development/test data
└── types/          # Generated TypeScript types
```

## Migration Naming

```
001_core_tables.sql
002_rls_policies.sql
003_organizations.sql
...
```

## RLS Pattern

All tenant tables must have:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy
CREATE POLICY tenant_isolation ON table_name
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
    )
  );
```

## Key Tables (Planned)

| Table | RLS | Notes |
|-------|-----|-------|
| `platform_admins` | No | Super admin lookup |
| `organizations` | Yes | Tenant root |
| `org_memberships` | Yes | User-org-role mapping |
| `haunts` | Yes | Venues within org |

## Type Generation

```bash
pnpm db:types  # Generates types/database.types.ts
```

## Before Adding Migrations

1. Create ERD in `docs/features/FX-name/ERD.md`
2. Document RLS policies
3. Define rollback strategy
