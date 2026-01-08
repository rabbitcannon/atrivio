# F10: Inventory Management - ERD

## Overview

Track costumes, props, makeup supplies, and equipment across attractions and seasons.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      inventory_types                             │
│                       (Lookup Table)                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id                       │
│ key             VARCHAR(50) NOT NULL                             │
│ name            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ category        VARCHAR(50)                                      │
│ icon            VARCHAR(50)                                      │
│ color           VARCHAR(7)                                       │
│ is_consumable   BOOLEAN DEFAULT FALSE                            │
│ requires_checkout BOOLEAN DEFAULT FALSE                          │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ sort_order      INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, key) -- NULL org_id = system default              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      inventory_items                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id                         │
│ category_id     UUID FK → inventory_categories.id                │
│ sku             VARCHAR(50) UNIQUE                               │
│ name            VARCHAR(200) NOT NULL                            │
│ description     TEXT                                             │
│ type_id         UUID FK → inventory_types.id NOT NULL            │
│ quantity        INTEGER DEFAULT 0                                │
│ min_quantity    INTEGER DEFAULT 0                                │
│ unit            VARCHAR(50) DEFAULT 'each'                       │
│ unit_cost       INTEGER                                          │
│ location        VARCHAR(200)                                     │
│ condition       item_condition DEFAULT 'good'                    │
│ image_url       TEXT                                             │
│ notes           TEXT                                             │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   inventory_categories                           │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ name            VARCHAR(100) NOT NULL                            │
│ parent_id       UUID FK → inventory_categories.id                │
│ sort_order      INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  inventory_transactions                          │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ item_id         UUID FK → inventory_items.id NOT NULL            │
│ type            transaction_type NOT NULL                        │
│ quantity        INTEGER NOT NULL                                 │
│ previous_qty    INTEGER NOT NULL                                 │
│ new_qty         INTEGER NOT NULL                                 │
│ reason          TEXT                                             │
│ reference_type  VARCHAR(50)                                      │
│ reference_id    UUID                                             │
│ performed_by    UUID FK → profiles.id NOT NULL                   │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    inventory_checkouts                           │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ item_id         UUID FK → inventory_items.id NOT NULL            │
│ staff_id        UUID FK → staff_profiles.id NOT NULL             │
│ quantity        INTEGER DEFAULT 1                                │
│ checked_out_at  TIMESTAMPTZ DEFAULT NOW()                        │
│ checked_out_by  UUID FK → profiles.id NOT NULL                   │
│ due_date        DATE                                             │
│ returned_at     TIMESTAMPTZ                                      │
│ returned_by     UUID FK → profiles.id                            │
│ condition_out   item_condition                                   │
│ condition_in    item_condition                                   │
│ notes           TEXT                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Lookup Tables

### inventory_types

Extensible inventory type classifications. Supports both system defaults and org-specific custom types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Type ID |
| org_id | UUID | FK | Org (NULL = system default) |
| key | VARCHAR(50) | NOT NULL | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | | Type description |
| category | VARCHAR(50) | | Group (production, technical, operations) |
| icon | VARCHAR(50) | | Icon identifier |
| color | VARCHAR(7) | | Hex color code |
| is_consumable | BOOLEAN | DEFAULT FALSE | Item is used up |
| requires_checkout | BOOLEAN | DEFAULT FALSE | Must be checked out to use |
| is_active | BOOLEAN | DEFAULT TRUE | Active for selection |
| sort_order | INTEGER | DEFAULT 0 | Display order |

**Seed Data:**
```sql
INSERT INTO inventory_types (org_id, key, name, category, icon, color, is_consumable, requires_checkout) VALUES
  (NULL, 'costume', 'Costume', 'production', 'shirt', '#9333EA', FALSE, TRUE),
  (NULL, 'prop', 'Prop', 'production', 'box', '#F59E0B', FALSE, TRUE),
  (NULL, 'makeup', 'Makeup', 'production', 'palette', '#EC4899', TRUE, FALSE),
  (NULL, 'equipment', 'Equipment', 'technical', 'wrench', '#6B7280', FALSE, TRUE),
  (NULL, 'consumable', 'Consumable', 'operations', 'package', '#10B981', TRUE, FALSE),
  (NULL, 'safety', 'Safety', 'operations', 'shield', '#EF4444', FALSE, FALSE),
  (NULL, 'lighting', 'Lighting', 'technical', 'lightbulb', '#FBBF24', FALSE, FALSE),
  (NULL, 'audio', 'Audio', 'technical', 'volume-2', '#3B82F6', FALSE, FALSE),
  (NULL, 'other', 'Other', 'operations', 'more-horizontal', '#6B7280', FALSE, FALSE);
```

## Enums

```sql
-- inventory_type removed - now uses inventory_types lookup table

CREATE TYPE item_condition AS ENUM (
  'new', 'excellent', 'good', 'fair', 'poor', 'damaged', 'retired'
);

CREATE TYPE transaction_type AS ENUM (
  'purchase', 'adjustment', 'checkout', 'return',
  'transfer', 'damaged', 'lost', 'disposed'
);
```

## Key Features

- **Categories**: Hierarchical categorization of items
- **Transactions**: Full audit trail of quantity changes
- **Checkouts**: Track who has what equipment
- **Low Stock Alerts**: Notifications when below min_quantity
- **Condition Tracking**: Monitor item wear over time

## Dependencies

- **F3 Attractions**: attraction_id for location
- **F4 Staff**: staff_id for checkouts

## Migration Order

1. Create enums (item_condition, transaction_type)
2. Create inventory_types lookup table with seed data
3. Create inventory_categories table
4. Create inventory_items table
5. Create inventory_transactions table
6. Create inventory_checkouts table
7. Create indexes
8. Create RLS policies
