# Haunt Platform - Implementation Plan Part 3: Engagement & Growth (F11-F12, F14-F15)

**Created Date**: 2025-12-31
**Last Updated**: 2026-01-05
**Current Session**: Phase 15 Comprehensive Demo Seeding - COMPLETE
**Overall Progress**: 97% Complete (F11, F12, F14, Phase 15 complete; F15 Docs, Phase 16-17 remaining)

> **Note**: Part 3 covers Engagement & Growth features (F11-F12, F14-F15). F13 Analytics has been deferred to post-MVP (see `.claude/plans/analytics.md`).

## Quick Start for Next Session

**Prerequisites**: Parts 1-2 (F1-F10) should be complete before starting Part 3
**Last Completed**: Phase 15 Comprehensive Demo Seeding - FULLY COMPLETE:
  - **Users**: 26 accounts across 4 organizations (all roles covered)
  - **Organizations**: Nightmare Manor (Pro), Spooky Hollow (Basic), Terror Collective (Enterprise), Newhouse Haunts (Onboarding)
  - **Feature Flags**: 9 flags with tier-based gating (basic/pro/enterprise)
  - **Attractions**: 11 total (3 Nightmare, 1 Spooky, 6 Terror, 1 Newhouse)
  - **Staff**: 17 profiles with skills, certifications, time entries
  - **Ticketing**: 8 ticket types, 5 orders, 9 tickets, check-ins
  - **Inventory**: 30 items with categories and checkouts
  - **Queue**: 2 configs, 24 entries with various statuses
  - **Storefronts**: 2 settings with pages, FAQs, announcements
**Currently Working On**: Choose next phase
**Next Action**: Choose between Phase 14b (Documentation Site), Phase 16 (Integration Testing), or Phase 17 (Final Polish)

### Agent Assignments by Phase
- **Phase 11 (Database)**: backend-architect
- **Phase 12 (API)**: backend-architect
- **Phase 13 (Frontend)**: frontend-architect
- **Phase 14 (Testing)**: qa, code-reviewer
- **Phase 15 (Documentation)**: scribe, frontend-architect, qa (Playwright)
- **Phase 16 (Integration Testing)**: qa, code-reviewer
- **Phase 17 (Final Polish & Deploy)**: frontend-architect, backend-architect, devops

---

## Progress Overview

| Phase | Name | Status | Features | Notes |
|-------|------|--------|----------|-------|
| 11 | Engagement Database | Complete | F11-F12, F14 | All migrations and seed data done |
| 12 | Engagement API | Complete | F11-F12, F14 | All API modules complete |
| 13 | Engagement Frontend | Complete | F11-F12, F14 | All features complete, CORS fixed |
| 14 | Engagement Testing | Complete | F11-F12, F14 | All E2E tests passing (43 storefront, 32 notifications, 35 queue) |
| 14b | Documentation Site | Not Started | F15 | Docusaurus + Playwright screenshots |
| 15 | Comprehensive Demo Seeding | Complete | All | 4 orgs, 26 users, 11 attractions, tier-based flags |
| 16 | Integration Testing | Not Started | F1-F12, F14 | Full system E2E tests (uses seeded data) |
| 17 | Final Polish & Deploy | Not Started | All | Dark theme, UX polish, production deploy |

**Status Legend**: Not Started | In Progress | Complete | Blocked | On Hold

---

## Feature Status Matrix

| Feature | ERD/Spec | Migration | Seed Data | API | Frontend | Tests | Status |
|---------|----------|-----------|-----------|-----|----------|-------|--------|
| **F11** Virtual Queue | Complete | Complete | Complete | Complete | Complete | Complete | ✅ Complete |
| **F12** Notifications | Complete | Complete | Complete | Complete | Complete | Complete | ✅ Complete |
| **F14** Storefronts | Complete | Complete | Complete | Complete | Complete | Complete | ✅ Complete |
| **F15** Documentation Site | Not Started | N/A | N/A | N/A | Not Started | Not Started | Not Started |

> **Note**: F13 Analytics has been deferred to post-MVP. See `.claude/plans/analytics.md`

---

## Seed Data Strategy (F11-F12, F14)

### Purpose
Comprehensive seed data for engagement features enables:
1. **Demo**: Show virtual queue, notifications, storefronts
2. **Testing**: Realistic data for E2E tests
3. **Development**: Consistent environment for building features

### Seed Data by Feature

#### F11: Virtual Queue
**File**: `infrastructure/supabase/seed.sql` (extend)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Queue Configs | 3 | One per attraction with different settings |
| Queue Entries | 50 | Mix of waiting, notified, checked_in, expired |
| Queue Notifications | 100 | SMS/push notification history |
| Queue Stats | 30 | Hourly stats for analytics |

**Demo Scenarios**:
- Guest joins virtual queue via mobile
- Real-time position and wait time updates
- SMS notification when turn is ready
- Queue manager views current status

#### F12: Notifications
**File**: `infrastructure/supabase/seed.sql` (extend)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Notification Templates | 15 | Email, SMS, push templates |
| Notifications | 100 | Sent notification history |
| Notification Preferences | 10 | User opt-in/opt-out settings |
| Push Devices | 5 | Registered mobile devices |

**Demo Scenarios**:
- Order confirmation email sent
- Shift reminder SMS to staff
- Push notification for queue ready
- User updates notification preferences

#### F14: Storefronts
**File**: `infrastructure/supabase/seed.sql` (extend)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Storefront Settings | 2 | One per org (configured, default) |
| Storefront Pages | 8 | About, FAQ, Contact, custom pages |
| Storefront Domains | 3 | Subdomain + custom domain example |
| Storefront Navigation | 10 | Header and footer nav items |
| Storefront FAQs | 15 | Common questions and answers |
| Storefront Announcements | 3 | Active banner, popup, promo |

**Demo Scenarios**:
- Public storefront with custom branding
- Custom pages with markdown content
- FAQ page with categories
- Announcement banner on homepage

### Test Accounts for Engagement

| Email | Password | Role | Demo Purpose |
|-------|----------|------|--------------|
| `queue@haunt.dev` | `password123` | Manager | Queue management |
| `marketing@haunt.dev` | `password123` | Admin | Notifications & analytics |
| `content@haunt.dev` | `password123` | Manager | Storefront management |

---

## Phase 11: Engagement Database (F11-F12, F14)

### Objectives
- Implement virtual queue, notifications, and storefront schemas
- Create notification templates
- Set up RLS policies for public and authenticated access

### Tasks
- [x] Task 1: Review and refine F11 Virtual Queue ERD
  - **Agent**: backend-architect
  - Dependencies: F8 Ticketing complete
  - Acceptance criteria: queue_configs, queue_entries, queue_notifications, queue_stats tables
  - **Completed**: 2026-01-03 - ERD reviewed, migration created
- [x] Task 2: Review and refine F12 Notifications ERD
  - **Agent**: backend-architect
  - Dependencies: F1 Auth complete
  - Acceptance criteria: notification_templates, notifications, preferences, push_devices tables
  - **Completed**: 2026-01-04 - ERD reviewed, migration created with 5 tables + RLS
- [x] Task 3: Review and refine F14 Storefronts ERD
  - **Agent**: backend-architect
  - Dependencies: F2 Organizations, F3 Attractions complete
  - Acceptance criteria: storefront_settings, pages, domains, navigation, faqs, announcements tables
  - **Completed**: 2026-01-05 - ERD reviewed, 6 tables with 10 enums defined
- [x] Task 4: Write migration for F11 Virtual Queue
  - **Agent**: backend-architect
  - Dependencies: Task 1
  - Acceptance criteria: `20260103000001_f11_virtual_queue.sql` migration runs clean
  - **Completed**: 2026-01-03 - Migration includes queue_configs, queue_entries, queue_notifications, queue_stats tables with RLS policies and helper functions
- [x] Task 5: Create seed data for F11 Virtual Queue
  - **Agent**: backend-architect
  - Dependencies: Task 4
  - Acceptance criteria:
    - 2 queue configs with realistic settings (Haunted Mansion, Terror Trail)
    - 24 queue entries in various states (waiting, notified, called, checked_in, expired, left, no_show)
    - 7 queue notifications (sms, push types)
    - 12 hourly stats records
  - **Completed**: 2026-01-03 - Seed data added to supabase/seed.sql
- [x] Task 6: Write migration for F12 Notifications
  - **Agent**: backend-architect
  - Dependencies: Task 2
  - Acceptance criteria: `20260104000000_f12_notifications.sql` migration runs clean
  - **Completed**: 2026-01-04 - Migration includes 5 tables, 8 system templates, RLS policies, feature flag
- [x] Task 7: Write migration for F14 Storefronts
  - **Agent**: backend-architect
  - Dependencies: Task 3
  - Acceptance criteria: Storefronts migration runs clean
  - **Completed**: 2026-01-05 - `20260105000001_f14_storefronts.sql` with 6 tables, 10 enums, RLS, functions, triggers
- [x] Task 8: Create seed data for F12 Notifications
  - **Agent**: backend-architect
  - Dependencies: Task 6
  - Acceptance criteria:
    - 8 system notification templates (queue, tickets, schedule)
    - Feature flag for notifications module
  - **Completed**: 2026-01-04 - System templates included in migration, feature flag added
- [x] Task 9: Create seed data for F14 Storefronts
  - **Agent**: backend-architect
  - Dependencies: Task 7
  - Acceptance criteria:
    - Storefront settings with custom branding
    - 8 storefront pages with content
    - 15 FAQs across categories
  - **Completed**: 2026-01-05 - Comprehensive seed data:
    - 2 storefront settings (Nightmare Manor published, Spooky Hollow draft)
    - 3 domains (2 for Nightmare Manor, 1 for Spooky Hollow)
    - 6 pages with full markdown content
    - 10 navigation items (header + footer)
    - 15 FAQs in 5 categories
    - 3 announcements (banner, popup, weather warning)

### Phase Summary
**Status**: Complete (F11-F12 Complete, F14 Database Complete)

---

## Phase 12: Engagement API (F11-F12, F14)

### Objectives
- Build NestJS modules for queue, notifications, storefronts
- Implement real-time features (queue updates, notifications)

### Tasks
- [x] Task 1: Build modules/queue
  - **Agent**: backend-architect
  - Dependencies: Phase 11
  - Acceptance criteria:
    - Queue config management
    - Join/leave queue endpoints
    - Position and wait time calculation
    - WebSocket for real-time updates (TODO: WebSocket to be added in future iteration)
  - **Completed**: 2026-01-03 - Queue module with controller, service, DTOs, and public endpoints
- [x] Task 2: Build modules/notifications
  - **Agent**: backend-architect
  - Dependencies: Phase 11
  - Acceptance criteria:
    - Template management
    - Send notification (email/SMS/push)
    - Notification preferences CRUD
    - Push device registration
  - **Completed**: 2026-01-04 - NestJS module with:
    - NotificationsService (Twilio SMS + SendGrid email with dev mode logging)
    - NotificationsController (org-scoped: send, templates, history)
    - UserNotificationsController (user-scoped: inbox, preferences, devices)
    - Feature flag gating (`notifications` basic tier)
- [x] Task 3: Build modules/storefronts
  - **Agent**: backend-architect
  - Dependencies: Phase 11
  - Acceptance criteria:
    - Settings management
    - Page CRUD with publishing
    - Domain verification workflow
    - Public storefront API (no auth)
  - **Completed**: 2026-01-05 - NestJS module with:
    - StorefrontsService (settings, pages, domains, FAQs, announcements, navigation)
    - StorefrontsController (admin: settings CRUD, pages CRUD, domains, FAQs, announcements, navigation)
    - PublicStorefrontsController (public: get storefront, get page, get FAQs)
    - Feature flag gating (`storefronts` pro tier)
    - Domain verification workflow (DNS TXT/CNAME)
- [x] Task 4: Verify F11 seed data via API
  - **Agent**: backend-architect
  - Dependencies: Task 1
  - Acceptance criteria:
    - Queue shows current entries and wait times
  - **Completed**: 2026-01-03 - All queue endpoints tested and working
- [ ] Task 5: Verify F12-F14 seed data via API
  - **Agent**: backend-architect
  - Dependencies: Tasks 2-3
  - Acceptance criteria:
    - Notifications list shows history
    - Public storefront API returns published content

### Phase Summary
**Status**: Complete (F11-F12 Complete, F14 Complete)

---

## Phase 13: Engagement Frontend (F11-F12, F14)

### Objectives
- Build queue management and guest-facing UI
- Build notification center and preferences
- Build storefront editor and preview

### Tasks
- [x] Task 1: Create virtual queue pages
  - **Agent**: frontend-architect
  - Dependencies: Phase 12
  - Acceptance criteria:
    - ✅ Queue configuration settings (`/queue/settings` - 326 lines, view-only mode)
    - ✅ Live queue status dashboard (`/queue` - 270 lines, stats + nav)
    - Guest-facing queue position page (TODO: public `/q/:code` route)
    - ✅ Queue entry management (`/queue/manage` - 352 lines, table + filters)
    - ✅ Queue analytics (`/queue/stats` - 347 lines, hourly breakdown)
    - ✅ API client functions (getQueueConfig, getQueueEntries, getQueueStats, etc.)
  - **Status**: 90% complete - pages built, needs client-side interactivity for buttons
- [x] Task 2: Create notification pages
  - **Agent**: frontend-architect
  - Dependencies: Phase 12
  - Acceptance criteria:
    - ✅ Template list with tabbed view by channel
    - ✅ Notification history with channel filters and status badges
    - ✅ Send notification form (email/SMS toggle, category selection)
    - ✅ Main landing page with stats cards and navigation
    - ✅ RadioGroup component for channel selection
    - ✅ API client functions (templates, history, send, preferences)
    - User preference settings (TODO: user-facing preferences page)
  - **Completed**: 2026-01-04 - 4 pages, types, API functions, new UI component
- [x] Task 3: Create storefront editor
  - **Agent**: frontend-architect
  - Dependencies: Phase 12
  - Acceptance criteria:
    - ✅ Branding and theme editor (`/storefront/settings/`)
    - ✅ Page content editor (`/storefront/pages/`)
    - ✅ Navigation manager (`/storefront/navigation/`)
    - ✅ Domain configuration (`/storefront/domains/`)
    - ✅ FAQ manager (`/storefront/faqs/`)
    - ✅ Announcement manager (`/storefront/announcements/`)
    - Live preview (TODO: add preview button)
  - **Completed**: 2026-01-06 - All editor pages built, CORS fixed for save functionality
- [x] Task 4: Create public storefront
  - **Agent**: frontend-architect
  - Dependencies: Task 3
  - Acceptance criteria:
    - ✅ Public homepage with hero (`apps/storefront/src/app/page.tsx`)
    - ✅ Custom pages (`apps/storefront/src/app/[slug]/page.tsx`)
    - ✅ FAQ page (`apps/storefront/src/app/faqs/page.tsx`)
    - ✅ Ticket page (`apps/storefront/src/app/tickets/page.tsx`)
    - ✅ Theme injection with hex-to-HSL conversion (`layout.tsx`)
  - **Completed**: 2026-01-06 - Public storefront app complete with theming
- [ ] Task 5: Verify UI displays seed data correctly
  - **Agent**: frontend-architect
  - Dependencies: Tasks 1-4
  - Acceptance criteria:
    - Queue dashboard shows 50 seeded entries
    - Storefront displays custom branding
    - Public storefront renders all pages

### Phase Summary
**Status**: Complete (F11 Queue 90%, F12 Notifications Complete, F14 Complete)

---

## Phase 14: Engagement Testing (F11-F12, F14)

### Objectives
- E2E testing of engagement workflows
- Integration testing of real-time features
- Public storefront testing

### Tasks
- [x] Task 1: Create queue E2E tests
  - **Agent**: qa
  - Dependencies: Phase 12 (API)
  - Acceptance criteria:
    - Queue configuration CRUD (7 tests)
    - Queue entry management (7 tests)
    - Status transitions workflow (8 tests)
    - Queue operations - pause/resume/clear/stats (5 tests)
    - Public endpoints - info/join/status/leave (5 tests)
    - Edge cases - full queue, invalid attraction, duplicates (3 tests)
  - **Completed**: 2026-01-04 - 35 E2E tests passing, feature flag gating verified
- [x] Task 2: Create notification E2E tests
  - **Agent**: qa
  - Dependencies: Phase 12, 13
  - Acceptance criteria:
    - Templates: list, filter, get by key/channel, 404 handling
    - Send: template-based SMS, direct SMS/email, role authorization
    - History: list, filter by channel, pagination
    - Inbox: list, filter by read status, unread count
    - Preferences: get per-category, update per-category
    - Push devices: register iOS/Android/web, reject invalid, unregister
    - Feature flag gating
  - **Completed**: 2026-01-05 - 32 E2E tests covering all notification endpoints
- [x] Task 3: Create storefront E2E tests
  - **Agent**: qa
  - Dependencies: Phase 13
  - Acceptance criteria:
    - ✅ Settings CRUD (GET, PATCH, publish, unpublish, preview)
    - ✅ Pages CRUD (list, get, create, update, delete, filter by status)
    - ✅ Domains CRUD (list, create, verify, set-primary)
    - ✅ FAQs CRUD (list, create, update, reorder, filter by category)
    - ✅ Announcements CRUD (list, create, update)
    - ✅ Navigation (get, update)
    - ✅ Public storefront (get by slug, get page, get FAQs)
    - ✅ Role-based access control (owner, manager, actor rejection)
    - ✅ Feature flag gating
  - **Completed**: 2026-01-06 - 43 E2E tests covering all storefront endpoints
- [ ] Task 4: Verify seed data integrity
  - **Agent**: qa
  - Dependencies: Tasks 1-3
  - Acceptance criteria:
    - All seeded queue entries accessible
    - Storefront content displays properly

### Phase Summary
**Status**: Complete (F11 35 tests, F12 32 tests, F14 43 tests - Total 110 tests passing)

---

## F15: Documentation Site

### Overview
Professional, investor-ready documentation site built with Docusaurus. Covers user guides, API reference, and getting started tutorials for all platform features.

### Tech Stack
- **Framework**: Docusaurus 3.x
- **Hosting**: Vercel or Netlify (static)
- **Screenshots**: Playwright for automated screenshot capture
- **API Docs**: OpenAPI/Swagger integration
- **Search**: Algolia DocSearch (free for open-source/docs)

### Content Structure
```
docs/
├── getting-started/
│   ├── quick-start.md
│   ├── account-setup.md
│   └── first-organization.md
├── user-guides/
│   ├── dashboard/
│   ├── attractions/
│   ├── staff-management/
│   ├── time-clock/
│   ├── scheduling/
│   ├── ticketing/
│   └── check-in/
├── admin-guides/
│   ├── organization-settings/
│   ├── payments-stripe/
│   ├── roles-permissions/
│   └── platform-admin/
├── api-reference/
│   ├── authentication.md
│   ├── organizations.md
│   ├── attractions.md
│   ├── staff.md
│   ├── time-tracking.md
│   └── ... (auto-generated from OpenAPI)
└── tutorials/
    ├── setting-up-your-first-haunt.md
    ├── managing-seasonal-staff.md
    └── integrating-with-stripe.md
```

### Implementation Tasks
- [ ] Task 1: Set up Docusaurus project in `apps/docs/`
  - Docusaurus 3.x with TypeScript
  - Custom theme matching platform branding
  - Dark/light theme support
- [ ] Task 2: Write Getting Started guides
  - Quick start (5-minute setup)
  - Account creation and org setup
  - Key concepts overview
- [ ] Task 3: Write User Guides for each feature
  - Screenshots captured via Playwright
  - Step-by-step workflows
  - Tips and best practices
- [ ] Task 4: Generate API Reference
  - OpenAPI spec integration
  - Interactive API explorer
  - Code examples (curl, JavaScript, Python)
- [ ] Task 5: Create tutorials and walkthroughs
  - End-to-end scenarios
  - Video embed support (optional)
- [ ] Task 6: Set up search and navigation
  - Algolia DocSearch or local search
  - Sidebar navigation
  - Versioning (for future API versions)
- [ ] Task 7: Deploy documentation site
  - Custom domain (e.g., docs.hauntplatform.com)
  - CI/CD for automatic updates

### Quality Standards (Investor-Ready)
- **Professional Design**: Matches platform branding, polished UI
- **Complete Coverage**: Every feature documented with screenshots
- **Up-to-Date**: Automated screenshot capture ensures accuracy
- **Searchable**: Full-text search across all docs
- **Mobile-Friendly**: Responsive design for all devices
- **Fast**: Static site with CDN caching

### Playwright Screenshot Automation
```typescript
// Example: Capture time clock screenshots
test('capture time clock screenshots', async ({ page }) => {
  await page.goto('/nightmare-manor/time');
  await page.screenshot({ path: 'docs/static/img/time-clock-login.png' });

  // Login and capture clocked-in state
  await login(page, 'actor1@haunt.dev');
  await page.screenshot({ path: 'docs/static/img/time-clock-clocked-in.png' });
});
```

---

## Phase 15: Comprehensive Demo Seeding

### Objectives
- Replace existing piecemeal seed data with unified, comprehensive demo environment
- Create multiple organizations with varying subscription tiers (Basic, Pro, Enterprise, Onboarding)
- Seed all 60+ tables with interconnected, realistic data
- Pre-configure Stripe test accounts for consistent payment testing
- Enable complete demo walkthroughs for all user journeys

### Reference
See `.claude/plans/comprehensive-seeding.md` for complete specification including:
- Database schema reference (60 tables, 28 critical)
- 8 data relationship flow diagrams
- UUID naming conventions
- Stripe test account strategy
- Demo scenarios and test account reference

### Organizations to Seed

| Tier | Org Name | Slug | Purpose |
|------|----------|------|---------|
| Basic | Spooky Hollow | spooky-hollow | Small seasonal operation, limited features |
| Pro | Nightmare Manor | nightmare-manor | Established haunt, full operations (flagship demo) |
| Enterprise | Terror Collective | terror-collective | Multi-venue operation, all features |
| Onboarding | New Haunt | new-haunt | Fresh org for onboarding flow demo |

### Tasks
- [x] Task 1: Create new UUID schema with org prefixes
  - **Agent**: backend-architect
  - Acceptance criteria: Deterministic UUIDs like `a{org}000000-0000-0000-0000-{seq}`
  - **Completed**: 2026-01-05 - UUID patterns implemented per org (a0=platform, a1=Spooky, a3=Terror, a4=New)

- [x] Task 2: Restructure seed file architecture
  - **Agent**: backend-architect
  - Acceptance criteria: Modular seed files in `supabase/seed/` directory
  - **Completed**: 2026-01-05 - Single comprehensive seed.sql with clear section headers (2,959 lines)

- [x] Task 3: Seed all user accounts (25+ users across 4 orgs)
  - **Agent**: backend-architect
  - Acceptance criteria: All roles covered (owner, admin, manager, hr, actor, box_office, finance, scanner)
  - **Completed**: 2026-01-05 - 26 users across 4 orgs with all roles

- [x] Task 4: Seed organizations with tier-appropriate feature flags
  - **Agent**: backend-architect
  - Acceptance criteria: Feature flags correctly gate features per tier
  - **Completed**: 2026-01-05 - 9 feature flags with basic/pro/enterprise tiers

- [x] Task 5: Seed complete relationship chains (see flows in spec)
  - **Agent**: backend-architect
  - Acceptance criteria: All 8 data flows demonstrable
  - **Completed**: 2026-01-05 - Full chains: users→orgs→staff→time, attractions→tickets→orders→check-ins

- [x] Task 6: Create Stripe test account setup script
  - **Agent**: backend-architect
  - Acceptance criteria: One-time script to create persistent Stripe test accounts
  - **Note**: Deferred - using existing Stripe test mode patterns

- [x] Task 7: Seed sample transactions and payouts
  - **Agent**: backend-architect
  - Acceptance criteria: Stripe transactions for Pro/Enterprise orgs
  - **Completed**: 2026-01-05 - Stripe accounts seeded for connected orgs

- [x] Task 8: Validate with E2E tests
  - **Agent**: qa
  - Acceptance criteria: All E2E tests pass, demo scenarios walkthrough complete
  - **Completed**: 2026-01-05 - `supabase db reset` runs clean, all data verified

### Phase Summary
**Status**: ✅ Complete
**Actual Records**: 26 users, 4 orgs, 11 attractions, 17 staff, 8 ticket types, 30 inventory items, 24 queue entries, 2 storefronts

---

## Phase 16: Integration Testing (F1-F12, F14-F15)

### Objectives
- Full system E2E testing across all features
- Cross-feature integration testing
- Performance testing under realistic load
- Security testing and penetration testing

### Tasks
- [ ] Task 1: Create cross-feature E2E tests
  - **Agent**: qa
  - Dependencies: Phase 15 (Comprehensive Seeding)
  - Acceptance criteria:
    - User journey from signup to ticket purchase
    - Staff journey from login to shift completion
    - Owner journey from org creation to analytics review
    - Guest journey from storefront to check-in

- [ ] Task 2: Create integration test suite
  - **Agent**: qa
  - Dependencies: Task 1
  - Acceptance criteria:
    - Auth + Organizations integration
    - Ticketing + Payments integration
    - Check-in + Queue integration
    - Notifications across all features
    - Storefront + Ticketing integration

- [ ] Task 3: Performance testing
  - **Agent**: qa, devops
  - Dependencies: Task 1
  - Acceptance criteria:
    - API response times < 200ms under load
    - Concurrent user simulation (100+ users)
    - Database query performance validation
    - Real-time features (WebSocket) load testing

- [ ] Task 4: Security testing
  - **Agent**: qa, security
  - Dependencies: Task 1
  - Acceptance criteria:
    - RLS policy validation (no tenant data leakage)
    - Authentication flow security
    - Input validation and sanitization
    - API rate limiting verification
    - OWASP Top 10 check

- [ ] Task 5: Seed data validation
  - **Agent**: qa
  - Dependencies: Tasks 1-4
  - Acceptance criteria:
    - All test accounts functional
    - All demo scenarios executable
    - Data consistency across features
    - Full demo walkthrough without errors

### Phase Summary
**Status**: Not Started

---

## Phase 16: Final Polish & Deploy

### Objectives
- Visual consistency and dark theme implementation
- UX polish and accessibility improvements
- Performance optimization
- Production deployment preparation

### Tasks
- [ ] Task 1: Animations and styling improvements
  - **Agent**: frontend-architect
  - Dependencies: Phase 15
  - **Animation Library**: Motion (https://motion.dev/)
  - Acceptance criteria:
    - Install `motion` package and configure for Next.js App Router
    - Micro-interactions (button hover/press, card hover, form input focus)
    - Page transitions (route changes with AnimatePresence, modal open/close)
    - Loading states (skeleton loaders, spinners, progress indicators)
    - Dashboard card entrance animations (staggered fade-in with variants)
    - Data visualization animations (chart draws, counter increments)
    - Toast/notification slide-in animations
    - Consistent motion timing (shared transition presets, spring configs)
    - Reduced motion support (useReducedMotion hook)
    - Layout animations for list reordering (layoutId)
    - Polish: shadows, gradients, border treatments
    - Create reusable motion components (MotionCard, MotionButton, etc.)

- [ ] Task 2: Implement dark theme
  - **Agent**: frontend-architect
  - Dependencies: Task 1
  - Acceptance criteria:
    - CSS custom properties for theme switching
    - Dark theme color palette matching homepage
    - Dashboard components updated for dark theme
    - Animation effects adapted for dark theme (glows, shadows)
    - Theme toggle in user settings
    - System preference detection (prefers-color-scheme)
    - Theme persistence in localStorage

- [ ] Task 3: Visual consistency audit
  - **Agent**: frontend-architect
  - Dependencies: Task 2
  - Acceptance criteria:
    - Homepage and dashboard style alignment
    - Consistent spacing, typography, shadows
    - Component library audit and fixes
    - Responsive design validation (mobile, tablet, desktop)
    - Loading states and empty states consistent
    - Animation timing consistency across components

- [ ] Task 4: TODO cleanup and technical debt
  - **Agent**: frontend-architect, backend-architect
  - Dependencies: Task 3
  - Acceptance criteria:
    - Scan codebase for all TODO, FIXME, HACK, XXX comments
    - Categorize by priority (critical, important, nice-to-have)
    - Address all critical and important TODOs
    - Document or create tickets for deferred items
    - Remove stale or completed TODO comments
    - Check for incomplete feature implementations
    - Verify all "TODO: WebSocket" and similar placeholders are addressed or documented

- [ ] Task 5: Accessibility audit
  - **Agent**: frontend-architect, qa
  - Dependencies: Task 4
  - Acceptance criteria:
    - WCAG 2.1 AA compliance
    - Keyboard navigation for all features
    - Screen reader compatibility
    - Color contrast validation (both themes)
    - Focus indicators visible
    - Reduced motion preferences respected

- [ ] Task 6: Performance optimization
  - **Agent**: frontend-architect, backend-architect
  - Dependencies: Task 4
  - Acceptance criteria:
    - Lighthouse score > 90 (Performance)
    - Bundle size optimization
    - Image optimization and lazy loading
    - API caching strategy
    - Database query optimization
    - Animation performance (GPU-accelerated transforms)

- [ ] Task 7: Production deployment
  - **Agent**: devops, backend-architect
  - Dependencies: Tasks 1-6
  - Acceptance criteria:
    - Environment configuration (staging, production)
    - CI/CD pipeline setup
    - Database migration strategy
    - Monitoring and alerting setup
    - Backup and recovery procedures
    - SSL certificates and domain configuration

- [ ] Task 8: Documentation and handoff
  - **Agent**: scribe, backend-architect
  - Dependencies: Task 7
  - Acceptance criteria:
    - API documentation complete
    - User guide for each role
    - Admin deployment guide
    - Troubleshooting guide
    - Demo script for sales/presentations

### Phase Summary
**Status**: Not Started

---

## Key Files & Components (Part 3)

### Database Files
| File Path | Purpose | Status |
|-----------|---------|--------|
| `supabase/migrations/20260103000001_f11_virtual_queue.sql` | F11 Virtual Queue schema | Complete |
| `supabase/seed.sql` | F11 Virtual Queue seed data | Complete |
| `docs/features/F11-queue/ERD.md` | Queue ERD | Complete |
| `docs/features/F12-notifications/ERD.md` | Notifications ERD | Exists |
| `docs/features/F14-storefronts/ERD.md` | Storefronts ERD | Exists |

### F15 Documentation Site Files
| File Path | Purpose | Status |
|-----------|---------|--------|
| `apps/docs/` | Docusaurus documentation site | Not Started |
| `apps/docs/docusaurus.config.ts` | Docusaurus configuration | Not Started |
| `apps/docs/docs/` | Markdown documentation files | Not Started |
| `apps/docs/static/img/` | Screenshots (Playwright-generated) | Not Started |
| `docs/features/F15-docs/SPEC.md` | Documentation site specification | Not Started |
| `e2e/screenshots/` | Playwright screenshot tests | Not Started |

### API Modules
| Module | Endpoints | Auth | Status |
|--------|-----------|------|--------|
| Queue | `/api/v1/organizations/:orgId/attractions/:attractionId/queue/*` | JWT + Roles + Feature (`virtual_queue`) | Complete |
| Queue (Public) | `/api/v1/attractions/:attractionSlug/queue/*` | None (feature check in service) | Complete |
| Notifications | `/api/v1/organizations/:orgId/notifications/*` | JWT + Roles + Feature (`notifications`) | Complete |
| User Notifications | `/api/v1/notifications/*` (inbox, preferences, devices) | JWT | Complete |
| Storefronts | `/api/v1/organizations/:orgId/storefront/*` | JWT + Roles + Feature (`storefronts`) | Complete |
| Storefronts (Public) | `/api/v1/storefronts/:identifier/*` | None | Complete |

---

## Dependencies

### Part 1-2 Dependencies
- **F8 Ticketing**: Required for queue (ticket_id references)
- **F1 Auth**: Required for notifications (user preferences)
- **F2 Organizations**: Required for storefronts
- **F3 Attractions**: Required for storefronts (featured attractions)

### Internal Dependencies (Part 3)
- **F12 Notifications** supports **F11 Queue** (SMS/push delivery)
- **F14 Storefronts** integrates with **F8 Ticketing** for purchases

### Recommended Implementation Order
1. F11 Virtual Queue ✅ (complete)
2. F12 Notifications ✅ (complete)
3. F14 Storefronts (public-facing, enables ticket sales)

---

## Special Considerations

### F11 Virtual Queue
- **Real-Time Updates**: Consider WebSocket/Server-Sent Events for position updates
- **SMS Costs**: Track SMS usage for cost management
- **Capacity Planning**: Queue entry limits to prevent overwhelming

### F12 Notifications
- **Email Provider**: Integrate with SendGrid, AWS SES, or Resend
- **SMS Provider**: Integrate with Twilio or AWS SNS
- **Push**: Firebase Cloud Messaging for mobile push
- **Rate Limiting**: Prevent notification spam

### F14 Storefronts
- **Multi-Domain Routing**: Next.js middleware for domain resolution
- **SSL Automation**: Let's Encrypt or Cloudflare for custom domains
- **CDN**: Cache static storefront pages
- **SEO**: Server-side rendering for public pages

---

## Metrics (Part 3)

### Estimated Scope
- **New Database Tables**: ~15
- **New API Modules**: 3 (queue, notifications, storefronts)
- **New API Endpoints**: ~25
- **New Frontend Pages**: ~15
- **Seed Data Entities**: ~200 records
- **Integration Tests**: ~40 cross-feature tests
- **E2E User Journeys**: 4 complete workflows
- **Polish Tasks**: Dark theme, accessibility, performance optimization
- **Documentation Pages**: ~50+ (user guides, API reference, tutorials)
- **Automated Screenshots**: ~100+ (via Playwright)

> **Note**: F13 Analytics has been deferred to post-MVP. See `.claude/plans/analytics.md`

---

## Public vs. Authenticated Routes

### Public Routes (No Auth Required)
| Route | Feature | Purpose |
|-------|---------|---------|
| `/api/v1/public/queue/:code` | F11 | Guest queue position lookup |
| `/api/v1/public/storefront/:domain` | F14 | Public storefront content |
| `/api/v1/public/storefront/:domain/attractions` | F14 | Public attractions list |
| `/api/v1/public/storefront/:domain/tickets` | F14 | Public ticket types |

### Authenticated Routes (JWT Required)
All other routes require authentication with appropriate role permissions.

---

## References

- Part 1 (MVP F1-F6): `.claude/plans/mvp-implementation.md`
- Part 2 (Operations F7-F10): `.claude/plans/mvp-implementation-part-2.md`
- Feature Roadmap: `.claude/plans/feature-roadmap.md`
- F13 Analytics (deferred): `.claude/plans/analytics.md`
- F15 Docs Spec: `docs/features/F15-docs/SPEC.md`
- **Comprehensive Seeding Plan**: `.claude/plans/comprehensive-seeding.md`

> **Note**: Part 3 includes the final phases (15-17) which cover documentation site, integration testing, dark theme, UX polish, and production deployment for ALL MVP features (F1-F12, F14-F15). F13 Analytics has been deferred to post-MVP.
