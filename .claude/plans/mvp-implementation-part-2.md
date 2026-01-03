# Haunt Platform - Implementation Plan Part 2: Operations (F7-F10)

**Created Date**: 2025-12-31
**Last Updated**: 2026-01-03
**Current Session**: F10 Inventory Complete - Part 2 Done!
**Overall Progress**: 100% Complete ✅

> **Note**: Part 2 covers Operations features (F7-F10). Requires Part 1 (MVP F1-F6) to be complete.

## Quick Start for Next Session

**Prerequisites**: MVP (F1-F6) must be complete before starting Part 2 ✅
**Last Completed**: F10 Inventory (Migration, Seed, API, Frontend, 49 E2E tests)
**Currently Working On**: Part 2 Complete - Ready for Part 3 (Engagement)
**Next Action**: Start Part 3 with F11 Virtual Queue

### Agent Assignments by Phase
- **Phase 7 (Database)**: backend-architect
- **Phase 8 (API)**: backend-architect
- **Phase 9 (Frontend)**: frontend-architect
- **Phase 10 (Testing)**: qa, code-reviewer

---

## Progress Overview

| Phase | Name | Status | Features | Notes |
|-------|------|--------|----------|-------|
| 7 | Operations Database | Complete ✅ | F7-F10 | All migrations applied |
| 8 | Operations API | Complete ✅ | F7-F10 | All modules implemented |
| 9 | Operations Frontend | Complete ✅ | F7-F10 | All pages and components built |
| 10 | Operations Testing | Complete ✅ | F7-F10 | 208 tests passing (15+17+45+82+49) |

**Status Legend**: Not Started | In Progress | Complete | Blocked | On Hold

---

## Feature Status Matrix

| Feature | ERD | Migration | Seed Data | API | Frontend | Tests | Status |
|---------|-----|-----------|-----------|-----|----------|-------|--------|
| **F7a** Time Tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (15) | **Complete** |
| **F7b** Scheduling | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (17) | **Complete** |
| **F8** Ticketing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (45) | **Complete** |
| **F9** Check-In | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (82) | **Complete** |
| **F10** Inventory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (49) | **Complete** |

### F7b Scheduling - Complete ✅

#### Database
**Migration**: `supabase/migrations/20260102000001_f7b_scheduling.sql`
- **Tables**: schedule_roles, schedule_periods, shift_templates, staff_availability, schedules, shift_swaps, schedule_conflicts
- **Enums**: schedule_status, availability_type, swap_type, swap_status, period_status, conflict_type
- **Functions**: check_staff_availability(), get_staff_schedules()
- **RLS**: Full row-level security for all tables

**Seed Data**:
- 14 schedule roles (system defaults)
- 2 schedule periods (Halloween 2025)
- 10 shift templates (Fri/Sat/Sun)
- 12 staff availability records
- 10 schedules (7 assigned, 3 unassigned)
- 1 shift swap request (pending)

#### API
**Module**: `apps/api/src/modules/scheduling/`
- **Controllers**: SchedulingController, AvailabilityController, TemplatesController, SwapsController
- **Services**: SchedulingService, AvailabilityService, TemplatesService, SwapsService
- **DTOs**: schedule.dto, availability.dto, template.dto, swap.dto

**API Endpoints**:
- `GET/POST /organizations/:orgId/attractions/:attractionId/schedules` - Schedule CRUD
- `PATCH/DELETE /organizations/:orgId/schedules/:scheduleId` - Update/delete
- `POST /organizations/:orgId/attractions/:attractionId/schedules/publish` - Publish schedules
- `GET /organizations/:orgId/my-schedules` - Staff self-service
- `GET /organizations/:orgId/schedule-roles` - List roles
- `GET/PUT /organizations/:orgId/staff/:staffId/availability` - Availability management
- `POST /organizations/:orgId/staff/:staffId/time-off` - Time off requests
- `GET/POST/PATCH/DELETE /organizations/:orgId/attractions/:attractionId/shift-templates` - Templates CRUD
- `POST /organizations/:orgId/attractions/:attractionId/schedules/generate` - Generate from templates
- `GET/POST /organizations/:orgId/swap-requests` - Swap request management
- `POST /organizations/:orgId/schedules/:scheduleId/swap-request` - Request swap

#### Frontend - Manager Views
| Route | Component | Status |
|-------|-----------|--------|
| `/[orgId]/schedule` | Schedule Dashboard | ✅ |
| `/[orgId]/schedule/calendar` | Week/Day Calendar View | ✅ |
| `/[orgId]/schedule/shifts` | Shifts List (Table View) | ✅ |
| `/[orgId]/schedule/templates` | Shift Templates Management | ✅ |
| `/[orgId]/schedule/availability` | Team Availability Matrix | ✅ |
| `/[orgId]/schedule/swaps` | Swap Request Approvals | ✅ |
| `/[orgId]/schedule/roles` | Schedule Role Management | ✅ |

#### Frontend - Staff Self-Service
| Route | Component | Status |
|-------|-----------|--------|
| `/[orgId]/time/schedule` | My Schedule View | ✅ |
| `/[orgId]/time/availability` | My Availability | ✅ |
| `/[orgId]/time/swaps` | My Swap Requests | ✅ |

#### Key Components
- `apps/web/src/components/features/scheduling/schedule-table.tsx`
- `apps/web/src/components/features/scheduling/schedule-week-view.tsx`
- `apps/web/src/components/features/scheduling/shift-form-dialog.tsx`
- `apps/web/src/components/features/scheduling/availability-matrix.tsx`
- `apps/web/src/components/features/scheduling/generate-schedules-dialog.tsx`

#### Bug Fixes Applied
- Fixed TenantGuard to support org slugs (not just UUIDs) - `apps/api/src/core/tenancy/guards/tenant.guard.ts`
- Fixed SwapsService column references (`requesting_staff_id` → `requested_by`)
- Added FK hints for PostgREST ambiguous relationships
- Fixed `getActiveClockedIn` FK join path in `time.service.ts` (changed from `org_memberships!staff_id` to `staff_profiles!staff_id` → `org_memberships!staff_profiles_id_fkey`)

#### E2E Tests Created
**File**: `apps/api/test/e2e/scheduling.spec.ts` (17 tests)
- GET /organizations/:orgId/attractions/:attractionId/schedules (UUID, slug, date filter, role restriction)
- GET /organizations/:orgId/attractions/:attractionId/shift-templates
- GET /organizations/:orgId/staff/:staffId/availability (role restriction)
- GET /organizations/:orgId/swap-requests (role restriction)
- GET /organizations/:orgId/schedule-roles
- GET /organizations/:orgId/my-schedules (self-service)
- GET /organizations/:orgId/my-swap-requests (self-service)

### F7a Time Tracking - Completed Features
- **Quick Time Page**: `/:orgSlug/time` - Mobile-first clock in/out
- **Dashboard Widget**: `TimeClockWidget` on org dashboard
- **Manager Status View**: `/:orgSlug/time/status` - Real-time staff status
- **API Endpoints**:
  - `GET /organizations/:orgId/time/my-status` - Self-service status
  - `POST /organizations/:orgId/time/clock-in` - Self-service clock in
  - `POST /organizations/:orgId/time/clock-out` - Self-service clock out
  - `GET /organizations/:orgId/time/active` - Manager view (role-restricted)
  - `GET /organizations/by-slug/:slug` - Public org lookup

#### E2E Tests Created
**File**: `apps/api/test/e2e/time-tracking.spec.ts` (15 tests)
- GET /organizations/:orgId/time/my-status (UUID, slug, auth, super admin)
- POST /organizations/:orgId/time/clock-in (success, slug, double clock-in, auth)
- POST /organizations/:orgId/time/clock-out (success, not clocked in)
- GET /organizations/:orgId/time/active (manager, owner, role restriction)
- GET /organizations/by-slug/:slug (success, 404)

### F8 Ticketing - Complete ✅

#### Database
**Migration**: `supabase/migrations/20260102000002_f8_ticketing.sql`
- **Tables**: ticket_categories, ticket_types, time_slots, promo_codes, order_sources, orders, order_items, tickets, cart_sessions
- **Enums**: ticket_category_enum, order_status, ticket_status, order_source_enum
- **Functions**: generate_order_number(), check_time_slot_availability()
- **RLS**: Full row-level security for all tables

**Seed Data**:
- 7 ticket categories (system defaults: GA, VIP, Fast Pass, Group, Season, Combo, Special)
- 5 order sources (system defaults: online, box_office, phone, partner, comp)
- 6 ticket types for Nightmare Manor (GA, VIP, Fast Pass, Family Pack, Season Pass)
- 30 time slots (6:00 PM - 10:30 PM, Oct 15-30)
- 3 promo codes (SCARY10, VIPSPECIAL, EARLYBIRD)
- 3 orders with 6 order items and 6 tickets

#### API
**Module**: `apps/api/src/modules/ticketing/` (10 files)
- **Controllers**: TicketTypesController, TimeSlotsController, PromoCodesController, OrdersController
- **Services**: TicketTypesService, TimeSlotsService, PromoCodesService, OrdersService
- **DTOs**: ticket-type.dto, time-slot.dto, promo-code.dto, order.dto

**API Endpoints**:

*Ticket Types*:
- `GET /organizations/:orgId/ticket-types` - List ticket types
- `GET /organizations/:orgId/ticket-types/:id` - Get ticket type
- `POST /organizations/:orgId/ticket-types` - Create ticket type
- `PATCH /organizations/:orgId/ticket-types/:id` - Update ticket type
- `DELETE /organizations/:orgId/ticket-types/:id` - Delete ticket type
- `GET /organizations/:orgId/ticket-categories` - List categories

*Time Slots*:
- `GET /organizations/:orgId/attractions/:attractionId/time-slots` - List time slots
- `GET /organizations/:orgId/time-slots/:id` - Get time slot
- `POST /organizations/:orgId/attractions/:attractionId/time-slots` - Create time slot
- `POST /organizations/:orgId/attractions/:attractionId/time-slots/bulk` - Create bulk time slots
- `PATCH /organizations/:orgId/time-slots/:id` - Update time slot
- `DELETE /organizations/:orgId/time-slots/:id` - Delete time slot

*Promo Codes*:
- `GET /organizations/:orgId/promo-codes` - List promo codes
- `GET /organizations/:orgId/promo-codes/:id` - Get promo code
- `POST /organizations/:orgId/promo-codes` - Create promo code
- `PATCH /organizations/:orgId/promo-codes/:id` - Update promo code
- `DELETE /organizations/:orgId/promo-codes/:id` - Delete promo code
- `POST /organizations/:orgId/promo-codes/validate` - Validate promo code

*Orders & Tickets*:
- `GET /organizations/:orgId/orders` - List orders
- `GET /organizations/:orgId/orders/:orderId` - Get order
- `GET /organizations/:orgId/orders/number/:orderNumber` - Get by order number
- `POST /organizations/:orgId/orders` - Create order (box office)
- `PATCH /organizations/:orgId/orders/:orderId` - Update order
- `POST /organizations/:orgId/orders/:orderId/complete` - Complete order
- `POST /organizations/:orgId/orders/:orderId/cancel` - Cancel order
- `POST /organizations/:orgId/orders/:orderId/refund` - Refund order
- `GET /organizations/:orgId/tickets/:ticketId` - Get ticket
- `GET /organizations/:orgId/tickets/barcode/:barcode` - Get by barcode
- `PATCH /organizations/:orgId/tickets/:ticketId/status` - Update ticket status
- `POST /organizations/:orgId/tickets/validate` - Validate ticket
- `POST /organizations/:orgId/tickets/scan` - Scan ticket (validate + mark used)

*Cart Sessions*:
- `POST /organizations/:orgId/cart` - Create/update cart
- `GET /organizations/:orgId/cart/:sessionId` - Get cart
- `POST /organizations/:orgId/cart/checkout` - Checkout cart

#### Frontend - Manager Views
| Route | Component | Status |
|-------|-----------|--------|
| `/[orgId]/ticketing` | Ticketing Dashboard | ✅ |
| `/[orgId]/ticketing/ticket-types` | Ticket Types Management | ✅ |
| `/[orgId]/ticketing/time-slots` | Time Slots Management | ✅ |
| `/[orgId]/ticketing/promo-codes` | Promo Codes Management | ✅ |
| `/[orgId]/ticketing/orders` | Orders Management | ✅ |

#### Key Components
- `apps/web/src/app/(dashboard)/[orgId]/ticketing/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/ticketing/ticket-types/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/ticketing/time-slots/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/ticketing/promo-codes/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/ticketing/orders/page.tsx`

#### Bug Fixes Applied
- Fixed cart session column names (`cart_data` → `items`, `discount_amount` → `discount`)
- Added `session_token` generation for cart sessions
- Fixed bulk time slots to use random date offset (avoid duplicate key constraint)
- Fixed ticket scanning response structure (nested under `ticket`)
- Fixed `generateBarcode()` to use hex encoding (predictable 12 chars)
- Fixed checkout method to use `cart.items` instead of `cart.cart_data.items`

#### E2E Tests Created
**File**: `apps/api/test/e2e/ticketing.spec.ts` (45 tests)

*Ticket Types (9 tests)*:
- List ticket types (authenticated, role restriction)
- Get single ticket type
- Create ticket type (success, validation)
- Update ticket type
- Delete ticket type
- List ticket categories

*Time Slots (11 tests)*:
- List time slots (date filter, role restriction)
- Get single time slot
- Create time slot (success, validation)
- Create bulk time slots
- Update time slot
- Delete time slot

*Promo Codes (10 tests)*:
- List promo codes (role restriction)
- Get single promo code
- Create promo code (success, validation)
- Validate promo code (valid, expired, max uses)
- Update promo code
- Delete promo code

*Orders & Tickets (15 tests)*:
- List orders (role restriction)
- Get order by ID and order number
- Create order (success, validation)
- Complete order and generate tickets
- Cancel order
- Refund order
- Get ticket by ID and barcode
- Update ticket status
- Validate ticket
- Scan ticket (success, already scanned)
- Cart session CRUD
- Cart checkout flow

### F9 Check-In - Complete ✅

#### Database
**Migration**: `supabase/migrations/20260102000003_f9_check_in.sql`
- **Tables**: check_in_stations, check_ins, capacity_snapshots, guest_waivers
- **Enums**: check_in_method, check_in_status, waiver_status
- **Functions**: get_current_capacity(), increment_capacity_snapshot()
- **RLS**: Full row-level security for all tables

**Seed Data**:
- 3 check-in stations (Main Entrance, VIP Entrance, Side Entrance)
- 8 check-ins for existing tickets
- 3 capacity snapshots

#### API
**Module**: `apps/api/src/modules/check-in/` (7 files)
- **Controllers**: CheckInController, StationsController
- **Services**: CheckInService, StationsService
- **DTOs**: scan-check-in.dto, manual-check-in.dto, station.dto

**API Endpoints**:

*Scanning*:
- `POST /organizations/:orgId/check-ins/scan` - Scan barcode/QR check-in
- `POST /organizations/:orgId/check-ins/manual` - Manual lookup check-in
- `POST /organizations/:orgId/check-ins/walk-up` - Walk-up (no ticket) check-in

*Check-In Management*:
- `GET /organizations/:orgId/check-ins` - List check-ins (with filters)
- `GET /organizations/:orgId/check-ins/:id` - Get check-in details
- `POST /organizations/:orgId/check-ins/:id/void` - Void a check-in

*Stations*:
- `GET /organizations/:orgId/check-in-stations` - List stations
- `GET /organizations/:orgId/check-in-stations/:id` - Get station
- `POST /organizations/:orgId/check-in-stations` - Create station
- `PATCH /organizations/:orgId/check-in-stations/:id` - Update station
- `DELETE /organizations/:orgId/check-in-stations/:id` - Delete station
- `POST /organizations/:orgId/check-in-stations/:id/toggle` - Toggle active

*Capacity*:
- `GET /organizations/:orgId/attractions/:attractionId/capacity` - Get current capacity
- `GET /organizations/:orgId/attractions/:attractionId/capacity/history` - Capacity history

*Waivers*:
- `POST /organizations/:orgId/check-ins/:id/waiver` - Submit waiver
- `GET /organizations/:orgId/check-ins/:id/waiver` - Get waiver status

#### Frontend - Manager Views
| Route | Component | Status |
|-------|-----------|--------|
| `/[orgId]/check-in` | Check-In Dashboard | ✅ |
| `/[orgId]/check-in/scan` | Barcode Scanner Interface | ✅ |
| `/[orgId]/check-in/stations` | Station Management | ✅ |
| `/[orgId]/check-in/queue` | Guest Queue / Pending Arrivals | ✅ |
| `/[orgId]/check-in/reports` | Check-In Statistics | ✅ |

#### Key Components
- `apps/web/src/app/(dashboard)/[orgId]/check-in/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/check-in/scan/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/check-in/stations/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/check-in/queue/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/check-in/reports/page.tsx`

#### Bug Fixes Applied
- Fixed ticket query to not select non-existent `requires_waiver` column from ticket_types
- Defaulted waiver requirement to false until column is added

#### E2E Tests Created
**File**: `apps/api/test/e2e/check-in.spec.ts` (82 tests)

*Check-In Stations (15 tests)*:
- List stations (authenticated, role restriction)
- Get single station
- Create station (success, validation)
- Update station
- Delete station
- Toggle station active status

*Scanning Check-Ins (25 tests)*:
- Scan valid barcode (first check-in)
- Reject invalid barcode (ticket not found)
- Reject already used ticket
- Reject cancelled ticket
- QR code scan
- Station tracking

*Manual Check-Ins (12 tests)*:
- Manual lookup by order number
- Manual lookup by customer email
- Walk-up check-in creation
- Validation errors

*Capacity Management (15 tests)*:
- Get current capacity
- Capacity increments on check-in
- Capacity history tracking
- Multi-attraction capacity

*Waivers (10 tests)*:
- Submit waiver for check-in
- Guardian info for minors
- Waiver status tracking

*Void Check-Ins (5 tests)*:
- Void check-in decrements capacity
- Role restrictions on void

### F10 Inventory - Complete ✅

#### Database
**Migration**: `supabase/migrations/20260102000004_f10_inventory.sql`
- **Tables**: inventory_categories, inventory_types, inventory_items, inventory_transactions, inventory_checkouts
- **Enums**: inventory_transaction_type, checkout_condition
- **Triggers**: tr_update_inventory_on_checkout (auto-adjusts quantity on checkout/return)
- **Functions**: adjust_inventory_quantity()
- **RLS**: Full row-level security for all tables

**Seed Data**:
- 8 system-level inventory types (costume, prop, makeup, equipment, lighting, audio, safety, consumable)
- 5 inventory categories (Costumes, Props, Electronics, Consumables, Safety)
- 5 sub-categories (Character Costumes, Handheld Props, Lighting, Audio, Safety Equipment)
- 25 inventory items across all categories
- 6 inventory checkouts (5 active, 1 returned)

#### API
**Module**: `apps/api/src/modules/inventory/` (7 files)
- **Controllers**: InventoryController, CheckoutsController, CategoriesController
- **Services**: InventoryService, CheckoutsService, CategoriesService
- **DTOs**: item.dto, checkout.dto, category.dto, transaction.dto

**API Endpoints**:

*Summary*:
- `GET /organizations:orgId/inventory/summary` - Dashboard overview with counts, low stock alerts, active checkouts

*Items*:
- `GET /organizations:orgId/inventory/items` - List items (with filters: category, type, search, low stock)
- `GET /organizations:orgId/inventory/items/:id` - Get item details
- `POST /organizations:orgId/inventory/items` - Create item
- `PATCH /organizations:orgId/inventory/items/:id` - Update item
- `DELETE /organizations:orgId/inventory/items/:id` - Deactivate item
- `POST /organizations:orgId/inventory/items/:id/adjust` - Adjust quantity with reason

*Categories*:
- `GET /organizations:orgId/inventory/categories` - List categories (hierarchical)
- `GET /organizations:orgId/inventory/categories/:id` - Get category
- `POST /organizations:orgId/inventory/categories` - Create category
- `PATCH /organizations:orgId/inventory/categories/:id` - Update category
- `DELETE /organizations:orgId/inventory/categories/:id` - Delete category

*Types*:
- `GET /organizations:orgId/inventory/types` - List types (system + org)
- `POST /organizations:orgId/inventory/types` - Create custom type
- `PATCH /organizations:orgId/inventory/types/:id` - Update type
- `DELETE /organizations:orgId/inventory/types/:id` - Delete type (if unused)

*Checkouts*:
- `GET /organizations:orgId/inventory/checkouts` - List checkouts (with filters)
- `GET /organizations:orgId/inventory/checkouts/overdue` - Overdue checkouts
- `GET /organizations:orgId/inventory/checkouts/:id` - Get checkout
- `POST /organizations:orgId/inventory/checkouts` - Create checkout (assigns item to staff)
- `POST /organizations:orgId/inventory/checkouts/:id/return` - Return checkout

*Staff Checkouts*:
- `GET /organizations:orgId/staff/:staffId/checkouts` - Active checkouts for staff member

*Transactions*:
- `GET /organizations:orgId/inventory/items/:id/transactions` - Transaction history for item

#### Frontend - Manager Views
| Route | Component | Status |
|-------|-----------|--------|
| `/[orgId]/inventory` | Inventory Dashboard | ✅ |
| `/[orgId]/inventory/items` | Item Management | ✅ |
| `/[orgId]/inventory/items/[itemId]` | Item Details | ✅ |
| `/[orgId]/inventory/checkouts` | Checkout Management | ✅ |
| `/[orgId]/inventory/categories` | Category Management | ✅ |
| `/[orgId]/inventory/types` | Type Configuration | ✅ |
| `/[orgId]/inventory/reports` | Inventory Reports | ✅ |

#### Key Components
- `apps/web/src/app/(dashboard)/[orgId]/inventory/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/inventory/items/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/inventory/checkouts/page.tsx`
- `apps/web/src/app/(dashboard)/[orgId]/inventory/categories/page.tsx`

#### E2E Tests Created
**File**: `apps/api/test/e2e/inventory.spec.ts` (49 tests)

*Inventory Summary (6 tests)*:
- Get summary as owner
- Get summary by slug
- Role restrictions (actor denied)

*Inventory Items (14 tests)*:
- List items (authenticated, with filters)
- Get single item
- Create item (success, validation)
- Update item
- Delete (deactivate) item
- Adjust quantity with reasons

*Inventory Categories (8 tests)*:
- List categories (hierarchical)
- Get single category
- Create category (root and sub-category)
- Update category
- Delete category

*Inventory Types (6 tests)*:
- List types (system + custom)
- Create custom type
- Update custom type
- Delete custom type (only if unused)

*Inventory Checkouts (15 tests)*:
- List checkouts (with filters)
- Get single checkout
- Create checkout (assigns to staff)
- Return checkout (updates quantity)
- Reject double return
- Get overdue checkouts
- Get staff active checkouts

---

## Seed Data Strategy (F7-F10)

### Purpose
Comprehensive seed data for operations features enables:
1. **Demo**: Show scheduling, ticketing, and check-in workflows
2. **Testing**: Realistic data for E2E tests
3. **Development**: Consistent environment for building features

### Seed Data by Feature

#### F7: Scheduling
**File**: `infrastructure/supabase/seed.sql` (extend)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Schedule Roles | 14 | System defaults (actor, security, makeup, etc.) |
| Shift Templates | 10 | Recurring shifts for different attractions |
| Staff Availability | 15 | Mix of available, unavailable, preferred |
| Schedules | 30 | Published schedules for current season |
| Shift Swaps | 5 | Pending, approved, rejected examples |
| Schedule Periods | 3 | Draft, published, locked periods |

**Demo Scenarios**:
- Manager views weekly schedule grid
- Staff member submits availability
- Shift swap request and approval flow
- Auto-generated schedule from templates

#### F8: Ticketing
**File**: `infrastructure/supabase/seed.sql` (extend)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Ticket Categories | 7 | System defaults (GA, VIP, Fast Pass, etc.) |
| Ticket Types | 8 | Various prices and restrictions |
| Time Slots | 20 | Next 2 weeks of timed entry slots |
| Promo Codes | 5 | Active, expired, usage-limited codes |
| Orders | 15 | Completed, pending, refunded |
| Order Items | 25 | Multiple items per order |
| Tickets | 40 | Valid, used, voided examples |
| Order Sources | 5 | System defaults (online, box office, etc.) |

**Demo Scenarios**:
- Customer purchases tickets online
- Apply promo code at checkout
- Box office creates walk-up order
- View order history and tickets

#### F9: Check-In
**File**: `infrastructure/supabase/seed.sql` (extend)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Check-In Stations | 4 | Main entrance, VIP entrance, etc. |
| Check-Ins | 25 | Recent check-in activity |
| Capacity Snapshots | 50 | Hourly capacity tracking |
| Guest Waivers | 15 | Signed waivers with guardian info |

**Demo Scenarios**:
- Scan ticket barcode to check in
- View real-time capacity dashboard
- Guest signs waiver at check-in
- Handle early/late arrivals

#### F10: Inventory
**File**: `infrastructure/supabase/seed.sql` (extend)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Inventory Types | 9 | System defaults (costume, prop, makeup, etc.) |
| Inventory Categories | 8 | Hierarchical categories |
| Inventory Items | 30 | Various items with quantities |
| Inventory Transactions | 50 | Purchase, checkout, return history |
| Inventory Checkouts | 10 | Active checkouts to staff |

**Demo Scenarios**:
- Browse inventory by category
- Check out costume to staff member
- Record low stock alert
- Track item condition over time

### Test Accounts for Operations

| Email | Password | Role | Demo Purpose |
|-------|----------|------|--------------|
| `scheduler@haunt.dev` | `password123` | Manager | Schedule management |
| `ticketing@haunt.dev` | `password123` | Box Office | Ticket sales |
| `checkin@haunt.dev` | `password123` | Scanner | Check-in operations |
| `inventory@haunt.dev` | `password123` | Manager | Inventory management |

---

## Phase 7: Operations Database (F7-F10)

### Objectives
- Implement scheduling, ticketing, check-in, and inventory schemas
- Create lookup tables with seed data
- Set up RLS policies for role-based access

### Tasks
- [ ] Task 1: Review and refine F7 Scheduling ERD
  - **Agent**: backend-architect
  - Dependencies: F4 Staff complete
  - Acceptance criteria: schedule_roles, schedules, availability, templates, swaps tables
- [ ] Task 2: Review and refine F8 Ticketing ERD
  - **Agent**: backend-architect
  - Dependencies: F3 Attractions, F6 Payments complete
  - Acceptance criteria: ticket_types, time_slots, orders, tickets, promo_codes tables
- [ ] Task 3: Review and refine F9 Check-In ERD
  - **Agent**: backend-architect
  - Dependencies: F8 Ticketing complete
  - Acceptance criteria: check_ins, stations, capacity_snapshots, waivers tables
- [ ] Task 4: Review and refine F10 Inventory ERD
  - **Agent**: backend-architect
  - Dependencies: F3 Attractions, F4 Staff complete
  - Acceptance criteria: inventory_items, categories, transactions, checkouts tables
- [ ] Task 5: Write migration for F7-F10
  - **Agent**: backend-architect
  - Dependencies: Tasks 1-4
  - Acceptance criteria: `002_operations.sql` migration runs clean
- [ ] Task 6: Create seed data for F7-F10
  - **Agent**: backend-architect
  - Dependencies: Task 5
  - Acceptance criteria:
    - 14 schedule roles (system defaults)
    - 30+ schedules with shifts for demo
    - 8 ticket types across attractions
    - 20 time slots for next 2 weeks
    - 5 promo codes (active/expired)
    - 15 completed orders with tickets
    - 30 inventory items with categories
    - Check-in stations and recent activity

### Phase Summary
**Status**: Not Started

---

## Phase 8: Operations API (F7-F10)

### Objectives
- Build NestJS modules for scheduling, ticketing, check-in, inventory
- Implement complex business logic (availability checking, capacity management)

### Tasks
- [ ] Task 1: Build modules/scheduling
  - **Agent**: backend-architect
  - Dependencies: Phase 7
  - Acceptance criteria:
    - Schedules CRUD with conflict detection
    - Staff availability management
    - Shift templates and generation
    - Shift swap request workflow
- [ ] Task 2: Build modules/ticketing
  - **Agent**: backend-architect
  - Dependencies: Phase 7
  - Acceptance criteria:
    - Ticket types and time slots CRUD
    - Order creation with cart flow
    - Promo code validation
    - Ticket generation with barcodes
- [ ] Task 3: Build modules/checkin
  - **Agent**: backend-architect
  - Dependencies: Task 2
  - Acceptance criteria:
    - Barcode/QR scan endpoint
    - Real-time capacity tracking
    - Waiver management
    - Check-in station tracking
- [ ] Task 4: Build modules/inventory
  - **Agent**: backend-architect
  - Dependencies: Phase 7
  - Acceptance criteria:
    - Items and categories CRUD
    - Checkout/return workflow
    - Transaction history
    - Low stock alerts
- [ ] Task 5: Verify seed data via API
  - **Agent**: backend-architect
  - Dependencies: Tasks 1-4
  - Acceptance criteria:
    - All schedules return with staff and roles
    - Ticket types show availability
    - Check-in endpoint validates tickets
    - Inventory items show current quantities

### Phase Summary
**Status**: Not Started

---

## Phase 9: Operations Frontend (F7-F10)

### Objectives
- Build scheduling calendar and management UI
- Build ticketing and box office interface
- Build check-in scanner and capacity dashboard
- Build inventory management interface

### Tasks
- [ ] Task 1: Create scheduling pages
  - **Agent**: frontend-architect
  - Dependencies: Phase 8
  - Acceptance criteria:
    - Weekly/daily schedule grid view
    - Drag-and-drop shift assignment
    - Staff availability calendar
    - Shift swap request/approval UI
- [ ] Task 2: Create ticketing pages
  - **Agent**: frontend-architect
  - Dependencies: Phase 8
  - Acceptance criteria:
    - Ticket type management
    - Time slot configuration
    - Promo code management
    - Order lookup and management
    - Box office POS interface
- [ ] Task 3: Create check-in pages
  - **Agent**: frontend-architect
  - Dependencies: Phase 8
  - Acceptance criteria:
    - Barcode scanner interface
    - Real-time capacity dashboard
    - Waiver signature capture
    - Check-in history and stats
- [ ] Task 4: Create inventory pages
  - **Agent**: frontend-architect
  - Dependencies: Phase 8
  - Acceptance criteria:
    - Inventory list with filtering
    - Item detail and history
    - Checkout/return workflow
    - Low stock alerts dashboard
- [ ] Task 5: Verify UI displays seed data correctly
  - **Agent**: frontend-architect
  - Dependencies: Tasks 1-4
  - Acceptance criteria:
    - Schedule shows 30 seeded shifts
    - Ticket types display with pricing
    - Check-in history shows recent activity
    - Inventory shows all seeded items

### Phase Summary
**Status**: Not Started

---

## Phase 10: Operations Testing (F7-F10)

### Objectives
- E2E testing of operations workflows
- Integration testing of complex business logic

### Tasks
- [x] Task 1: Create F7 Time Tracking E2E tests ✅
  - **Agent**: qa
  - **File**: `apps/api/test/e2e/time-tracking.spec.ts`
  - 15 tests covering:
    - GET /time/my-status (UUID, slug, auth, super admin)
    - POST /time/clock-in (success, slug, double clock-in, auth)
    - POST /time/clock-out (success, not clocked in)
    - GET /time/active (manager, owner, role restriction)
    - GET /organizations/by-slug/:slug (success, 404)
- [x] Task 2: Create F7 Scheduling E2E tests ✅
  - **Agent**: qa
  - **File**: `apps/api/test/e2e/scheduling.spec.ts`
  - 17 tests covering:
    - GET schedules (UUID, slug, date filter, role restriction)
    - GET shift-templates
    - GET staff availability (role restriction)
    - GET swap-requests (role restriction)
    - GET schedule-roles
    - GET my-schedules (self-service)
    - GET my-swap-requests (self-service)
- [x] Task 3: Create ticketing E2E tests ✅
  - **Agent**: qa
  - **File**: `apps/api/test/e2e/ticketing.spec.ts`
  - 45 tests covering:
    - Ticket types CRUD (9 tests)
    - Time slots management with bulk creation (11 tests)
    - Promo codes with validation (10 tests)
    - Orders, tickets, cart sessions, checkout (15 tests)
- [x] Task 4: Create check-in E2E tests ✅
  - **Agent**: qa
  - **File**: `apps/api/test/e2e/check-in.spec.ts`
  - 82 tests covering:
    - Check-in stations CRUD (15 tests)
    - Scanning check-ins (25 tests)
    - Manual check-ins (12 tests)
    - Capacity management (15 tests)
    - Waivers (10 tests)
    - Void check-ins (5 tests)
- [ ] Task 5: Create inventory E2E tests
  - **Agent**: qa
  - Dependencies: F10 Inventory complete
  - Acceptance criteria:
    - Checkout item to staff
    - Return item with condition update
    - Generate low stock alert
- [ ] Task 6: Verify seed data integrity
  - **Agent**: qa
  - Dependencies: Tasks 3-5
  - Acceptance criteria:
    - All seeded schedules accessible
    - All seeded tickets scannable
    - All seeded inventory checkable

### Phase Summary
**Status**: In Progress (F7 + F8 + F9 Complete - 159 tests passing)

---

## Key Files & Components (Part 2)

### F7a Time Tracking Files (Complete)
| File Path | Purpose | Status |
|-----------|---------|--------|
| `apps/api/src/modules/staff/time.controller.ts` | Time clock API endpoints | ✅ Complete |
| `apps/api/src/modules/staff/time.service.ts` | Time clock business logic | ✅ Complete |
| `apps/api/src/modules/organizations/organizations.controller.ts` | Added public slug lookup | ✅ Complete |
| `apps/web/src/app/(time)/[orgId]/time/page.tsx` | Quick clock in/out page | ✅ Complete |
| `apps/web/src/app/(time)/[orgId]/time/layout.tsx` | Minimal time clock layout | ✅ Complete |
| `apps/web/src/app/(time)/[orgId]/time/status/page.tsx` | Manager status view | ✅ Complete |
| `apps/web/src/components/features/time-clock/time-clock-widget.tsx` | Dashboard widget | ✅ Complete |
| `apps/web/src/components/features/time-clock/clock-status-badge.tsx` | Sidebar badge | ✅ Complete |
| `apps/web/src/lib/api/client.ts` | Added time clock API functions | ✅ Complete |
| `apps/api/test/e2e/time-tracking.spec.ts` | E2E tests (15 tests) | ✅ Complete |
| `apps/api/test/e2e/scheduling.spec.ts` | E2E tests (17 tests) | ✅ Complete |

### F8 Ticketing Files (Complete)
| File Path | Purpose | Status |
|-----------|---------|--------|
| `infrastructure/supabase/migrations/20260102000002_f8_ticketing.sql` | Ticketing schema | ✅ Complete |
| `apps/api/src/modules/ticketing/ticketing.module.ts` | NestJS module | ✅ Complete |
| `apps/api/src/modules/ticketing/ticket-types.controller.ts` | Ticket types API | ✅ Complete |
| `apps/api/src/modules/ticketing/ticket-types.service.ts` | Ticket types logic | ✅ Complete |
| `apps/api/src/modules/ticketing/time-slots.controller.ts` | Time slots API | ✅ Complete |
| `apps/api/src/modules/ticketing/time-slots.service.ts` | Time slots logic | ✅ Complete |
| `apps/api/src/modules/ticketing/promo-codes.controller.ts` | Promo codes API | ✅ Complete |
| `apps/api/src/modules/ticketing/promo-codes.service.ts` | Promo codes logic | ✅ Complete |
| `apps/api/src/modules/ticketing/orders.controller.ts` | Orders & tickets API | ✅ Complete |
| `apps/api/src/modules/ticketing/orders.service.ts` | Orders & cart logic | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/ticketing/page.tsx` | Dashboard | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/ticketing/ticket-types/page.tsx` | Ticket types UI | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/ticketing/time-slots/page.tsx` | Time slots UI | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/ticketing/promo-codes/page.tsx` | Promo codes UI | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/ticketing/orders/page.tsx` | Orders UI | ✅ Complete |
| `apps/api/test/e2e/ticketing.spec.ts` | E2E tests (45 tests) | ✅ Complete |

### F9 Check-In Files (Complete)
| File Path | Purpose | Status |
|-----------|---------|--------|
| `infrastructure/supabase/migrations/20260102000003_f9_check_in.sql` | Check-in schema | ✅ Complete |
| `apps/api/src/modules/check-in/check-in.module.ts` | NestJS module | ✅ Complete |
| `apps/api/src/modules/check-in/check-in.controller.ts` | Check-in API | ✅ Complete |
| `apps/api/src/modules/check-in/check-in.service.ts` | Check-in logic | ✅ Complete |
| `apps/api/src/modules/check-in/stations.controller.ts` | Stations API | ✅ Complete |
| `apps/api/src/modules/check-in/stations.service.ts` | Stations logic | ✅ Complete |
| `apps/api/src/modules/check-in/dto/` | DTOs | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/check-in/page.tsx` | Dashboard | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/check-in/scan/page.tsx` | Scanner | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/check-in/stations/page.tsx` | Stations UI | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/check-in/queue/page.tsx` | Queue UI | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/check-in/reports/page.tsx` | Reports UI | ✅ Complete |
| `apps/api/test/e2e/check-in.spec.ts` | E2E tests (82 tests) | ✅ Complete |

### F10 Inventory Files (Complete)
| File Path | Purpose | Status |
|-----------|---------|--------|
| `supabase/migrations/20260102000004_f10_inventory.sql` | Inventory schema | ✅ Complete |
| `apps/api/src/modules/inventory/inventory.module.ts` | NestJS module | ✅ Complete |
| `apps/api/src/modules/inventory/inventory.controller.ts` | Items/Types API | ✅ Complete |
| `apps/api/src/modules/inventory/inventory.service.ts` | Items/Types logic | ✅ Complete |
| `apps/api/src/modules/inventory/categories.controller.ts` | Categories API | ✅ Complete |
| `apps/api/src/modules/inventory/categories.service.ts` | Categories logic | ✅ Complete |
| `apps/api/src/modules/inventory/checkouts.controller.ts` | Checkouts API | ✅ Complete |
| `apps/api/src/modules/inventory/checkouts.service.ts` | Checkouts logic | ✅ Complete |
| `apps/api/src/modules/inventory/dto/` | DTOs | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/inventory/page.tsx` | Dashboard | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/inventory/items/page.tsx` | Items list | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/inventory/checkouts/page.tsx` | Checkouts | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/inventory/categories/page.tsx` | Categories | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/inventory/types/page.tsx` | Types config | ✅ Complete |
| `apps/web/src/app/(dashboard)/[orgId]/inventory/reports/page.tsx` | Reports | ✅ Complete |
| `apps/api/test/e2e/inventory.spec.ts` | E2E tests (49 tests) | ✅ Complete |

### Database Files
| File Path | Purpose | Status |
|-----------|---------|--------|
| `infrastructure/supabase/migrations/20260102000001_f7b_scheduling.sql` | F7b Scheduling schema | ✅ Complete |
| `infrastructure/supabase/migrations/20260102000002_f8_ticketing.sql` | F8 Ticketing schema | ✅ Complete |
| `infrastructure/supabase/migrations/20260102000003_f9_check_in.sql` | F9 Check-In schema | ✅ Complete |
| `supabase/migrations/20260102000004_f10_inventory.sql` | F10 Inventory schema | ✅ Complete |
| `docs/features/F7-scheduling/ERD.md` | Scheduling ERD | Exists |
| `docs/features/F8-ticketing/ERD.md` | Ticketing ERD | Exists |
| `docs/features/F9-checkin/ERD.md` | Check-In ERD | Exists |
| `docs/features/F10-inventory/ERD.md` | Inventory ERD | Exists |

### API Modules
| Module | Endpoints | Auth | Status |
|--------|-----------|------|--------|
| Time Tracking | `/api/v1/organizations/:orgId/time/*` | JWT + Roles | ✅ Complete |
| Scheduling | `/api/v1/organizations/:orgId/schedules/*` | JWT + Roles | ✅ Complete |
| Availability | `/api/v1/organizations/:orgId/staff/:id/availability/*` | JWT + Roles | ✅ Complete |
| Templates | `/api/v1/organizations/:orgId/shift-templates/*` | JWT + Roles | ✅ Complete |
| Swaps | `/api/v1/organizations/:orgId/swap-requests/*` | JWT + Roles | ✅ Complete |
| Ticket Types | `/api/v1/organizations/:orgId/ticket-types/*` | JWT + Roles | ✅ Complete |
| Time Slots | `/api/v1/organizations/:orgId/time-slots/*` | JWT + Roles | ✅ Complete |
| Promo Codes | `/api/v1/organizations/:orgId/promo-codes/*` | JWT + Roles | ✅ Complete |
| Orders | `/api/v1/organizations/:orgId/orders/*` | JWT + Roles | ✅ Complete |
| Tickets | `/api/v1/organizations/:orgId/tickets/*` | JWT + Roles | ✅ Complete |
| Cart | `/api/v1/organizations/:orgId/cart/*` | JWT + Roles | ✅ Complete |
| Check-In | `/api/v1/organizations/:orgId/check-ins/*` | JWT + Roles | ✅ Complete |
| Stations | `/api/v1/organizations/:orgId/check-in-stations/*` | JWT + Roles | ✅ Complete |
| Capacity | `/api/v1/organizations/:orgId/attractions/:id/capacity/*` | JWT + Roles | ✅ Complete |
| Inventory | `/api/v1/organizations/:orgId/inventory/*` | JWT + Roles | ✅ Complete |

---

## Dependencies

### Part 1 (MVP) Dependencies
- **F4 Staff**: Required for scheduling (staff_id references)
- **F3 Attractions**: Required for ticketing (attraction_id, season_id)
- **F6 Payments**: Required for order payment processing

### Internal Dependencies (Part 2)
- **F8 Ticketing** depends on **F7 Scheduling** (staff roles)
- **F9 Check-In** depends on **F8 Ticketing** (ticket validation)
- **F10 Inventory** can be built independently

### Recommended Implementation Order
1. F7 Scheduling (depends on F4 Staff)
2. F10 Inventory (independent, can parallel with F7)
3. F8 Ticketing (depends on F3, F6)
4. F9 Check-In (depends on F8)

---

## Metrics (Part 2)

### Estimated Scope
- **New Database Tables**: ~25
- **New API Modules**: 4 (scheduling, ticketing, checkin, inventory)
- **New API Endpoints**: ~40
- **New Frontend Pages**: ~15
- **Seed Data Entities**: ~300 records

---

## References

- Part 1 (MVP): `.claude/plans/mvp-implementation.md`
- Part 3 (Engagement): `.claude/plans/mvp-implementation-part-3.md`
- Feature Roadmap: `.claude/plans/feature-roadmap.md`
- API Docs: `docs/features/F7-F10/API.md`
- ERD Docs: `docs/features/F7-F10/ERD.md`
