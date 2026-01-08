# F8: Ticketing - ERD

## Overview

Ticket sales system with support for timed entry, multiple ticket types, promo codes, and group bookings.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ticket_categories                            │
│                       (Lookup Table)                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id                       │
│ key             VARCHAR(50) NOT NULL                             │
│ name            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ icon            VARCHAR(50)                                      │
│ color           VARCHAR(7)                                       │
│ badge_text      VARCHAR(20)                                      │
│ default_settings JSONB DEFAULT '{}'                              │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ sort_order      INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, key) -- NULL org_id = system default              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      order_sources                               │
│                       (Lookup Table)                             │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id                       │
│ key             VARCHAR(50) NOT NULL                             │
│ name            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ icon            VARCHAR(50)                                      │
│ color           VARCHAR(7)                                       │
│ partner_id      UUID FK → partners.id                            │
│ commission_rate INTEGER                                          │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ sort_order      INTEGER DEFAULT 0                                │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, key) -- NULL org_id = system default              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        attractions                               │
│                         (from F3)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       ticket_types                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ season_id       UUID FK → attraction_seasons.id                  │
│ name            VARCHAR(100) NOT NULL                            │
│ description     TEXT                                             │
│ price           INTEGER NOT NULL                                 │
│ compare_price   INTEGER                                          │
│ category_id     UUID FK → ticket_categories.id                   │
│ max_per_order   INTEGER DEFAULT 10                               │
│ min_per_order   INTEGER DEFAULT 1                                │
│ capacity        INTEGER                                          │
│ sold_count      INTEGER DEFAULT 0                                │
│ includes        TEXT[]                                           │
│ restrictions    JSONB DEFAULT '{}'                               │
│ sort_order      INTEGER DEFAULT 0                                │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ available_from  TIMESTAMPTZ                                      │
│ available_until TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       time_slots                                 │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ date            DATE NOT NULL                                    │
│ start_time      TIME NOT NULL                                    │
│ end_time        TIME NOT NULL                                    │
│ capacity        INTEGER NOT NULL                                 │
│ sold_count      INTEGER DEFAULT 0                                │
│ held_count      INTEGER DEFAULT 0                                │
│ status          slot_status DEFAULT 'available'                  │
│ price_modifier  INTEGER DEFAULT 0                                │
│ notes           TEXT                                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(attraction_id, date, start_time)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          orders                                  │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ order_number    VARCHAR(20) UNIQUE NOT NULL                      │
│ customer_id     UUID FK → customers.id                           │
│ customer_email  VARCHAR(255) NOT NULL                            │
│ customer_name   VARCHAR(200)                                     │
│ customer_phone  VARCHAR(20)                                      │
│ subtotal        INTEGER NOT NULL                                 │
│ discount_amount INTEGER DEFAULT 0                                │
│ tax_amount      INTEGER DEFAULT 0                                │
│ total           INTEGER NOT NULL                                 │
│ currency        VARCHAR(3) DEFAULT 'usd'                         │
│ status          order_status DEFAULT 'pending'                   │
│ payment_id      UUID FK → payments.id                            │
│ promo_code_id   UUID FK → promo_codes.id                         │
│ source_id       UUID FK → order_sources.id                       │
│ notes           TEXT                                             │
│ metadata        JSONB DEFAULT '{}'                               │
│ expires_at      TIMESTAMPTZ                                      │
│ completed_at    TIMESTAMPTZ                                      │
│ canceled_at     TIMESTAMPTZ                                      │
│ refunded_at     TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        order_items                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ order_id        UUID FK → orders.id NOT NULL                     │
│ ticket_type_id  UUID FK → ticket_types.id NOT NULL               │
│ time_slot_id    UUID FK → time_slots.id                          │
│ quantity        INTEGER NOT NULL                                 │
│ unit_price      INTEGER NOT NULL                                 │
│ total_price     INTEGER NOT NULL                                 │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          tickets                                 │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ order_id        UUID FK → orders.id NOT NULL                     │
│ order_item_id   UUID FK → order_items.id NOT NULL                │
│ ticket_type_id  UUID FK → ticket_types.id NOT NULL               │
│ time_slot_id    UUID FK → time_slots.id                          │
│ ticket_number   VARCHAR(20) UNIQUE NOT NULL                      │
│ barcode         VARCHAR(50) UNIQUE NOT NULL                      │
│ qr_code_url     TEXT                                             │
│ guest_name      VARCHAR(200)                                     │
│ status          ticket_status DEFAULT 'valid'                    │
│ checked_in_at   TIMESTAMPTZ                                      │
│ checked_in_by   UUID FK → profiles.id                            │
│ voided_at       TIMESTAMPTZ                                      │
│ voided_by       UUID FK → profiles.id                            │
│ void_reason     TEXT                                             │
│ transferred_from UUID FK → tickets.id                            │
│ metadata        JSONB DEFAULT '{}'                               │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        promo_codes                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id                          │
│ code            VARCHAR(50) NOT NULL                             │
│ name            VARCHAR(100)                                     │
│ description     TEXT                                             │
│ discount_type   discount_type NOT NULL                           │
│ discount_value  INTEGER NOT NULL                                 │
│ min_order_amount INTEGER                                         │
│ max_discount    INTEGER                                          │
│ usage_limit     INTEGER                                          │
│ usage_count     INTEGER DEFAULT 0                                │
│ per_customer_limit INTEGER DEFAULT 1                             │
│ applies_to      UUID[]                                           │
│ excludes        UUID[]                                           │
│ valid_from      TIMESTAMPTZ                                      │
│ valid_until     TIMESTAMPTZ                                      │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ created_by      UUID FK → profiles.id NOT NULL                   │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, code)                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       cart_sessions                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id NOT NULL                │
│ session_token   VARCHAR(255) UNIQUE NOT NULL                     │
│ customer_email  VARCHAR(255)                                     │
│ items           JSONB NOT NULL DEFAULT '[]'                      │
│ promo_code_id   UUID FK → promo_codes.id                         │
│ subtotal        INTEGER DEFAULT 0                                │
│ discount        INTEGER DEFAULT 0                                │
│ total           INTEGER DEFAULT 0                                │
│ held_slots      UUID[]                                           │
│ expires_at      TIMESTAMPTZ NOT NULL                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ticket_waivers                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ ticket_id       UUID FK → tickets.id NOT NULL                    │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ waiver_type     VARCHAR(100) NOT NULL                            │
│ guest_name      VARCHAR(200) NOT NULL                            │
│ guest_email     VARCHAR(255)                                     │
│ guest_dob       DATE                                             │
│ guardian_name   VARCHAR(200)                                     │
│ guardian_email  VARCHAR(255)                                     │
│ signed_at       TIMESTAMPTZ NOT NULL                             │
│ ip_address      INET                                             │
│ signature_data  TEXT                                             │
│ waiver_version  VARCHAR(50)                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
```

## Lookup Tables

### ticket_categories

Extensible ticket category types. Supports both system defaults and org-specific custom categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Category ID |
| org_id | UUID | FK | Org (NULL = system default) |
| key | VARCHAR(50) | NOT NULL | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | | Category description |
| icon | VARCHAR(50) | | Icon identifier |
| color | VARCHAR(7) | | Hex color code |
| badge_text | VARCHAR(20) | | Badge label (e.g., "BEST VALUE") |
| default_settings | JSONB | DEFAULT '{}' | Default restrictions/settings |
| is_active | BOOLEAN | DEFAULT TRUE | Active for selection |
| sort_order | INTEGER | DEFAULT 0 | Display order |

**Seed Data:**
```sql
INSERT INTO ticket_categories (org_id, key, name, description, icon, color, badge_text) VALUES
  (NULL, 'general', 'General Admission', 'Standard entry ticket', 'ticket', '#6B7280', NULL),
  (NULL, 'vip', 'VIP', 'Premium experience with exclusive access', 'crown', '#F59E0B', 'PREMIUM'),
  (NULL, 'fast_pass', 'Fast Pass', 'Skip-the-line access', 'zap', '#8B5CF6', 'SKIP THE LINE'),
  (NULL, 'group', 'Group', 'Discounted group tickets', 'users', '#10B981', 'SAVE MORE'),
  (NULL, 'season_pass', 'Season Pass', 'Unlimited visits for the season', 'calendar', '#3B82F6', 'BEST VALUE'),
  (NULL, 'combo', 'Combo', 'Bundled tickets for multiple attractions', 'package', '#EC4899', 'BUNDLE & SAVE'),
  (NULL, 'add_on', 'Add-On', 'Additional experiences and upgrades', 'plus-circle', '#14B8A6', NULL);
```

### order_sources

Extensible order source types for attribution tracking. Supports both system defaults and org-specific custom sources with optional partner linking for future affiliate/partner expansion.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Source ID |
| org_id | UUID | FK | Org (NULL = system default) |
| key | VARCHAR(50) | NOT NULL | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | | Source description |
| icon | VARCHAR(50) | | Icon identifier |
| color | VARCHAR(7) | | Hex color code |
| partner_id | UUID | FK | Future partner reference |
| commission_rate | INTEGER | | Commission in basis points |
| is_active | BOOLEAN | DEFAULT TRUE | Active for selection |
| sort_order | INTEGER | DEFAULT 0 | Display order |

**Seed Data:**
```sql
INSERT INTO order_sources (org_id, key, name, description, icon, color) VALUES
  (NULL, 'online', 'Online', 'Direct website purchase', 'globe', '#3B82F6'),
  (NULL, 'box_office', 'Box Office', 'In-person purchase at venue', 'building', '#10B981'),
  (NULL, 'phone', 'Phone', 'Phone order with staff', 'phone', '#8B5CF6'),
  (NULL, 'partner', 'Partner', 'Third-party partner sale', 'handshake', '#F59E0B'),
  (NULL, 'comp', 'Complimentary', 'Complimentary ticket', 'gift', '#EC4899');
```

**Future Partner Expansion:**
When implementing affiliate/partner tracking, add a `partners` table and link via `partner_id`. The `commission_rate` field (in basis points, e.g., 500 = 5%) enables commission tracking per source.

## Enums

```sql
-- ticket_category removed - now uses ticket_categories lookup table
-- order_source removed - now uses order_sources lookup table

CREATE TYPE slot_status AS ENUM (
  'available',
  'limited',
  'sold_out',
  'closed'
);

CREATE TYPE order_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'canceled',
  'refunded',
  'partially_refunded',
  'expired'
);

CREATE TYPE ticket_status AS ENUM (
  'valid',
  'used',
  'voided',
  'expired',
  'transferred'
);

CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed_amount',
  'fixed_price'
);
```

## Tables

### ticket_types

Different ticket products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Ticket type ID |
| org_id | UUID | FK, NOT NULL | Organization |
| attraction_id | UUID | FK, NOT NULL | Attraction |
| season_id | UUID | FK | Season (optional) |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | | Description |
| price | INTEGER | NOT NULL | Price in cents |
| compare_price | INTEGER | | Strike-through price |
| category_id | UUID | FK | Category reference |
| max_per_order | INTEGER | DEFAULT 10 | Max per order |
| min_per_order | INTEGER | DEFAULT 1 | Min per order |
| capacity | INTEGER | | Total available |
| sold_count | INTEGER | DEFAULT 0 | Sold count |
| includes | TEXT[] | | What's included |
| restrictions | JSONB | DEFAULT '{}' | Age/date restrictions |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT TRUE | Active flag |
| available_from | TIMESTAMPTZ | | Sale start |
| available_until | TIMESTAMPTZ | | Sale end |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### time_slots

Timed entry slots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Slot ID |
| attraction_id | UUID | FK, NOT NULL | Attraction |
| date | DATE | NOT NULL | Slot date |
| start_time | TIME | NOT NULL | Start time |
| end_time | TIME | NOT NULL | End time |
| capacity | INTEGER | NOT NULL | Max tickets |
| sold_count | INTEGER | DEFAULT 0 | Sold tickets |
| held_count | INTEGER | DEFAULT 0 | Held in carts |
| status | slot_status | DEFAULT 'available' | Status |
| price_modifier | INTEGER | DEFAULT 0 | Price adjustment |
| notes | TEXT | | Special notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### orders

Customer orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Order ID |
| org_id | UUID | FK, NOT NULL | Organization |
| attraction_id | UUID | FK, NOT NULL | Attraction |
| order_number | VARCHAR(20) | UNIQUE, NOT NULL | Display order # |
| customer_id | UUID | FK | Customer reference |
| customer_email | VARCHAR(255) | NOT NULL | Customer email |
| customer_name | VARCHAR(200) | | Customer name |
| customer_phone | VARCHAR(20) | | Customer phone |
| subtotal | INTEGER | NOT NULL | Subtotal in cents |
| discount_amount | INTEGER | DEFAULT 0 | Discount in cents |
| tax_amount | INTEGER | DEFAULT 0 | Tax in cents |
| total | INTEGER | NOT NULL | Total in cents |
| currency | VARCHAR(3) | DEFAULT 'usd' | Currency |
| status | order_status | DEFAULT 'pending' | Order status |
| payment_id | UUID | FK | Payment reference |
| promo_code_id | UUID | FK | Applied promo |
| source_id | UUID | FK | Order source reference |
| notes | TEXT | | Order notes |
| metadata | JSONB | DEFAULT '{}' | Extra data |
| expires_at | TIMESTAMPTZ | | Pending expiry |
| completed_at | TIMESTAMPTZ | | Completion time |
| canceled_at | TIMESTAMPTZ | | Cancellation time |
| refunded_at | TIMESTAMPTZ | | Refund time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### tickets

Individual tickets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Ticket ID |
| org_id | UUID | FK, NOT NULL | Organization |
| order_id | UUID | FK, NOT NULL | Parent order |
| order_item_id | UUID | FK, NOT NULL | Order item |
| ticket_type_id | UUID | FK, NOT NULL | Ticket type |
| time_slot_id | UUID | FK | Time slot |
| ticket_number | VARCHAR(20) | UNIQUE, NOT NULL | Display number |
| barcode | VARCHAR(50) | UNIQUE, NOT NULL | Scannable code |
| qr_code_url | TEXT | | QR code image |
| guest_name | VARCHAR(200) | | Guest name |
| status | ticket_status | DEFAULT 'valid' | Ticket status |
| checked_in_at | TIMESTAMPTZ | | Check-in time |
| checked_in_by | UUID | FK | Who checked in |
| voided_at | TIMESTAMPTZ | | Void time |
| voided_by | UUID | FK | Who voided |
| void_reason | TEXT | | Void reason |
| transferred_from | UUID | FK | Original ticket |
| metadata | JSONB | DEFAULT '{}' | Extra data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

## Indexes

```sql
-- Ticket types
CREATE INDEX ticket_types_attraction_idx ON ticket_types(attraction_id);
CREATE INDEX ticket_types_active_idx ON ticket_types(attraction_id, is_active)
  WHERE is_active = TRUE;

-- Time slots
CREATE UNIQUE INDEX time_slots_unique_idx ON time_slots(attraction_id, date, start_time);
CREATE INDEX time_slots_date_idx ON time_slots(attraction_id, date);
CREATE INDEX time_slots_available_idx ON time_slots(attraction_id, date, status)
  WHERE status = 'available';

-- Orders
CREATE INDEX orders_org_idx ON orders(org_id);
CREATE INDEX orders_attraction_idx ON orders(attraction_id);
CREATE INDEX orders_customer_idx ON orders(customer_email);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_idx ON orders(created_at DESC);

-- Tickets
CREATE INDEX tickets_order_idx ON tickets(order_id);
CREATE INDEX tickets_barcode_idx ON tickets(barcode);
CREATE INDEX tickets_status_idx ON tickets(status);
CREATE INDEX tickets_slot_idx ON tickets(time_slot_id);

-- Promo codes
CREATE UNIQUE INDEX promo_codes_org_code_idx ON promo_codes(org_id, UPPER(code));
CREATE INDEX promo_codes_active_idx ON promo_codes(org_id, is_active)
  WHERE is_active = TRUE;

-- Cart sessions
CREATE INDEX cart_sessions_expires_idx ON cart_sessions(expires_at);
```

## RLS Policies

```sql
-- Ticket types: Public read for active attractions
CREATE POLICY "Public can view active ticket types"
  ON ticket_types FOR SELECT
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM attractions
      WHERE id = ticket_types.attraction_id
        AND status IN ('published', 'active')
    )
  );

-- Orders: Customers can view own orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (
    customer_email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = orders.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Tickets: Customers can view own tickets
CREATE POLICY "Customers can view own tickets"
  ON tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = tickets.order_id
        AND customer_email = auth.jwt()->>'email'
    )
    OR EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = tickets.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );
```

## Functions

### Generate Order Number

```sql
CREATE OR REPLACE FUNCTION generate_order_number(p_org_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_prefix VARCHAR(3);
  v_sequence INTEGER;
  v_number VARCHAR(20);
BEGIN
  -- Get org prefix (first 3 chars of slug)
  SELECT UPPER(LEFT(slug, 3)) INTO v_prefix FROM organizations WHERE id = p_org_id;

  -- Get next sequence
  SELECT COALESCE(MAX(CAST(RIGHT(order_number, 8) AS INTEGER)), 0) + 1
  INTO v_sequence
  FROM orders
  WHERE org_id = p_org_id;

  v_number := v_prefix || '-' || LPAD(v_sequence::TEXT, 8, '0');
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;
```

### Generate Ticket Barcode

```sql
CREATE OR REPLACE FUNCTION generate_ticket_barcode()
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN UPPER(encode(gen_random_bytes(12), 'hex'));
END;
$$ LANGUAGE plpgsql;
```

### Update Slot Availability

```sql
CREATE OR REPLACE FUNCTION update_slot_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.time_slot_id IS NOT NULL THEN
    UPDATE time_slots
    SET sold_count = sold_count + 1,
        status = CASE
          WHEN sold_count + 1 >= capacity THEN 'sold_out'
          WHEN sold_count + 1 >= capacity * 0.8 THEN 'limited'
          ELSE status
        END
    WHERE id = NEW.time_slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_slot_on_ticket_create
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_counts();
```

## Business Rules

1. **Cart Expiration**: Carts expire after 15 minutes; held slots released.

2. **Order Expiration**: Pending orders expire after 30 minutes.

3. **Refund Rules**: Full refund until 24h before event; 50% until 2h before.

4. **Promo Stacking**: Only one promo code per order.

5. **Capacity Management**: Overbooking not allowed; use held_count for cart holds.

6. **Ticket Transfer**: Tickets can be transferred once before check-in.

## Dependencies

- **F3 Attractions**: attraction_id, season_id references
- **F6 Payments**: payment_id reference

## Migration Order

1. Create enums (slot_status, order_status, ticket_status, discount_type)
2. Create ticket_categories lookup table with seed data
3. Create order_sources lookup table with seed data
4. Create ticket_types table
5. Create time_slots table
6. Create promo_codes table
7. Create orders table
8. Create order_items table
9. Create tickets table
10. Create cart_sessions table
11. Create ticket_waivers table
12. Create indexes
13. Create RLS policies
14. Create helper functions
15. Create triggers
