# Comprehensive Demo Seeding Plan

**Created Date**: 2026-01-05
**Status**: ✅ Complete
**Completed Date**: 2026-01-05
**Dependencies**: F1-F12, F14 complete

---

## Overview

This plan defines a complete, reproducible seed data strategy that provides:
1. Multiple organizations with varying subscription tiers and feature access
2. Complete user accounts covering all roles and scenarios
3. Pre-configured Stripe test accounts for consistent payment testing
4. Rich demo data across all MVP features (F1-F12, F14)
5. Consistent, deterministic UUIDs for reliable E2E testing

## Design Principles

1. **Deterministic IDs**: All UUIDs follow a pattern (`{type}{org#}-{seq}`) for predictability
2. **Password Consistency**: All accounts use `password123` for demos
3. **Realistic Scenarios**: Data tells coherent stories (active season, upcoming events, etc.)
4. **Tier Coverage**: Each org tier has unique scenarios to demonstrate value progression
5. **Stripe Test Mode**: Use Stripe's test account patterns for reproducible payment flows
6. **Complete Coverage**: Seed ALL 60+ tables, not just the obvious ones

---

## Complete Database Schema Reference

### F1-F4: Foundation (23 tables)

| Table | Feature | Description | Seed Priority |
|-------|---------|-------------|---------------|
| `profiles` | F1 | User profiles (1:1 with auth.users) | **Critical** |
| `organizations` | F2 | Organization/tenant records | **Critical** |
| `org_memberships` | F2 | User-to-org relationships with roles | **Critical** |
| `org_invitations` | F2 | Pending invitations | Optional |
| `attraction_types` | F3 | Lookup: attraction categories | System (in migration) |
| `amenity_types` | F3 | Lookup: venue amenities | System (in migration) |
| `attractions` | F3 | Individual attraction/venue records | **Critical** |
| `seasons` | F3 | Operating seasons | **Critical** |
| `operating_hours` | F3 | Hours of operation | Medium |
| `attraction_images` | F3 | Media gallery | Low |
| `attraction_amenities` | F3 | Junction: amenities ↔ attractions | Medium |
| `zones` | F3 | Physical zones within attractions | **Critical** |
| `skill_types` | F4 | Lookup: staff skills | System (in migration) |
| `certification_types` | F4 | Lookup: certifications | System (in migration) |
| `document_types` | F4 | Lookup: document types | System (in migration) |
| `staff_profiles` | F4 | Staff member details | **Critical** |
| `staff_attraction_assignments` | F4 | Staff ↔ attraction assignments | **Critical** |
| `staff_skills` | F4 | Staff skill levels | Medium |
| `staff_certifications` | F4 | Staff certs with expiry | Medium |
| `staff_documents` | F4 | Uploaded documents | Low |
| `staff_waivers` | F4 | Staff waiver signatures | Low |
| `staff_time_entries` | F4 | Clock in/out records | **Critical** |

### F5: Platform Admin (7 tables)

| Table | Description | Seed Priority |
|-------|-------------|---------------|
| `platform_settings` | Key-value configuration | **Critical** |
| `feature_flags` | Feature flag management | **Critical** |
| `audit_logs` | Complete audit trail | Medium |
| `platform_announcements` | System-wide announcements | Medium |
| `announcement_dismissals` | User dismissal tracking | Low |
| `system_health_logs` | Health check logs | Low |
| `rate_limit_rules` | API rate limiting | Low |

### F6: Stripe Payments (4 tables)

| Table | Description | Seed Priority |
|-------|-------------|---------------|
| `stripe_accounts` | Connected Stripe Express accounts | **Critical** |
| `stripe_payouts` | Payout records | Medium |
| `stripe_transactions` | Financial transactions | Medium |
| `stripe_webhooks` | Webhook event log | Low |

### F7B: Scheduling (7 tables)

| Table | Description | Seed Priority |
|-------|-------------|---------------|
| `schedule_roles` | Lookup: shift roles | System (in migration) |
| `schedule_periods` | Scheduling periods | **Critical** |
| `shift_templates` | Recurring shift patterns | **Critical** |
| `staff_availability` | Staff availability windows | **Critical** |
| `schedules` | Individual shift assignments | **Critical** |
| `shift_swaps` | Shift swap requests | Medium |
| `schedule_conflicts` | Detected conflicts | Low |

### F8: Ticketing (10 tables)

| Table | Description | Seed Priority |
|-------|-------------|---------------|
| `ticket_categories` | Lookup: ticket types | System (in migration) |
| `order_sources` | Lookup: order channels | System (in migration) |
| `ticket_types` | Available ticket offerings | **Critical** |
| `time_slots` | Timed entry slots | **Critical** |
| `promo_codes` | Discount codes | Medium |
| `orders` | Ticket orders | **Critical** |
| `order_items` | Line items in orders | **Critical** |
| `tickets` | Individual tickets | **Critical** |
| `cart_sessions` | Shopping cart sessions | Low |
| `ticket_waivers` | Guest waivers for tickets | Low |

### F9: Check-In (4 tables)

| Table | Description | Seed Priority |
|-------|-------------|---------------|
| `check_in_stations` | Check-in points | **Critical** |
| `check_ins` | Check-in records | **Critical** |
| `capacity_snapshots` | Point-in-time capacity | Medium |
| `guest_waivers` | Guest waiver signatures | Medium |

### F10: Inventory (5 tables)

| Table | Description | Seed Priority |
|-------|-------------|---------------|
| `inventory_types` | Lookup: item types | System (in migration) |
| `inventory_categories` | Hierarchical categories | **Critical** |
| `inventory_items` | Individual items | **Critical** |
| `inventory_transactions` | Quantity change audit | Medium |
| `inventory_checkouts` | Item checkouts to staff | **Critical** |

### F11: Virtual Queue (4 tables)

| Table | Description | Seed Priority |
|-------|-------------|---------------|
| `queue_configs` | Queue configuration | **Critical** |
| `queue_entries` | Guest queue entries | **Critical** |
| `queue_notifications` | Notification history | Medium |
| `queue_stats` | Hourly statistics | Medium |

### F12: Notifications (5 tables)

| Table | Description | Seed Priority |
|-------|-------------|---------------|
| `notification_templates` | Reusable templates | **Critical** |
| `notifications` | Notification records | Medium |
| `notification_preferences` | User opt-in/out settings | Medium |
| `push_devices` | Registered push devices | Low |
| `in_app_notifications` | In-app bell entries | Low |

### Summary

| Priority | Count | Tables |
|----------|-------|--------|
| **Critical** | 28 | Core tables that must be seeded for app to function |
| Medium | 15 | Enhances demo but not required |
| Low | 9 | Nice to have, minimal user-facing impact |
| System | 8 | Lookup tables populated by migrations |

**Total: 60 application tables** (plus auth.users, auth.identities managed by Supabase)

---

## Data Relationship Flows

The seed data must demonstrate **complete relationship chains** - not isolated records. Every piece of data should connect to show realistic business flows.

### Flow 1: User → Organization → Staff → Time Entry → Approval

```
auth.users (Jake Morrison - actor1@haunt.dev)
    └── profiles (id: a2000000-...-000005)
        └── org_memberships (role: actor, org: Nightmare Manor)
            └── staff_profiles (employee_id: NM-ACT-001)
                ├── staff_skills (acting: level 5, sfx_makeup: level 4)
                ├── staff_certifications (First Aid, CPR - valid)
                ├── staff_attraction_assignments (Haunted Mansion: primary)
                └── staff_time_entries
                    ├── Entry 1: Oct 3 - 6pm-11pm - APPROVED by manager@haunt.dev
                    ├── Entry 2: Oct 4 - 5pm-12am - APPROVED by manager@haunt.dev
                    └── Entry 3: Oct 5 - 6pm-10pm - PENDING (awaiting approval)
```

### Flow 2: Attraction → Season → Ticket Types → Orders → Tickets → Check-in

```
attractions (The Haunted Mansion)
    └── seasons (Halloween 2025 - active)
        └── ticket_types
            ├── General Admission ($25)
            ├── VIP Experience ($45)
            └── Nightmare Combo ($50)
                └── time_slots
                    ├── Oct 3, 6:00pm (20 capacity, 18 sold)
                    ├── Oct 3, 6:15pm (20 capacity, 20 sold - SOLD OUT)
                    └── Oct 3, 6:30pm (20 capacity, 12 sold)
                        └── orders (NIG-00000001 - John Smith)
                            ├── order_items (2x GA @ $25 = $50)
                            │   └── promo_code applied: HALLOWEEN25 (-$12.50)
                            └── tickets
                                ├── TNIG-0000001 (John Smith) - USED ✓
                                │   └── check_ins (Main Entrance, boxoffice@haunt.dev, 6:05pm)
                                │       └── guest_waivers (signed at check-in)
                                └── TNIG-0000002 (Jane Smith) - USED ✓
                                    └── check_ins (Main Entrance, boxoffice@haunt.dev, 6:05pm)
```

### Flow 3: Staff → Schedule → Shift → Swap Request → Resolution

```
staff_profiles (Jake Morrison)
    └── staff_availability
        ├── Fridays 5pm-12am (recurring, available)
        ├── Saturdays 4pm-1am (recurring, available)
        └── Oct 18 (time_off_pending - family event)

schedules (Nightmare Manor)
    ├── Sep 26 - Jake as Scare Actor, 6pm-11pm (SCHEDULED)
    │   └── shift_swaps
    │       └── DROP request by Jake (pending, expires Sep 24)
    ├── Sep 27 - Jake as Scare Actor, 5pm-12am (SCHEDULED)
    └── Sep 27 - OPEN SHIFT - Scare Actor needed (DRAFT)
        └── shift_swaps
            └── PICKUP offer from Emily (pending)
```

### Flow 4: Inventory → Checkout → Return → Audit Trail

```
inventory_categories (Costumes → Character Costumes)
    └── inventory_items (Victorian Vampire Lord - CST-VAMP-001)
        ├── quantity: 3, min: 2, max: 5
        └── inventory_checkouts
            ├── Checkout #1: Jake Morrison
            │   ├── checked_out_at: Oct 1
            │   ├── checked_out_by: manager@haunt.dev
            │   ├── due_date: Oct 6
            │   ├── condition_out: good
            │   └── status: ACTIVE
            └── Checkout #2: Jake Morrison (RETURNED)
                ├── checked_out_at: Sep 20
                ├── returned_at: Sep 28
                ├── returned_by: manager@haunt.dev
                └── condition_in: good

inventory_transactions (audit trail)
    ├── Sep 1: purchase +3 (initial stock)
    ├── Sep 20: checkout -1 (Jake)
    ├── Sep 28: return +1 (Jake)
    └── Oct 1: checkout -1 (Jake)
```

### Flow 5: Virtual Queue → Notification → Check-in

```
queue_configs (Haunted Mansion Virtual Queue)
    ├── capacity_per_batch: 10
    ├── batch_interval: 5 min
    └── notification_lead_minutes: 10

queue_entries
    ├── HM001A - Johnson Family (4 people)
    │   ├── position: 1
    │   ├── status: waiting
    │   ├── joined_at: 45 min ago
    │   ├── estimated_time: 5 min from now
    │   └── queue_notifications
    │       └── SMS sent: "Your turn is almost ready!" (10 min warning)
    │
    ├── HM010J - Davis Party (2 people)
    │   ├── position: (was 5)
    │   ├── status: checked_in ✓
    │   ├── called_at: 20 min ago
    │   └── check_ins
    │       └── VIP Gate, 7:15pm (linked to queue entry)
    │
    └── HM015N - No-Show Guest
        ├── status: expired
        ├── called_at: 1 hour ago
        └── expired_at: 45 min ago (15 min expiry window)

queue_stats (hourly aggregates)
    ├── 6pm: avg_wait 25min, throughput 40, no_shows 2
    └── 7pm: avg_wait 35min, throughput 35, no_shows 1
```

### Flow 6: Notification Templates → Sends → History → Preferences

```
notification_templates (system)
    ├── queue_ready (SMS template)
    │   └── "Hi {{guest_name}}, your party is ready! Head to {{attraction}} entrance."
    ├── shift_reminder (SMS template)
    │   └── "Reminder: You're scheduled at {{attraction}} tomorrow at {{start_time}}."
    └── order_confirmation (email template)
        └── "Thank you for your order #{{order_number}}..."

notifications (sent history)
    ├── To: Jake Morrison (actor1@haunt.dev)
    │   ├── Channel: sms
    │   ├── Template: shift_reminder
    │   ├── Status: delivered
    │   └── Sent: Oct 2, 6pm
    │
    └── To: John Smith (guest1@example.com)
        ├── Channel: email
        ├── Template: order_confirmation
        ├── Status: delivered
        └── Sent: Sep 28

notification_preferences (Jake Morrison)
    ├── shift_reminders: enabled (sms)
    ├── schedule_changes: enabled (sms, email)
    └── marketing: disabled

push_devices (Jake Morrison)
    └── iPhone - token: abc123..., platform: ios, registered: Sep 15
```

### Flow 7: Order with Full Payment Flow

```
orders (VIP Purchase - Emily Davis)
    ├── order_number: NIG-00000004
    ├── customer: Emily Davis (vipguest@example.com)
    ├── source: online
    ├── promo_code: MANSIONVIP (15% off VIP)
    │
    ├── order_items
    │   └── 2x VIP Experience @ $45 = $90
    │       └── discount: -$13.50 (15%)
    │
    ├── Totals:
    │   ├── subtotal: $90.00
    │   ├── discount: -$13.50
    │   ├── tax: $4.78
    │   └── total: $81.28
    │
    └── stripe_transactions
        ├── stripe_charge_id: ch_xxx
        ├── amount: 8128 (cents)
        ├── platform_fee: 407 (5%)
        ├── stripe_fee: 265
        └── net_amount: 7456 → connected account
```

### Flow 8: Multi-Org Staff (Cross-Organization)

```
auth.users (Freelance Actor - works at multiple haunts)
    └── profiles (id: a0000000-...-000050)
        ├── org_memberships → Nightmare Manor (actor)
        │   └── staff_profiles → schedules, time_entries
        │
        └── org_memberships → Terror Collective (actor)
            └── staff_profiles → schedules, time_entries

(Same user, different roles/data per organization - demonstrates multi-tenancy)
```

### Cross-Reference Matrix

| Entity | References | Referenced By |
|--------|------------|---------------|
| `auth.users` | — | profiles, org_memberships |
| `profiles` | auth.users | org_memberships, audit_logs |
| `organizations` | — | attractions, staff, tickets, inventory, queue, etc. |
| `org_memberships` | organizations, profiles | staff_profiles |
| `attractions` | organizations, attraction_types | zones, seasons, ticket_types, queue_configs |
| `staff_profiles` | org_memberships | time_entries, schedules, checkouts |
| `ticket_types` | attractions, seasons | order_items, tickets |
| `orders` | organizations, promo_codes | order_items, tickets, stripe_transactions |
| `tickets` | orders, ticket_types | check_ins |
| `queue_entries` | queue_configs | queue_notifications, check_ins |

---

| Tier | Org Name | Slug | Features Enabled | Use Case |
|------|----------|------|------------------|----------|
| **Basic** | Spooky Hollow | `spooky-hollow` | ticketing, checkin, time_tracking, notifications | Small seasonal operation, just getting started |
| **Pro** | Nightmare Manor | `nightmare-manor` | Basic + scheduling, inventory, analytics_pro | Established haunt with multiple attractions |
| **Enterprise** | Terror Collective | `terror-collective` | Pro + virtual_queue, sms_notifications, custom_domains | Multi-venue enterprise operation |
| **Onboarding** | New Haunt | `new-haunt` | Basic (default) | Fresh org, Stripe not connected, minimal data |

---

## UUID Patterns

### Prefix Convention
```
a{org}000000-0000-0000-0000-{sequence}  - Users (auth.users / profiles)
b{org}000000-0000-0000-0000-{sequence}  - Organizations
c{org}000000-0000-0000-0000-{sequence}  - Attractions
d{org}000000-0000-0000-0000-{sequence}  - Org Memberships / Staff Profiles
e{org}000000-0000-0000-0000-{sequence}  - Zones / Queue Configs
f{org}000000-0000-0000-0000-{sequence}  - Seasons
7{org}000000-0000-0000-0000-{sequence}  - Schedules / Templates
8{org}000000-0000-0000-0000-{sequence}  - Tickets / Orders
9{org}000000-0000-0000-0000-{sequence}  - Inventory

Org prefixes:
- 0 = Platform/System (super admin, feature flags)
- 1 = Spooky Hollow (Basic tier)
- 2 = Nightmare Manor (Pro tier)
- 3 = Terror Collective (Enterprise tier)
- 4 = New Haunt (Onboarding)
```

---

## User Accounts

### Platform Level
| Email | Password | Role | UUID | Description |
|-------|----------|------|------|-------------|
| `admin@haunt.dev` | password123 | super_admin | a0000000-...-000001 | Platform super admin |
| `support@haunt.dev` | password123 | super_admin | a0000000-...-000002 | Platform support admin |

### Spooky Hollow (Basic - Org 1)
| Email | Password | Org Role | UUID | Description |
|-------|----------|----------|------|-------------|
| `hollow.owner@haunt.dev` | password123 | owner | a1000000-...-000001 | Small haunt owner, runs everything |
| `hollow.actor1@haunt.dev` | password123 | actor | a1000000-...-000002 | Part-time scare actor |
| `hollow.actor2@haunt.dev` | password123 | actor | a1000000-...-000003 | Weekend-only actor |
| `hollow.boxoffice@haunt.dev` | password123 | box_office | a1000000-...-000004 | Ticket sales |

### Nightmare Manor (Pro - Org 2)
| Email | Password | Org Role | UUID | Description |
|-------|----------|----------|------|-------------|
| `owner@haunt.dev` | password123 | owner | a2000000-...-000001 | Marcus Holloway - established owner |
| `admin@nightmare.dev` | password123 | admin | a2000000-...-000002 | Full admin access |
| `manager@haunt.dev` | password123 | manager | a2000000-...-000003 | Sarah Chen - operations manager |
| `hr@haunt.dev` | password123 | hr | a2000000-...-000004 | HR manager |
| `actor1@haunt.dev` | password123 | actor | a2000000-...-000005 | Jake Morrison - lead scare actor |
| `actor2@haunt.dev` | password123 | actor | a2000000-...-000006 | Emily Rodriguez - makeup artist/actor |
| `actor3@haunt.dev` | password123 | actor | a2000000-...-000007 | Mike Thompson - trail specialist |
| `boxoffice@haunt.dev` | password123 | box_office | a2000000-...-000008 | Lisa Park - box office lead |
| `finance@haunt.dev` | password123 | finance | a2000000-...-000009 | Financial reports access |
| `scanner@haunt.dev` | password123 | scanner | a2000000-...-000010 | Gate scanner only |

### Terror Collective (Enterprise - Org 3)
| Email | Password | Org Role | UUID | Description |
|-------|----------|----------|------|-------------|
| `ceo@terror.dev` | password123 | owner | a3000000-...-000001 | CEO - multi-venue owner |
| `coo@terror.dev` | password123 | admin | a3000000-...-000002 | COO - operations oversight |
| `venue1.manager@terror.dev` | password123 | manager | a3000000-...-000003 | Venue 1 manager |
| `venue2.manager@terror.dev` | password123 | manager | a3000000-...-000004 | Venue 2 manager |
| `marketing@terror.dev` | password123 | admin | a3000000-...-000005 | Marketing director |
| `it@terror.dev` | password123 | admin | a3000000-...-000006 | IT admin |

### New Haunt (Onboarding - Org 4)
| Email | Password | Org Role | UUID | Description |
|-------|----------|----------|------|-------------|
| `newowner@haunt.dev` | password123 | owner | a4000000-...-000001 | Brand new user, just signed up |

---

## Stripe Test Account Strategy

### Challenge
Stripe Connect accounts are external and can't be truly "seeded" in the database without corresponding Stripe API entities.

### Solution: Hybrid Approach

1. **Development Environment**: Use Stripe Test Mode with pre-created test accounts
2. **Environment Variables**: Store test account IDs that persist across `db reset`
3. **Onboarding States**: Seed database states that match our test Stripe accounts

### Stripe Test Account IDs (to be pre-created and stored)
```env
# Store these in .env.local after creating test accounts in Stripe Dashboard
STRIPE_TEST_ACCOUNT_BASIC=acct_test_spooky_hollow
STRIPE_TEST_ACCOUNT_PRO=acct_test_nightmare_manor
STRIPE_TEST_ACCOUNT_ENTERPRISE=acct_test_terror_collective
```

### Database Seeding for Stripe
```sql
-- Seed stripe_accounts with real test account IDs from env
-- These accounts should be pre-created in Stripe Test Mode

INSERT INTO stripe_accounts (id, org_id, stripe_account_id, status, charges_enabled, payouts_enabled, details_submitted)
VALUES
  -- Spooky Hollow: Basic tier, fully connected
  ('6s100000-0000-0000-0000-000000000001', 'b1000000-...', '${STRIPE_TEST_ACCOUNT_BASIC}', 'active', TRUE, TRUE, TRUE),

  -- Nightmare Manor: Pro tier, fully connected
  ('6s200000-0000-0000-0000-000000000001', 'b2000000-...', '${STRIPE_TEST_ACCOUNT_PRO}', 'active', TRUE, TRUE, TRUE),

  -- Terror Collective: Enterprise tier, fully connected
  ('6s300000-0000-0000-0000-000000000001', 'b3000000-...', '${STRIPE_TEST_ACCOUNT_ENTERPRISE}', 'active', TRUE, TRUE, TRUE),

  -- New Haunt: Not connected (NULL stripe_account_id)
  -- No entry - forces onboarding flow
```

### One-Time Stripe Setup Script
Create a script to initialize Stripe test accounts:

```bash
# scripts/setup-stripe-test-accounts.sh
# Run ONCE to create persistent test accounts in Stripe

stripe accounts create \
  --type=express \
  --country=US \
  --email=spooky-hollow@test.haunt.dev \
  --metadata[org]="spooky-hollow"
# Save returned acct_xxx ID to .env.local

# Repeat for each org...
```

### Sample Transactions (Seeded)
For orgs with connected Stripe accounts, seed sample transactions:

| Org | Transaction Type | Amount | Status | Description |
|-----|------------------|--------|--------|-------------|
| Nightmare Manor | charge | $125.00 | succeeded | 5x GA tickets |
| Nightmare Manor | charge | $250.00 | succeeded | VIP package |
| Nightmare Manor | refund | $25.00 | succeeded | 1 ticket refund |
| Terror Collective | charge | $500.00 | succeeded | Group booking |
| Terror Collective | charge | $85.00 | disputed | Dispute demo |

---

## Feature Data by Organization

### Spooky Hollow (Basic Tier)

**Attractions**: 1
- Spooky Hollow Haunted Barn (active, small venue)

**Staff**: 4 total
- 1 owner (does everything)
- 2 actors (weekends only)
- 1 box office

**Time Tracking**:
- 10 time entries (mix of approved/pending)
- Simple weekend schedule

**Tickets**:
- 2 ticket types (GA, Child discount)
- 3 time slots per night
- 5 completed orders

**Check-in**:
- 1 check-in station
- 15 check-ins recorded

**Scheduling**: ❌ Not available (Basic tier)
**Inventory**: ❌ Not available (Basic tier)
**Virtual Queue**: ❌ Not available (Basic tier)

---

### Nightmare Manor (Pro Tier)

**Attractions**: 3
- The Haunted Mansion (active, flagship)
- Terror Trail (active, outdoor)
- Escape the Asylum (draft, coming soon)

**Staff**: 10 total (full team)
- Owner, Admin, Manager, HR
- 3 actors with skills/certifications
- Box office, Finance, Scanner

**Time Tracking**:
- 50 time entries across staff
- Various statuses (approved, pending, flagged)

**Scheduling** ✅:
- 2 schedule periods (current, upcoming)
- 10 shift templates
- 20+ scheduled shifts
- 3 shift swap requests
- Staff availability records

**Tickets**:
- 8 ticket types (GA, VIP, Fast Pass, Combos)
- 20 time slots
- 5 promo codes
- 15 completed orders

**Check-in**:
- 4 check-in stations
- 30 check-ins
- 10 waivers signed

**Inventory** ✅:
- 11 categories
- 30 items (costumes, props, makeup, equipment)
- 5 active checkouts
- 5 transaction records
- 3 low-stock alerts

**Virtual Queue**: ❌ Not available (Pro tier)

---

### Terror Collective (Enterprise Tier)

**Attractions**: 5 (across 2 venues)
- Venue 1: Asylum of Shadows, Zombie Outbreak
- Venue 2: Nightmare Factory, Dark Carnival, Children of the Corn

**Staff**: 25+ total
- Corporate: CEO, COO, Marketing, IT
- Venue 1: Manager + 10 staff
- Venue 2: Manager + 10 staff

**All Pro Features** + Enterprise:

**Virtual Queue** ✅:
- Active queues for 3 attractions
- 50 queue entries (various statuses)
- Queue notifications history
- Queue stats (hourly metrics)

**SMS Notifications** ✅:
- 100 notification history records
- 15 templates (system + custom)
- User preferences set
- Push device registrations

**Custom Domains** ✅:
- Subdomain: terror-collective.atrivio.io
- Custom: terror-collective.com (demo)

---

### New Haunt (Onboarding State)

**Purpose**: Demonstrate onboarding flow

**State**:
- Organization created
- Owner account only
- No Stripe connected
- No attractions
- No staff (beyond owner)
- Feature flags at basic defaults

---

## Demo Scenarios

### Scenario 1: Basic Tier Experience
**Login**: `hollow.owner@haunt.dev`
1. View simple dashboard
2. See limited feature set
3. Manage basic tickets
4. Check in guests
5. See "upgrade to unlock" for scheduling/inventory

### Scenario 2: Pro Tier Operations
**Login**: `manager@haunt.dev`
1. Full operations dashboard
2. Manage complex schedules
3. Track inventory checkouts
4. View staff time entries
5. Process ticket orders

### Scenario 3: Enterprise Multi-Venue
**Login**: `ceo@terror.dev`
1. Multi-venue overview
2. Cross-venue analytics
3. Virtual queue management
4. Notification campaigns
5. Custom branding preview

### Scenario 4: New User Onboarding
**Login**: `newowner@haunt.dev`
1. Empty dashboard
2. Setup wizard prompts
3. Stripe connection flow
4. Add first attraction
5. Invite first team member

---

## Implementation Tasks

### Phase 1: Restructure Seed File
- [ ] Task 1.1: Create new UUID schema with org prefixes
- [ ] Task 1.2: Restructure auth.users with all accounts
- [ ] Task 1.3: Create all four organizations
- [ ] Task 1.4: Set up org memberships with correct roles
- [ ] Task 1.5: Configure feature flags per tier

### Phase 2: Foundation Data (F1-F4)
- [ ] Task 2.1: Seed profiles for all users
- [ ] Task 2.2: Create attractions per org
- [ ] Task 2.3: Set up zones for each attraction
- [ ] Task 2.4: Create seasons (past, current, upcoming)
- [ ] Task 2.5: Staff profiles with skills/certifications

### Phase 3: Stripe Integration (F6)
- [ ] Task 3.1: Create setup script for Stripe test accounts
- [ ] Task 3.2: Document Stripe test account setup process
- [ ] Task 3.3: Seed stripe_accounts table
- [ ] Task 3.4: Seed sample transactions
- [ ] Task 3.5: Seed payout records

### Phase 4: Operations Data (F7-F10)
- [ ] Task 4.1: Time entries per org (varying complexity)
- [ ] Task 4.2: Scheduling data for Pro/Enterprise
- [ ] Task 4.3: Ticketing data (types, slots, orders, tickets)
- [ ] Task 4.4: Check-in stations and records
- [ ] Task 4.5: Inventory for Pro/Enterprise

### Phase 5: Engagement Data (F11-F12)
- [ ] Task 5.1: Queue configs for Enterprise
- [ ] Task 5.2: Queue entries (various statuses)
- [ ] Task 5.3: Queue notifications and stats
- [ ] Task 5.4: Notification templates (system + custom)
- [ ] Task 5.5: Notification history
- [ ] Task 5.6: User preferences and push devices

### Phase 6: Platform Data (F5)
- [ ] Task 6.1: Feature flags with tier-based activation
- [ ] Task 6.2: Platform announcements
- [ ] Task 6.3: Audit logs showing activity
- [ ] Task 6.4: System health logs

### Phase 7: Validation
- [ ] Task 7.1: DB reset with new seed
- [ ] Task 7.2: Login test all accounts
- [ ] Task 7.3: Verify feature flag gating
- [ ] Task 7.4: Stripe test transactions
- [ ] Task 7.5: E2E test suite passes

---

## File Structure

```
supabase/
├── seed.sql                    # Main comprehensive seed file
├── seed/
│   ├── 00-reset.sql           # Clean slate (optional)
│   ├── 01-auth-users.sql      # All user accounts
│   ├── 02-organizations.sql   # Orgs and memberships
│   ├── 03-attractions.sql     # Attractions, zones, seasons
│   ├── 04-staff.sql           # Staff profiles, skills, certs
│   ├── 05-stripe.sql          # Stripe accounts, transactions
│   ├── 06-scheduling.sql      # Templates, schedules, availability
│   ├── 07-ticketing.sql       # Types, slots, orders, tickets
│   ├── 08-checkin.sql         # Stations, check-ins, waivers
│   ├── 09-inventory.sql       # Categories, items, checkouts
│   ├── 10-queue.sql           # Queue configs, entries, stats
│   ├── 11-notifications.sql   # Templates, history, preferences
│   └── 12-platform.sql        # Feature flags, announcements, audit logs
└── seed-combined.sql          # Auto-generated from seed/*.sql
```

---

## Test Account Reference Card

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    HAUNT PLATFORM - TEST ACCOUNTS                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ Password for ALL accounts: password123                                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ PLATFORM ADMIN                                                            ║
║   admin@haunt.dev          Super Admin (god mode)                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ SPOOKY HOLLOW (Basic Tier)                                               ║
║   hollow.owner@haunt.dev   Owner                                         ║
║   hollow.actor1@haunt.dev  Actor                                         ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ NIGHTMARE MANOR (Pro Tier) ⭐ Recommended for demos                       ║
║   owner@haunt.dev          Owner - Marcus Holloway                       ║
║   manager@haunt.dev        Manager - Sarah Chen                          ║
║   actor1@haunt.dev         Actor - Jake Morrison                         ║
║   boxoffice@haunt.dev      Box Office - Lisa Park                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ TERROR COLLECTIVE (Enterprise Tier)                                       ║
║   ceo@terror.dev           Owner/CEO                                     ║
║   venue1.manager@terror.dev  Venue 1 Manager                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ NEW HAUNT (Onboarding)                                                    ║
║   newowner@haunt.dev       New user - incomplete setup                   ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## Success Criteria

- [ ] `supabase db reset` creates complete demo environment
- [ ] All 4 organizations accessible with correct feature gating
- [ ] All user accounts can login and see appropriate data
- [ ] Stripe test payments work for connected orgs
- [ ] E2E tests pass using seeded accounts
- [ ] Demo scenarios are walkthrough-ready
- [ ] Documentation includes test account reference

---

## Notes

### On Stripe Test Accounts
Stripe Connect accounts require real API calls to create. The strategy is:
1. Create test accounts once via Stripe Dashboard or API
2. Store account IDs in environment variables
3. Seed references those IDs (they persist across DB resets)
4. Document the one-time setup in CONTRIBUTING.md

### On Email Addresses
Using `@haunt.dev` domain for all test accounts. For production-like testing:
- Configure Mailhog/Mailpit for local email capture
- Or use Resend/SendGrid test mode

### Migration from Current Seed
The current seed has good structure for Nightmare Manor (org 2). We'll:
1. Keep Nightmare Manor as the "flagship" demo org
2. Add Spooky Hollow (basic), Terror Collective (enterprise), New Haunt (onboarding)
3. Expand Nightmare Manor data slightly
4. Add proper feature flag gating
