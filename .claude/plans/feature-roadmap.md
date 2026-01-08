# Feature Implementation Roadmap

## Overview

Features are implemented in phases after scaffolding is complete. Each feature requires an ERD before implementation begins.

---

## Feature Phases

| Phase | Feature | ERD Location | Dependencies | Priority |
|-------|---------|--------------|--------------|----------|
| **F1** | Auth & Users | `docs/features/F1-auth/ERD.md` | None | Critical |
| **F2** | Organizations | `docs/features/F2-organizations/ERD.md` | F1 | Critical |
| **F3** | Haunts/Venues | `docs/features/F3-haunts/ERD.md` | F2 | Critical |
| **F4** | Staff & Roles | `docs/features/F4-staff/ERD.md` | F3 | High |
| **F5** | Platform Admin | `docs/features/F5-admin/ERD.md` | F1-F4 | High |
| **F6** | Stripe Connect | `docs/features/F6-payments/ERD.md` | F2 | High |
| **F7** | Scheduling | `docs/features/F7-scheduling/ERD.md` | F4 | Medium |
| **F8** | Ticketing | `docs/features/F8-ticketing/ERD.md` | F3, F6 | Medium |
| **F9** | Check-In | `docs/features/F9-checkin/ERD.md` | F8 | Medium |
| **F10** | Inventory | `docs/features/F10-inventory/ERD.md` | F4 | Low |
| **F11** | Virtual Queue | `docs/features/F11-queue/ERD.md` | F8 | Low |
| **F12** | Notifications | `docs/features/F12-notifications/ERD.md` | F1-F4 | Low |
| **F13** | Analytics | `docs/features/F13-analytics/ERD.md` | All | Low |
| **F14** | Permissions & RBAC | `docs/features/F14-permissions/ERD.md` | F2, F4, F5 | Medium |
| **F15** | Documentation Site | `docs/features/F15-docs/SPEC.md` | F1-F14 | High |

### Future/Optional Features

| Feature | Name | ERD Location | Dependencies | Notes |
|---------|------|--------------|--------------|-------|
| **F100** | Platform Billing | `docs/features/F100-billing/ERD.md` | F2, F6 | Optional - requires pricing approval |

---

## MVP Phases

### MVP Part 1 - Foundation (F1-F4)
- F1: Auth & Users
- F2: Organizations
- F3: Attractions/Venues
- F4: Staff & Roles

### MVP Part 2 - Admin & Payments (F5-F6)
- F5: Platform Admin
- F6: Stripe Connect

### MVP Part 3 - Operations & Permissions (F7, F14)
- F7: Scheduling
- F14: Permissions & RBAC (configurable role permissions per org)

---

## Feature Implementation Workflow

For each feature:

```
1. CREATE ERD
   └── docs/features/FX-name/ERD.md

2. DESIGN API
   └── docs/features/FX-name/API.md

3. WRITE MIGRATIONS
   └── packages/database/migrations/XXX_feature.sql

4. IMPLEMENT BACKEND
   └── apps/api/src/modules/feature/*.ts

5. IMPLEMENT FRONTEND
   └── apps/web/src/app/(dashboard)/feature/**

6. WRITE TESTS
   └── apps/api/test/feature/*.spec.ts

7. UPDATE DOCS
   └── docs/features/FX-name/IMPLEMENTATION.md
```

---

## Critical Path

```
F1 (Auth) → F2 (Orgs) → F3 (Haunts) → F4 (Staff) → F5 (Admin)
                    ↘                          ↗
                      F6 (Payments) ──────────┘
```

MVP Part 1-2 requires: F1, F2, F3, F4, F5, F6
MVP Part 3 adds: F7, F14

---

## Dependency Graph

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
             │
             ▼
F7 Scheduling ◄── F4
             │
F14 Permissions ◄── F2, F4, F5
             │
F8 Ticketing ◄── F3, F6
             │
             ▼
F9 Check-In ◄── F8
             │
F10 Inventory ◄── F4
             │
F11 Queue ◄── F8
             │
F12 Notifications ◄── F1-F4
             │
             ▼
F13 Analytics ◄── All
```
