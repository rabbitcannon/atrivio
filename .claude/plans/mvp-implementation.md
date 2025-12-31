# Haunt Platform MVP - Implementation Plan & Progress Tracker

**Created Date**: 2025-12-30
**Last Updated**: 2025-12-31
**Current Session**: Session 3 - Frontend Wired to API
**Overall Progress**: 55% Complete

> **Note**: MVP requires F1-F6. This plan tracks implementation across database, API, and frontend layers.

## 🚀 Quick Start for Next Session

**Last Completed**: F1-F4 Frontend wired to API with real data
**Currently Working On**: Ready to start F5 (Platform Admin) or F6 (Stripe Connect)
**Next Action**: Design F5/F6 ERDs and API specs, then implement
**Key Context**: Full stack for F1-F4 complete and integrated (DB + API + Frontend with real data)

### Agent Assignments by Phase
- **Phase 1 (Database)**: backend-architect
- **Phase 2 (API)**: backend-architect
- **Phase 3 (Frontend)**: frontend-architect
- **Phase 4 (Testing)**: qa, code-reviewer

**Files Currently Modified**: `apps/web/src/**/*`
**Testing Status**: TypeScript compiles, Next.js builds successfully
**Known Issues**: None blocking

---

## 📊 Progress Overview

| Phase | Name | Status | Features | Notes |
|-------|------|--------|----------|-------|
| 1 | Foundation Database | ✅ Complete | F1-F4 | 22 tables migrated |
| 2 | Foundation API | ✅ Complete | F1-F4 | 71 files, all modules load |
| 3 | Foundation Frontend | ✅ Complete | F1-F4 | 85 files, auth + dashboard + org/attraction/staff pages |
| 4 | Admin & Payments DB | 🔵 Not Started | F5-F6 | - |
| 5 | Admin & Payments API | 🔵 Not Started | F5-F6 | - |
| 6 | Admin & Payments Frontend | 🔵 Not Started | F5-F6 | - |

> **Note**: Integration Testing and Final Polish moved to Part 3 (Phases 15-16) to cover all features F1-F14.

**Status Legend**: 🔵 Not Started | 🟡 In Progress | ✅ Complete | 🔴 Blocked | ⏸️ On Hold

---

## 🎯 Project Objectives

### Primary Goals
1. Multi-tenant SaaS for attractions industry (haunts, escape rooms, theme parks)
2. Complete MVP with Auth, Organizations, Attractions, Staff, Admin, Payments
3. Production-ready with Supabase + NestJS + Next.js stack

### Success Criteria
- [x] Database schema for F1-F4 with RLS policies
- [x] API endpoints for F1-F4 features
- [x] Frontend dashboards for F1-F4
- [x] Seed data for F1-F4 (7 users, 3 attractions, 5 staff)
- [ ] F5 Platform Admin panel
- [ ] F6 Stripe Connect integration
- [ ] Seed data for F5-F6 (admin, audit logs, Stripe mocks)
- [ ] End-to-end auth flow working
- [ ] Multi-tenant isolation verified
- [ ] Demo-ready seed data for MVP presentation

### MVP Features (F1-F6)
```
F1 Auth ─────┬──────────────────────────────────┐
             │                                   │
             ▼                                   │
F2 Orgs ─────┼───────────────────┐              │
             │                    │              │
             ▼                    ▼              │
F3 Haunts ───┼──────────┐   F6 Payments         │
             │          │        │              │
             ▼          │        │              │
F4 Staff ────┼──────────┼────────┼──────────────┤
             │          │        │              │
             ▼          ▼        ▼              ▼
F5 Admin ◄───┴──────────┴────────┴──────────────┘
```

---

## 📋 Feature Status Matrix

| Feature | ERD | Migration | Seed Data | API | Frontend | Tests | Status |
|---------|-----|-----------|-----------|-----|----------|-------|--------|
| **F1** Auth & Users | ✅ | ✅ | ✅ | ✅ | ✅ | 🔵 | Full Stack Done |
| **F2** Organizations | ✅ | ✅ | ✅ | ✅ | ✅ | 🔵 | Full Stack Done |
| **F3** Attractions | ✅ | ✅ | ✅ | ✅ | ✅ | 🔵 | Full Stack Done |
| **F4** Staff & Roles | ✅ | ✅ | ✅ | ✅ | ✅ | 🔵 | Full Stack Done |
| **F5** Platform Admin | 🔵 | 🔵 | 🔵 | 🔵 | 🔵 | 🔵 | Not Started |
| **F6** Stripe Connect | 🔵 | 🔵 | 🔵 | 🔵 | 🔵 | 🔵 | Not Started |

---

## 🌱 Seed Data Strategy

### Purpose
Comprehensive seed data enables:
1. **MVP Demo**: Showcase all features with realistic data
2. **Development**: Consistent test environment across sessions
3. **Testing**: Predictable data for integration/E2E tests
4. **Onboarding**: Show new team members what the platform does

### Seed Data by Feature

#### F1-F4: Foundation (✅ Complete)
**File**: `infrastructure/supabase/seed.sql`

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Users | 7 | Owner, admin, manager, HR, box office, actors |
| Organizations | 2 | "Nightmare Manor" (primary), "Scream Factory" (secondary) |
| Org Members | 6 | Various roles across orgs |
| Attractions | 3 | Main haunt, escape room, maze |
| Seasons | 4 | Past, current, upcoming seasons |
| Zones | 12 | Multiple zones per attraction |
| Staff Records | 5 | With skills, certs, time entries |
| Skills | 8 | Acting, makeup, tech skills |
| Certifications | 4 | First aid, fire safety |
| Invitations | 2 | Pending invites for demo |

**Test Accounts**:
| Email | Password | Role | Org |
|-------|----------|------|-----|
| `owner@haunt.dev` | `password123` | Owner | Nightmare Manor |
| `admin@haunt.dev` | `password123` | Admin | Nightmare Manor |
| `manager@haunt.dev` | `password123` | Manager | Nightmare Manor |
| `hr@haunt.dev` | `password123` | HR | Nightmare Manor |
| `boxoffice@haunt.dev` | `password123` | Box Office | Nightmare Manor |
| `actor1@haunt.dev` | `password123` | Actor | Nightmare Manor |
| `superadmin@haunt.dev` | `password123` | Super Admin | Platform |

#### F5: Platform Admin (🔵 Planned)
**File**: `infrastructure/supabase/seed.sql` (extend)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Super Admin User | 1 | Platform-level access |
| Audit Logs | 20+ | Recent activity across orgs |
| Feature Flags | 5 | Toggleable platform features |
| System Settings | 10 | Platform configuration |
| Support Tickets | 3 | Sample support requests |

**Demo Scenarios**:
- View all organizations and their health
- Browse audit logs across tenants
- Toggle feature flags
- Manage platform settings

#### F6: Stripe Connect (🔵 Planned)
**File**: `infrastructure/supabase/seed.sql` (extend)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Connected Accounts | 2 | One complete, one pending |
| Payout Records | 5 | Historical payouts |
| Platform Fees | 3 | Fee configurations |
| Payment Methods | 2 | Saved payment methods |
| Transaction History | 10 | Sample transactions |

**Demo Scenarios**:
- Org without Stripe connected (onboarding flow)
- Org with Stripe connected (dashboard view)
- Payout history and upcoming payouts
- Platform fee collection

### Seed Data Requirements per Phase

| Phase | Seed Data Task | Priority |
|-------|---------------|----------|
| Phase 4 | Add F5-F6 seed data to migration | High |
| Phase 5 | Verify API returns seeded data correctly | High |
| Phase 6 | UI displays seeded data properly | High |
| Phase 7 | E2E tests use seed data scenarios | Medium |
| Phase 8 | Final demo data polish | High |

---

## 📋 Phase 1: Foundation Database (F1-F4) ✅

### Objectives
- Design and implement database schema for core features
- Set up RLS policies for multi-tenant isolation
- Create migration scripts

### Tasks
- [x] Task 1: Create F1-F4 ERD documentation
  - **Result**: `docs/features/F1-auth/ERD.md`, F2, F3, F4 ERDs created
- [x] Task 2: Write Supabase migration
  - **Result**: `packages/database/migrations/001_foundation.sql` - 22 tables
- [x] Task 3: Verify migration runs successfully
  - **Result**: `supabase db reset` runs clean

### Phase Summary
**Status**: ✅ Complete
**Completed**: 2025-12-30

#### Implementation Notes
- 22 tables created across F1-F4
- RLS policies for tenant isolation
- Branded ID types in shared package
- Role hierarchy: owner → admin → manager → hr/box_office/finance/actor/scanner

---

## 📋 Phase 2: Foundation API (F1-F4) ✅

### Objectives
- Build NestJS API modules for all foundation features
- Implement auth guards, RBAC, tenant context
- Configure ESM build with SWC

### Tasks
- [x] Task 1: Set up shared/database module with Supabase client
  - **Result**: `apps/api/src/shared/database/` - anon + admin clients
- [x] Task 2: Build core/auth module
  - **Result**: JWT validation, guards, decorators, users CRUD
- [x] Task 3: Build core/tenancy module
  - **Result**: TenantInterceptor, org context injection
- [x] Task 4: Build core/rbac module
  - **Result**: Permissions, roles guards, hierarchy checks
- [x] Task 5: Build modules/organizations
  - **Result**: Orgs CRUD, members, invitations
- [x] Task 6: Build modules/haunts (attractions)
  - **Result**: Attractions, seasons, zones
- [x] Task 7: Build modules/staff
  - **Result**: Staff, skills, certifications, time, waivers, documents
- [x] Task 8: Fix TypeScript/ESM configuration
  - **Result**: `.swcrc` for ESM, shared package exports from dist

### Phase Summary
**Status**: ✅ Complete
**Completed**: 2025-12-30

#### Implementation Notes
- 71 TypeScript files compiled
- ESM module system working
- All modules load successfully on startup
- Fixed: verbatimModuleSyntax, exactOptionalPropertyTypes
- Global JWT guard with @Public() opt-out

---

## 📋 Phase 3: Foundation Frontend (F1-F4) ✅

### Objectives
- Build Next.js 14 pages and components for foundation features
- Implement auth flow with Supabase
- Create dashboard layouts

### Tasks
- [x] Task 1: Set up Supabase auth client
  - **Result**: `src/lib/supabase/` with server.ts, client.ts, middleware.ts
- [x] Task 2: Create auth pages (login, signup, forgot password)
  - **Result**: `src/app/(auth)/` with login, signup, forgot-password, reset-password
- [x] Task 3: Create dashboard layout with org switcher
  - **Result**: `src/app/(dashboard)/layout.tsx`, org-switcher, sidebar, header
- [x] Task 4: Create organization management pages
  - **Result**: `src/app/(dashboard)/[orgId]/` with settings, members, invitations
- [x] Task 5: Create attractions management pages
  - **Result**: Attractions CRUD, seasons, zones pages
- [x] Task 6: Create staff management pages
  - **Result**: Staff roster, skills, certifications, time tracking pages

### Phase Summary
**Status**: ✅ Complete
**Completed**: 2025-12-30

#### Implementation Notes
- 85 TypeScript/TSX files created
- 14 shadcn/ui components (button, input, card, dialog, table, etc.)
- Supabase SSR auth with middleware for session management
- Zustand stores for auth and org context
- API client with auth header injection
- Suspense boundaries for auth pages (useSearchParams compatibility)
- Fixed shared package module resolution for Next.js bundler

---

## 📋 Phase 4: Admin & Payments Database (F5-F6)

### Objectives
- Design platform admin tables
- Design Stripe Connect integration tables
- Create comprehensive seed data for demo scenarios

### Tasks
- [ ] Task 1: Create F5 Platform Admin ERD
  - **Agent**: backend-architect
  - Acceptance criteria: Admin dashboard, audit logs, feature flags
  - Dependencies: F1-F4 complete
- [ ] Task 2: Create F6 Stripe Connect ERD
  - **Agent**: backend-architect
  - Acceptance criteria: Connected accounts, payouts, fees
  - Dependencies: F2 Organizations
- [ ] Task 3: Write migration for F5-F6
  - **Agent**: backend-architect
  - Acceptance criteria: Migration runs clean
  - Dependencies: Tasks 1-2
- [ ] Task 4: Extend seed data for F5-F6
  - **Agent**: backend-architect
  - Acceptance criteria:
    - Super admin user with platform access
    - Audit log entries (20+) showing recent activity
    - Feature flags (5) with various states
    - Mock Stripe connected accounts (2 orgs)
    - Sample payout records and transaction history
  - Dependencies: Task 3

### Phase Summary
**Status**: 🔵 Not Started

---

## 📋 Phase 5: Admin & Payments API (F5-F6)

### Objectives
- Build platform admin API endpoints
- Integrate Stripe Connect
- Verify API returns seeded data correctly

### Tasks
- [ ] Task 1: Build core/admin module
  - **Agent**: backend-architect
  - Acceptance criteria: Super admin endpoints, audit logs
  - Dependencies: Phase 4
- [ ] Task 2: Build modules/payments with Stripe Connect
  - **Agent**: backend-architect
  - Acceptance criteria: Account onboarding, webhooks
  - Dependencies: Phase 4
- [ ] Task 3: Verify seed data via API
  - **Agent**: backend-architect
  - Acceptance criteria:
    - `/api/v1/admin/organizations` returns all seeded orgs
    - `/api/v1/admin/audit-logs` returns seeded audit entries
    - `/api/v1/admin/feature-flags` returns seeded flags
    - `/api/v1/payments/account` returns Stripe status for each org
  - Dependencies: Tasks 1-2

### Phase Summary
**Status**: 🔵 Not Started

---

## 📋 Phase 6: Admin & Payments Frontend (F5-F6)

### Objectives
- Build platform admin dashboard
- Build payment settings UI
- UI displays seeded data with proper formatting

### Tasks
- [ ] Task 1: Create admin dashboard pages
  - **Agent**: frontend-architect
  - Acceptance criteria: User management, org oversight
  - Dependencies: Phase 5
- [ ] Task 2: Create Stripe Connect onboarding flow
  - **Agent**: frontend-architect
  - Acceptance criteria: Express account setup
  - Dependencies: Phase 5
- [ ] Task 3: Verify UI displays seed data correctly
  - **Agent**: frontend-architect
  - Acceptance criteria:
    - Admin dashboard shows all seeded organizations
    - Audit log table displays 20+ entries with proper formatting
    - Feature flags show current states with toggle capability
    - Payments page shows Stripe connection status per org
    - "Nightmare Manor" shows connected, "Scream Factory" shows pending
  - Dependencies: Tasks 1-2

### Phase Summary
**Status**: 🔵 Not Started

---

## 📁 Key Files & Components

### Created/Modified Files (Phase 1-2)
| File Path | Purpose | Status |
|-----------|---------|--------|
| `packages/database/migrations/001_foundation.sql` | F1-F4 schema | ✅ |
| `packages/shared/src/**` | Types, constants, validators | ✅ |
| `apps/api/src/shared/database/` | Supabase client | ✅ |
| `apps/api/src/core/auth/` | Auth module | ✅ |
| `apps/api/src/core/tenancy/` | Tenant context | ✅ |
| `apps/api/src/core/rbac/` | RBAC system | ✅ |
| `apps/api/src/modules/organizations/` | F2 endpoints | ✅ |
| `apps/api/src/modules/haunts/` | F3 endpoints | ✅ |
| `apps/api/src/modules/staff/` | F4 endpoints | ✅ |

### API Endpoints Implemented
| Module | Endpoints | Auth | Status |
|--------|-----------|------|--------|
| Auth | `/api/v1/auth/*` | Public/JWT | ✅ |
| Users | `/api/v1/users/*` | JWT + SuperAdmin | ✅ |
| Organizations | `/api/v1/organizations/*` | JWT + Roles | ✅ |
| Members | `/api/v1/organizations/:orgId/members/*` | JWT + Roles | ✅ |
| Invitations | `/api/v1/organizations/:orgId/invitations/*` | JWT + Roles | ✅ |
| Attractions | `/api/v1/organizations/:orgId/attractions/*` | JWT + Roles | ✅ |
| Seasons | `/api/v1/.../attractions/:id/seasons/*` | JWT + Roles | ✅ |
| Staff | `/api/v1/organizations/:orgId/staff/*` | JWT + Roles | ✅ |
| Skills | `/api/v1/.../staff/:id/skills/*` | JWT + Roles | ✅ |
| Certifications | `/api/v1/.../staff/:id/certifications/*` | JWT + Roles | ✅ |
| Time | `/api/v1/.../staff/:id/time/*` | JWT + Roles | ✅ |
| Documents | `/api/v1/.../staff/:id/documents/*` | JWT + Roles | ✅ |
| Waivers | `/api/v1/.../staff/:id/waivers/*` | JWT + Roles | ✅ |

---

## 🔄 Session History

### Session 1: 2025-12-30 - API Foundation Complete
**Completed**:
- Built all F1-F4 API modules (71 files)
- Fixed ESM/TypeScript configuration issues
- Verified API boots successfully with all modules loading

**Key Decisions**:
- Use `as unknown as` for Supabase relation type casting
- Conditional spread for exactOptionalPropertyTypes compatibility
- Shared package exports from `dist/` not `src/`

**Key Files**: All `apps/api/src/**` modules

---

### Session 2: 2025-12-30 - Frontend Foundation Complete
**Completed**:
- Built all F1-F4 frontend pages and components (85 files)
- Set up Supabase SSR auth client with middleware
- Created auth pages (login, signup, forgot/reset password)
- Built dashboard layout with org switcher
- Implemented org, attractions, and staff management pages
- Created 14 shadcn/ui components
- Fixed shared package module resolution for Next.js

**Key Decisions**:
- Disabled typedRoutes (experimental, caused issues with dynamic routes)
- Changed shared package to Bundler module resolution for Next.js compatibility
- Wrapped auth forms in Suspense for useSearchParams compatibility
- Used Zustand for auth and org context state

**Key Files**: All `apps/web/src/**` modules

---

### Session 3: 2025-12-31 - Frontend Wired to API
**Completed**:
- Expanded seed data with comprehensive test data (7 users, 3 attractions, 12 zones, 5 staff with skills/certs)
- Fixed Supabase Auth seed file to use `crypt()` for proper password hashing
- Created API type definitions (`apps/web/src/lib/api/types.ts`)
- Created API endpoint functions (`apps/web/src/lib/api/index.ts`)
- Wired dashboard page to fetch real org stats from API
- Wired attractions page to fetch from API (replaced mock data)
- Wired staff table to fetch from API with loading states
- Wired organization members page to fetch from API
- Added Alert component for error handling
- Added loading skeletons for better UX

**Key Decisions**:
- Use Server Components for dashboard/attractions pages (server-side data fetching)
- Use Client Components with useState/useEffect for interactive tables (staff, members)
- Consistent error handling with Alert components
- All API responses properly typed with TypeScript interfaces

**Key Files**:
- `apps/web/src/lib/api/types.ts` (new)
- `apps/web/src/lib/api/index.ts` (updated)
- `apps/web/src/components/ui/alert.tsx` (new)
- Dashboard, attractions, staff, members pages (updated)

**Test Accounts**:
- `owner@haunt.dev` / `password123` - Org Owner
- `manager@haunt.dev` / `password123` - Manager
- Plus 4 more staff accounts (actor1-3, boxoffice)

**Next Steps**:
- Start Phase 4: F5-F6 Database (Platform Admin + Stripe Connect)

---

## 📊 Metrics

### Code Metrics
- **API Files Created**: 71
- **Frontend Files Created**: 85
- **Database Tables**: 22
- **API Modules**: 7 (auth, tenancy, rbac, organizations, haunts, staff, database)
- **UI Components**: 14 (shadcn/ui style)
- **Test Coverage**: 0% (tests not written yet)

---

## 📝 Additional Notes

### Technical Stack Verified
- NestJS 10 + Fastify adapter ✅
- SWC compiler with ESM output ✅
- Supabase JS client ✅
- TypeScript strict mode ✅
- Next.js 14 + App Router ✅
- Tailwind v4 + shadcn/ui ✅
- Zustand for state management ✅

### Next Priority
Start Phase 4: F5-F6 Database Design and Migration

### References
- **Part 2 (Operations F7-F10)**: `.claude/plans/mvp-implementation-part-2.md`
- **Part 3 (Engagement F11-F14)**: `.claude/plans/mvp-implementation-part-3.md`
- Feature Roadmap: `.claude/plans/feature-roadmap.md`
- API Docs: `docs/features/F*/API.md`
- ERD Docs: `docs/features/F*/ERD.md`

---

## Full Feature Roadmap Summary

| Part | Phases | Features | Status | Description |
|------|--------|----------|--------|-------------|
| **Part 1 (MVP)** | 1-6 | F1-F6 | 55% Complete | Auth, Orgs, Attractions, Staff, Admin, Payments |
| **Part 2 (Operations)** | 7-10 | F7-F10 | Not Started | Scheduling, Ticketing, Check-In, Inventory |
| **Part 3 (Engagement)** | 11-14 | F11-F14 | Not Started | Queue, Notifications, Analytics, Storefronts |
| **Part 3 (Final)** | 15-16 | All F1-F14 | Not Started | Integration Testing, Dark Theme, Polish, Deploy |
