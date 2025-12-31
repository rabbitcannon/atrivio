# Haunt Platform - Implementation Plan Part 2: Operations (F7-F10)

**Created Date**: 2025-12-31
**Last Updated**: 2025-12-31
**Current Session**: Not Started
**Overall Progress**: 0% Complete

> **Note**: Part 2 covers Operations features (F7-F10). Requires Part 1 (MVP F1-F6) to be complete.

## Quick Start for Next Session

**Prerequisites**: MVP (F1-F6) must be complete before starting Part 2
**Last Completed**: N/A
**Currently Working On**: Ready to start after MVP completion
**Next Action**: Design F7 Scheduling ERD refinement and migration

### Agent Assignments by Phase
- **Phase 7 (Database)**: backend-architect
- **Phase 8 (API)**: backend-architect
- **Phase 9 (Frontend)**: frontend-architect
- **Phase 10 (Testing)**: qa, code-reviewer

---

## Progress Overview

| Phase | Name | Status | Features | Notes |
|-------|------|--------|----------|-------|
| 7 | Operations Database | Not Started | F7-F10 | ~25 new tables |
| 8 | Operations API | Not Started | F7-F10 | 4 new modules |
| 9 | Operations Frontend | Not Started | F7-F10 | Scheduling, ticketing, check-in UI |
| 10 | Operations Testing | Not Started | F7-F10 | E2E tests for operations |

**Status Legend**: Not Started | In Progress | Complete | Blocked | On Hold

---

## Feature Status Matrix

| Feature | ERD | Migration | Seed Data | API | Frontend | Tests | Status |
|---------|-----|-----------|-----------|-----|----------|-------|--------|
| **F7** Scheduling | Exists | Not Started | Not Started | Not Started | Not Started | Not Started | Not Started |
| **F8** Ticketing | Exists | Not Started | Not Started | Not Started | Not Started | Not Started | Not Started |
| **F9** Check-In | Exists | Not Started | Not Started | Not Started | Not Started | Not Started | Not Started |
| **F10** Inventory | Exists | Not Started | Not Started | Not Started | Not Started | Not Started | Not Started |

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
- [ ] Task 1: Create scheduling E2E tests
  - **Agent**: qa
  - Dependencies: Phase 9
  - Acceptance criteria:
    - Create and publish schedule
    - Submit and approve shift swap
    - Detect scheduling conflicts
- [ ] Task 2: Create ticketing E2E tests
  - **Agent**: qa
  - Dependencies: Phase 9
  - Acceptance criteria:
    - Complete ticket purchase flow
    - Apply promo code
    - Handle sold-out time slots
    - Process refund
- [ ] Task 3: Create check-in E2E tests
  - **Agent**: qa
  - Dependencies: Phase 9
  - Acceptance criteria:
    - Scan valid ticket
    - Reject invalid/used ticket
    - Track capacity in real-time
- [ ] Task 4: Create inventory E2E tests
  - **Agent**: qa
  - Dependencies: Phase 9
  - Acceptance criteria:
    - Checkout item to staff
    - Return item with condition update
    - Generate low stock alert
- [ ] Task 5: Verify seed data integrity
  - **Agent**: qa
  - Dependencies: Tasks 1-4
  - Acceptance criteria:
    - All seeded schedules accessible
    - All seeded tickets scannable
    - All seeded inventory checkable

### Phase Summary
**Status**: Not Started

---

## Key Files & Components (Part 2)

### Database Files
| File Path | Purpose | Status |
|-----------|---------|--------|
| `infrastructure/supabase/migrations/002_operations.sql` | F7-F10 schema | Not Started |
| `docs/features/F7-scheduling/ERD.md` | Scheduling ERD | Exists |
| `docs/features/F8-ticketing/ERD.md` | Ticketing ERD | Exists |
| `docs/features/F9-checkin/ERD.md` | Check-In ERD | Exists |
| `docs/features/F10-inventory/ERD.md` | Inventory ERD | Exists |

### API Modules (Planned)
| Module | Endpoints | Auth | Status |
|--------|-----------|------|--------|
| Scheduling | `/api/v1/organizations/:orgId/schedules/*` | JWT + Roles | Not Started |
| Availability | `/api/v1/organizations/:orgId/staff/:id/availability/*` | JWT + Roles | Not Started |
| Ticketing | `/api/v1/organizations/:orgId/tickets/*` | JWT + Roles | Not Started |
| Orders | `/api/v1/organizations/:orgId/orders/*` | JWT + Roles | Not Started |
| Check-In | `/api/v1/organizations/:orgId/checkin/*` | JWT + Roles | Not Started |
| Inventory | `/api/v1/organizations/:orgId/inventory/*` | JWT + Roles | Not Started |

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
