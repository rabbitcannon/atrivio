# Haunt Platform - Implementation Plan Part 3: Engagement & Growth (F11-F16)

**Created Date**: 2025-12-31
**Last Updated**: 2026-01-02
**Current Session**: Not Started
**Overall Progress**: 0% Complete

> **Note**: Part 3 covers Engagement & Growth features (F11-F16). Requires Part 1 (MVP F1-F6) and Part 2 (F7-F10) to be complete.

## Quick Start for Next Session

**Prerequisites**: Parts 1-2 (F1-F10) should be complete before starting Part 3
**Last Completed**: N/A
**Currently Working On**: Ready to start after Part 2 completion
**Next Action**: Design F11 Virtual Queue refinement and migration

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
| 11 | Engagement Database | Not Started | F11-F14 | ~20 new tables |
| 12 | Engagement API | Not Started | F11-F14 | 4 new modules |
| 13 | Engagement Frontend | Not Started | F11-F14 | Queue, notifications, analytics, storefronts |
| 14 | Engagement Testing | Not Started | F11-F14 | E2E tests for engagement |
| 15 | Documentation Site | Not Started | F15 | Docusaurus + Playwright screenshots |
| 16 | Integration Testing | Not Started | F1-F15 | Full system E2E tests |
| 17 | Final Polish & Deploy | Not Started | All | Dark theme, UX polish, production deploy |

**Status Legend**: Not Started | In Progress | Complete | Blocked | On Hold

---

## Feature Status Matrix

| Feature | ERD/Spec | Migration | Seed Data | API | Frontend | Tests | Status |
|---------|----------|-----------|-----------|-----|----------|-------|--------|
| **F11** Virtual Queue | Exists | Not Started | Not Started | Not Started | Not Started | Not Started | Not Started |
| **F12** Notifications | Exists | Not Started | Not Started | Not Started | Not Started | Not Started | Not Started |
| **F13** Analytics | Exists | Not Started | Not Started | Not Started | Not Started | Not Started | Not Started |
| **F14** Storefronts | Exists | Not Started | Not Started | Not Started | Not Started | Not Started | Not Started |
| **F15** Documentation Site | Not Started | N/A | N/A | N/A | Not Started | Not Started | Not Started |

---

## Seed Data Strategy (F11-F14)

### Purpose
Comprehensive seed data for engagement features enables:
1. **Demo**: Show virtual queue, notifications, analytics dashboards, storefronts
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

#### F13: Analytics
**File**: `infrastructure/supabase/seed.sql` (extend)

| Entity | Count | Demo Scenarios |
|--------|-------|----------------|
| Daily Metrics | 60 | 2 months of daily data |
| Hourly Metrics | 200 | Detailed hourly breakdown |
| Ticket Type Metrics | 40 | Per-ticket-type performance |
| Promo Metrics | 20 | Promo code effectiveness |
| Staff Metrics | 50 | Staff performance data |
| Saved Reports | 5 | Pre-configured report templates |

**Demo Scenarios**:
- Dashboard shows revenue trends
- Ticket type performance comparison
- Staff hours and productivity
- Peak attendance patterns

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

## Phase 11: Engagement Database (F11-F14)

### Objectives
- Implement virtual queue, notifications, analytics, and storefront schemas
- Create notification templates and analytics materialized views
- Set up RLS policies for public and authenticated access

### Tasks
- [ ] Task 1: Review and refine F11 Virtual Queue ERD
  - **Agent**: backend-architect
  - Dependencies: F8 Ticketing complete
  - Acceptance criteria: queue_configs, queue_entries, queue_notifications, queue_stats tables
- [ ] Task 2: Review and refine F12 Notifications ERD
  - **Agent**: backend-architect
  - Dependencies: F1 Auth complete
  - Acceptance criteria: notification_templates, notifications, preferences, push_devices tables
- [ ] Task 3: Review and refine F13 Analytics ERD
  - **Agent**: backend-architect
  - Dependencies: All features for aggregation
  - Acceptance criteria: daily_metrics, hourly_metrics, ticket_type_metrics, staff_metrics, saved_reports
- [ ] Task 4: Review and refine F14 Storefronts ERD
  - **Agent**: backend-architect
  - Dependencies: F2 Organizations, F3 Attractions complete
  - Acceptance criteria: storefront_settings, pages, domains, navigation, faqs, announcements tables
- [ ] Task 5: Write migration for F11-F14
  - **Agent**: backend-architect
  - Dependencies: Tasks 1-4
  - Acceptance criteria: `003_engagement.sql` migration runs clean
- [ ] Task 6: Create seed data for F11-F14
  - **Agent**: backend-architect
  - Dependencies: Task 5
  - Acceptance criteria:
    - 3 queue configs with realistic settings
    - 50 queue entries in various states
    - 15 notification templates (email, SMS, push)
    - 100 notification history records
    - 60 days of daily metrics
    - Storefront settings with custom branding
    - 8 storefront pages with content
    - 15 FAQs across categories

### Phase Summary
**Status**: Not Started

---

## Phase 12: Engagement API (F11-F14)

### Objectives
- Build NestJS modules for queue, notifications, analytics, storefronts
- Implement real-time features (queue updates, notifications)
- Create analytics aggregation jobs

### Tasks
- [ ] Task 1: Build modules/queue
  - **Agent**: backend-architect
  - Dependencies: Phase 11
  - Acceptance criteria:
    - Queue config management
    - Join/leave queue endpoints
    - Position and wait time calculation
    - WebSocket for real-time updates
- [ ] Task 2: Build modules/notifications
  - **Agent**: backend-architect
  - Dependencies: Phase 11
  - Acceptance criteria:
    - Template management
    - Send notification (email/SMS/push)
    - Notification preferences CRUD
    - Push device registration
- [ ] Task 3: Build modules/analytics
  - **Agent**: backend-architect
  - Dependencies: Phase 11
  - Acceptance criteria:
    - Dashboard metrics endpoints
    - Date range filtering
    - Report generation
    - Aggregation job triggers
- [ ] Task 4: Build modules/storefronts
  - **Agent**: backend-architect
  - Dependencies: Phase 11
  - Acceptance criteria:
    - Settings management
    - Page CRUD with publishing
    - Domain verification workflow
    - Public storefront API (no auth)
- [ ] Task 5: Verify seed data via API
  - **Agent**: backend-architect
  - Dependencies: Tasks 1-4
  - Acceptance criteria:
    - Queue shows current entries and wait times
    - Notifications list shows history
    - Analytics returns seeded metrics
    - Public storefront API returns published content

### Phase Summary
**Status**: Not Started

---

## Phase 13: Engagement Frontend (F11-F14)

### Objectives
- Build queue management and guest-facing UI
- Build notification center and preferences
- Build analytics dashboards with charts
- Build storefront editor and preview

### Tasks
- [ ] Task 1: Create virtual queue pages
  - **Agent**: frontend-architect
  - Dependencies: Phase 12
  - Acceptance criteria:
    - Queue configuration settings
    - Live queue status dashboard
    - Guest-facing queue position page
    - Queue entry management
- [ ] Task 2: Create notification pages
  - **Agent**: frontend-architect
  - Dependencies: Phase 12
  - Acceptance criteria:
    - Template editor with variables
    - Notification history with filters
    - User preference settings
    - Send notification form
- [ ] Task 3: Create analytics dashboard
  - **Agent**: frontend-architect
  - Dependencies: Phase 12
  - Acceptance criteria:
    - Revenue and sales charts
    - Attendance and capacity graphs
    - Ticket type performance
    - Staff metrics dashboard
    - Saved reports management
- [ ] Task 4: Create storefront editor
  - **Agent**: frontend-architect
  - Dependencies: Phase 12
  - Acceptance criteria:
    - Branding and theme editor
    - Page content editor (markdown)
    - Navigation manager
    - Domain configuration
    - FAQ manager
    - Announcement manager
    - Live preview
- [ ] Task 5: Create public storefront
  - **Agent**: frontend-architect
  - Dependencies: Task 4
  - Acceptance criteria:
    - Public homepage with hero
    - Attractions listing
    - Custom pages
    - FAQ page
    - Ticket purchase flow
- [ ] Task 6: Verify UI displays seed data correctly
  - **Agent**: frontend-architect
  - Dependencies: Tasks 1-5
  - Acceptance criteria:
    - Queue dashboard shows 50 seeded entries
    - Analytics shows 60 days of metrics
    - Storefront displays custom branding
    - Public storefront renders all pages

### Phase Summary
**Status**: Not Started

---

## Phase 14: Engagement Testing (F11-F14)

### Objectives
- E2E testing of engagement workflows
- Integration testing of real-time features
- Public storefront testing

### Tasks
- [ ] Task 1: Create queue E2E tests
  - **Agent**: qa
  - Dependencies: Phase 13
  - Acceptance criteria:
    - Guest joins queue
    - Position updates in real-time
    - Notification sent when ready
    - Handle queue expiration
- [ ] Task 2: Create notification E2E tests
  - **Agent**: qa
  - Dependencies: Phase 13
  - Acceptance criteria:
    - Send email notification
    - Update preferences
    - Template variable substitution
- [ ] Task 3: Create analytics E2E tests
  - **Agent**: qa
  - Dependencies: Phase 13
  - Acceptance criteria:
    - Dashboard loads with data
    - Date range filtering works
    - Export report generates file
- [ ] Task 4: Create storefront E2E tests
  - **Agent**: qa
  - Dependencies: Phase 13
  - Acceptance criteria:
    - Public storefront loads
    - Custom pages render
    - Ticket purchase flow completes
    - Domain verification flow
- [ ] Task 5: Verify seed data integrity
  - **Agent**: qa
  - Dependencies: Tasks 1-4
  - Acceptance criteria:
    - All seeded queue entries accessible
    - Analytics metrics aggregate correctly
    - Storefront content displays properly

### Phase Summary
**Status**: Not Started

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

## Phase 15: Integration Testing (F1-F15)

### Objectives
- Full system E2E testing across all features
- Cross-feature integration testing
- Performance testing under realistic load
- Security testing and penetration testing

### Tasks
- [ ] Task 1: Create cross-feature E2E tests
  - **Agent**: qa
  - Dependencies: Phase 14
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
    - Analytics data accuracy from all sources

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
- [ ] Task 1: Implement dark theme
  - **Agent**: frontend-architect
  - Dependencies: Phase 15
  - Acceptance criteria:
    - CSS custom properties for theme switching
    - Dark theme color palette matching homepage
    - Dashboard components updated for dark theme
    - Theme toggle in user settings
    - System preference detection (prefers-color-scheme)
    - Theme persistence in localStorage

- [ ] Task 2: Visual consistency audit
  - **Agent**: frontend-architect
  - Dependencies: Task 1
  - Acceptance criteria:
    - Homepage and dashboard style alignment
    - Consistent spacing, typography, shadows
    - Component library audit and fixes
    - Responsive design validation (mobile, tablet, desktop)
    - Loading states and empty states consistent

- [ ] Task 3: Accessibility audit
  - **Agent**: frontend-architect, qa
  - Dependencies: Task 2
  - Acceptance criteria:
    - WCAG 2.1 AA compliance
    - Keyboard navigation for all features
    - Screen reader compatibility
    - Color contrast validation (both themes)
    - Focus indicators visible

- [ ] Task 4: Performance optimization
  - **Agent**: frontend-architect, backend-architect
  - Dependencies: Task 2
  - Acceptance criteria:
    - Lighthouse score > 90 (Performance)
    - Bundle size optimization
    - Image optimization and lazy loading
    - API caching strategy
    - Database query optimization

- [ ] Task 5: Production deployment
  - **Agent**: devops, backend-architect
  - Dependencies: Tasks 1-4
  - Acceptance criteria:
    - Environment configuration (staging, production)
    - CI/CD pipeline setup
    - Database migration strategy
    - Monitoring and alerting setup
    - Backup and recovery procedures
    - SSL certificates and domain configuration

- [ ] Task 6: Documentation and handoff
  - **Agent**: scribe, backend-architect
  - Dependencies: Task 5
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
| `infrastructure/supabase/migrations/003_engagement.sql` | F11-F14 schema | Not Started |
| `docs/features/F11-queue/ERD.md` | Queue ERD | Exists |
| `docs/features/F12-notifications/ERD.md` | Notifications ERD | Exists |
| `docs/features/F13-analytics/ERD.md` | Analytics ERD | Exists |
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

### API Modules (Planned)
| Module | Endpoints | Auth | Status |
|--------|-----------|------|--------|
| Queue | `/api/v1/organizations/:orgId/queues/*` | JWT + Roles | Not Started |
| Queue (Public) | `/api/v1/public/queue/:code` | None | Not Started |
| Notifications | `/api/v1/organizations/:orgId/notifications/*` | JWT + Roles | Not Started |
| Analytics | `/api/v1/organizations/:orgId/analytics/*` | JWT + Roles | Not Started |
| Storefronts | `/api/v1/organizations/:orgId/storefront/*` | JWT + Roles | Not Started |
| Storefronts (Public) | `/api/v1/public/storefront/:domain/*` | None | Not Started |

---

## Dependencies

### Part 1-2 Dependencies
- **F8 Ticketing**: Required for queue (ticket_id references)
- **F1 Auth**: Required for notifications (user preferences)
- **F2 Organizations**: Required for storefronts
- **F3 Attractions**: Required for storefronts (featured attractions)
- **All Features**: Required for analytics (aggregates all data)

### Internal Dependencies (Part 3)
- **F12 Notifications** supports **F11 Queue** (SMS/push delivery)
- **F13 Analytics** aggregates data from **F7-F12**
- **F14 Storefronts** integrates with **F8 Ticketing** for purchases

### Recommended Implementation Order
1. F12 Notifications (foundational for queue and system alerts)
2. F11 Virtual Queue (uses notifications for alerts)
3. F14 Storefronts (public-facing, high visibility)
4. F13 Analytics (aggregates all data, build last)

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

### F13 Analytics
- **Materialized Views**: Use for expensive aggregations
- **Cron Jobs**: Daily aggregation jobs for metrics
- **Data Retention**: Consider archiving old hourly metrics
- **Export Formats**: CSV, PDF report generation

### F14 Storefronts
- **Multi-Domain Routing**: Next.js middleware for domain resolution
- **SSL Automation**: Let's Encrypt or Cloudflare for custom domains
- **CDN**: Cache static storefront pages
- **SEO**: Server-side rendering for public pages

---

## Metrics (Part 3)

### Estimated Scope
- **New Database Tables**: ~20
- **New API Modules**: 4 (queue, notifications, analytics, storefronts)
- **New API Endpoints**: ~35
- **New Frontend Pages**: ~20
- **Seed Data Entities**: ~500 records
- **Integration Tests**: ~50 cross-feature tests
- **E2E User Journeys**: 4 complete workflows
- **Polish Tasks**: Dark theme, accessibility, performance optimization
- **Documentation Pages**: ~50+ (user guides, API reference, tutorials)
- **Automated Screenshots**: ~100+ (via Playwright)

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
- F15 Docs Spec: `docs/features/F15-docs/SPEC.md`
- API Docs: `docs/features/F11-F14/API.md`
- ERD Docs: `docs/features/F11-F14/ERD.md`

> **Note**: Part 3 includes the final phases (15-17) which cover documentation site, integration testing, dark theme, UX polish, and production deployment for ALL features (F1-F15).
