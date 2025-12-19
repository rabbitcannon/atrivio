# ERD Template for Feature Implementation

Use this template when creating ERDs for each feature.

---

# Feature: [Feature Name]

## Overview

Brief description of the feature and its purpose within the platform.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   Table Name    │       │   Table Name    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───────│ id (PK)         │
│ field_name      │       │ foreign_id (FK) │
│ created_at      │       │ field_name      │
└─────────────────┘       └─────────────────┘
```

---

## Tables

### `table_name`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Primary key |
| `org_id` | `UUID` | FK → organizations(id), NOT NULL | Tenant isolation |
| `field_name` | `TEXT` | NOT NULL | Description |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_table_org_id` on `(org_id)`
- `idx_table_field` on `(field_name)` WHERE condition

---

## Row Level Security (RLS)

### Policy: `table_name_tenant_isolation`

```sql
CREATE POLICY table_name_tenant_isolation ON table_name
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
    )
  );
```

### Policy: `table_name_role_based`

```sql
CREATE POLICY table_name_role_based ON table_name
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE user_id = auth.uid()
        AND org_id = table_name.org_id
        AND role IN ('owner', 'admin', 'manager')
    )
  );
```

---

## RPC Functions

### `function_name(params)`

```sql
CREATE OR REPLACE FUNCTION function_name(
  p_org_id UUID,
  p_param TEXT
)
RETURNS TABLE (column_name TYPE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Implementation
END;
$$;
```

**Purpose:** Description of what this function does.

**Parameters:**
- `p_org_id`: Organization context
- `p_param`: Description

**Returns:** Description of return value

---

## Relationships

| From | To | Type | Description |
|------|-----|------|-------------|
| `table_a` | `table_b` | One-to-Many | Description |
| `table_b` | `table_c` | Many-to-Many | Via junction table |

---

## Migration Notes

### Dependencies
- Requires: List of tables/functions that must exist first
- Creates: List of tables/functions this migration creates

### Rollback Strategy
```sql
-- Rollback commands
DROP TABLE IF EXISTS table_name CASCADE;
DROP FUNCTION IF EXISTS function_name;
```

---

## API Integration Points

| Endpoint | Method | Table(s) | RLS Policy |
|----------|--------|----------|------------|
| `/api/resource` | GET | `table_name` | `tenant_isolation` |
| `/api/resource` | POST | `table_name` | `role_based` |

---

## Checklist

- [ ] Tables defined with proper types
- [ ] Indexes identified for common queries
- [ ] RLS policies cover all access patterns
- [ ] RPC functions for complex operations
- [ ] Migration dependencies documented
- [ ] Rollback strategy defined
- [ ] API integration points identified
