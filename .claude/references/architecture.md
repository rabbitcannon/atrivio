# Ultimate Haunt Platform

## Architecture & System Design (Supabase + TypeScript)

> This document defines the architecture, patterns, constraints, and non-negotiable rules for building a unified, multi-tenant haunt-industry platform.
>
> **All generated code MUST follow this document.**

---

## 1. Core Principles

### 1.1 Architecture Style

**Modular Monolith (DDD-lite)**

- One backend application
- Internally split into strict modules
- Modules own:
  - Their database tables
  - Their business logic
  - Their domain rules
- **Modules must not directly access another module's tables**

This structure allows:
- Fast initial development
- Clear ownership boundaries
- Future extraction into microservices if required

### 1.2 Technology Stack

| Layer | Technology |
|-------|------------|
| **Language** | TypeScript (end-to-end) |
| **Backend Framework** | NestJS |
| **Frontend** | Next.js (React) |
| **Database** | Supabase PostgreSQL |
| **Auth** | Supabase Auth |
| **DB Access** | `@supabase/supabase-js` + SQL RPC |
| **Queues** | Redis + BullMQ |
| **Payments** | Stripe |
| **Storage** | Supabase Storage (S3-compatible) |
| **Email** | Postmark or SendGrid |
| **SMS** | Twilio |
| **Realtime** | Supabase Realtime + NestJS WebSockets (hybrid) |
| **Mobile (future)** | React Native (Expo) |

---

## 2. Multi-Tenancy Model

### 2.1 Tenant Structure

- **Organization (org)** is the tenant boundary
- Haunts belong to an Organization
- Users can belong to multiple Organizations
- All data is isolated per Organization

### 2.2 Required Tables (Core)

| Table | Description |
|-------|-------------|
| `organizations` | Tenant root entity |
| `haunts` | Haunt locations within an org |
| `users` | Supabase Auth managed |
| `org_memberships` | User-to-org relationships |
| `haunt_memberships` | Optional role overrides per haunt |

### 2.3 Database Rules

Every tenant-scoped table **must** include:
- `org_id` (required)
- `haunt_id` (when applicable)

**Requirements:**
- All tenant tables must have RLS enabled
- No table may be accessible without tenant scoping

---

## 3. Authentication & Authorization (RBAC)

### 3.1 Authentication

Supabase Auth provides:
- JWTs
- User identity (`auth.uid()`)

**Flow:**
- Backend verifies Supabase JWTs on every request
- JWT is passed to Supabase client to enforce RLS

### 3.2 Roles

| Role | Description |
|------|-------------|
| Owner | Full organization access |
| Manager | Operational management |
| HR / Recruitment | Staff management |
| Box Office | Ticket sales |
| Finance | Financial operations |
| Actor | Performance staff |
| Scanner / Kiosk | Check-in operations |

### 3.3 Permissions

- Fine-grained permissions (string-based)
- Examples: `ticket:refund`, `schedule:publish`, `staff:override_clock`
- Stored in DB and mapped to roles
- Evaluated in:
  - **Service layer** (required)
  - **RLS policies** (defense-in-depth)

### 3.4 Enforcement Rules

```
┌─────────────────────────────────────────────────────────────┐
│  Controllers  │  Validate authentication + org membership   │
├───────────────┼─────────────────────────────────────────────┤
│  Services     │  Enforce permissions                        │
├───────────────┼─────────────────────────────────────────────┤
│  RLS          │  Final enforcement layer                    │
└───────────────┴─────────────────────────────────────────────┘
```

> **Never rely on frontend checks**

---

## 4. Module Architecture Pattern

Each module follows:

```
Controller → Service → Repository
```

### 4.1 Controllers

- HTTP / WebSocket interfaces only
- Input validation (Zod or DTOs)
- Resolve tenant context (`org_id`, `haunt_id`)
- **No business logic**

### 4.2 Services

- Business logic
- Permission checks
- Cross-module orchestration
- Transaction coordination
- Emit domain events

### 4.3 Repositories

- Database access only
- Use Supabase client or SQL RPC
- Require `org_id` as an explicit parameter
- **No business logic**

---

## 5. Supabase Database & RLS Strategy

### 5.1 RLS Philosophy

- RLS is **mandatory** on all tenant-scoped tables
- RLS prevents cross-organization data access
- RLS protects against API bugs or misconfigurations

### 5.2 Helper Functions

Create SQL helper functions for reuse in RLS policies:

```sql
is_org_member(org_id)
has_org_role(org_id, role)
has_permission(org_id, permission)
```

### 5.3 RPC (SQL Functions)

Use Postgres functions (Supabase RPC) for:
- Multi-step transactions
- High-volume operations
- Idempotent workflows

**Examples:**
- `purchase_tickets(...)`
- `scan_ticket(...)`
- `publish_schedule(...)`
- `clock_in_staff(...)`

**RPC functions must:**
- Be transactional
- Respect RLS
- Be idempotent when applicable

---

## 6. Domain Events

### 6.1 Event-Driven Communication

Modules communicate via **domain events**, not direct calls.

### 6.2 Example Events

| Event | Trigger |
|-------|---------|
| `TicketPurchased` | Successful ticket sale |
| `TicketScanned` | Check-in completed |
| `RefundIssued` | Refund processed |
| `ShiftPublished` | Schedule released |
| `StaffClockedIn` | Time clock entry |
| `QueueAdvanced` | Virtual queue progress |
| `CostumeAssigned` | Inventory allocation |

### 6.3 Event Handling

- In-process event bus initially
- Events enqueue background jobs
- Events must be:
  - Serializable
  - Versioned
  - Idempotent

---

## 7. Background Jobs & Queues

### 7.1 Stack

- **Redis** - Message broker
- **BullMQ** - Job queue library

### 7.2 Job Use Cases

| Job Type | Description |
|----------|-------------|
| Abandoned cart recovery | Re-engage incomplete purchases |
| Ticket settlement & payout reports | Financial reconciliation |
| CSV / PDF exports | Async report generation |
| Webhook retries | Reliable external notifications |
| Scheduled staff notifications | Shift reminders |
| Virtual queue progression | Queue management |

### 7.3 Worker Rules

- Run in server environment
- Use Supabase service-role key
- **Never expose service-role key to clients**

---

## 8. Payments Architecture

### 8.1 Provider Abstraction

- All payments go through a `PaymentsProvider` interface
- Stripe is the first implementation
- Future providers (Square) must conform to interface

### 8.2 Webhooks

- Handled **only** by Payments module
- Raw webhook events stored in append-only table
- Webhooks translated into domain events

### 8.3 Financial Rules

| Rule | Rationale |
|------|-----------|
| All monetary values stored as integers (cents) | Precision |
| Explicit currency + fee breakdowns | Transparency |
| No floating-point math | Accuracy |

---

## 9. Ticketing & Check-In

### 9.1 Ticketing

- Products
- Ticket types
- Capacity rules
- Orders
- QR token generation

### 9.2 Check-In / Scanning

| Feature | Purpose |
|---------|---------|
| Fast QR validation | Sub-second scans |
| Offline support | Network resilience |
| Batch submission endpoints | Sync when online |
| Anti-fraud logic | Duplicate detection |
| Idempotent scanning | Safe retries |

> Use RPC functions for scanning to ensure atomicity.

---

## 10. Notifications System

### 10.1 Architecture

- Central Notifications module
- Feature modules emit notification requests
- Providers:
  - Email
  - SMS
  - Push (future)

### 10.2 Rules

- **No module sends notifications directly**
- Templates are versioned and reusable
- All notifications are auditable

---

## 11. File & Document Storage

### 11.1 Storage

- Supabase Storage
- Presigned uploads
- Metadata stored in DB

### 11.2 Access Control

- Files scoped to `org_id`
- RLS or service-level permission checks enforced

---

## 12. Realtime System

### 12.1 Use Cases

- Live ticket sales
- Capacity updates
- Virtual queue notifications
- Staff attendance

### 12.2 Architecture

| Source | Use Case |
|--------|----------|
| Supabase Realtime | DB-driven events |
| NestJS WebSockets | Computed or non-DB events |

**Channel Scoping:**
```
org:{orgId}
org:{orgId}:haunt:{hauntId}
```

---

## 13. Mobile App Readiness (Future)

### 13.1 Design Constraints

- API-first backend
- No web-only assumptions
- Idempotent endpoints
- Device registration & identity

### 13.2 Mobile Use Cases

- Staff scheduling
- Messaging & alerts
- Scanner / kiosk app
- Manager operations dashboard

---

## 14. Recommended Module Breakdown

### Core Platform

| Module | Responsibility |
|--------|----------------|
| Auth | Authentication flows |
| Tenancy | Multi-tenant infrastructure |
| RBAC | Role-based access control |
| Audit Logging | Activity tracking |

### Business Modules

| Module | Responsibility |
|--------|----------------|
| Organizations & Haunts | Tenant management |
| Staff & Actors | Personnel management |
| Scheduling | Shift planning |
| Ticketing | Ticket sales & products |
| Check-In | Scanning & validation |
| Payments | Financial transactions |
| Inventory & Costumes | Asset management |
| Operations Planner | Event coordination |
| Marketing | Promotions & campaigns |
| Analytics | Reporting & insights |
| Notifications | Communication dispatch |

**Each module owns:**
- Its tables
- Its services
- Its events

---

## 15. Non-Negotiable Rules

| Rule | Enforcement |
|------|-------------|
| All data access is tenant-scoped | RLS + Service layer |
| RLS is enabled everywhere | Database policy |
| Permission checks live in services | Code review |
| Money is integer-based | Type enforcement |
| Events over direct coupling | Architecture review |
| Idempotency for payments, scans, and jobs | Testing |
| Service-role keys never reach clients | Security audit |

---

## 16. Goal

This architecture must:

- ✅ Scale from single-haunt operators to enterprise clients
- ✅ Support web and mobile clients
- ✅ Remain secure under multi-tenant load
- ✅ Allow future service extraction without rewrites
