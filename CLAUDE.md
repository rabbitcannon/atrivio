# Attraction Platform

Multi-tenant SaaS for the attractions industry (haunted attractions, escape rooms, mazes, theme parks, entertainment venues).

## Architecture

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: NestJS 11+ with Fastify adapter
- **Frontend**: Next.js 15 App Router, React 19, Tailwind v4, shadcn/ui
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Auth (PKCE flow)
- **Payments**: Stripe Connect (Express accounts)
- **Queue**: BullMQ + Redis

## Role Hierarchy

| Level | Roles |
|-------|-------|
| Platform | `super_admin` (god mode, bypasses RLS) |
| Org | `owner` → `admin` → `manager`, `hr`, `box_office`, `finance`, `actor`, `scanner` |

- Users can belong to multiple orgs with different roles
- `owner` is protected (original signup), only they can promote to `admin`

## Multi-Tenancy

- All org data scoped via `org_id` column
- RLS enforces tenant isolation
- Super admin uses service-role key to bypass RLS

## Key Patterns

- **Branded IDs**: `OrgId`, `AttractionId`, `UserId` prevent mixing types
- **Permission strings**: Template literals like `ticket:refund`, `schedule:publish`
- **Money**: Always integers (cents) - use `@atrivio/shared/utils/money`

## Implemented Features

### MVP (Part 1) - Foundation
| Feature | Status | Description |
|---------|--------|-------------|
| F1 Organizations | ✅ Complete | Multi-tenant org management |
| F2 Auth | ✅ Complete | Supabase Auth with PKCE |
| F3 Attractions | ✅ Complete | Haunt/attraction management |
| F4 Staff | ✅ Complete | Staff profiles, roles, time clock |
| F5 Admin | ✅ Complete | Platform admin dashboard |
| F6 Payments | ✅ Complete | Stripe Connect integration |

### MVP (Part 2) - Operations
| Feature | Status | Description |
|---------|--------|-------------|
| F7a Time Tracking | ✅ Complete | Clock in/out, status tracking |
| F7b Scheduling | ✅ Complete | Shifts, availability, swaps |
| F8 Ticketing | ✅ Complete | Ticket types, orders, promo codes |
| F9 Check-In | ✅ Complete | Barcode scan, capacity, waivers |
| F10 Inventory | 🔲 Pending | Props, costumes, checkouts |
| F15 Media | ✅ Complete | Cloudflare R2 storage, tier-based limits |

## Subscription Tiers

Organizations have subscription tiers that gate feature access via Stripe subscriptions.

### Tier Configuration
| Tier | Price | Attractions | Staff | Orders/month | Custom Domains | Storage |
|------|-------|-------------|-------|--------------|----------------|---------|
| **Free** | $0 | 1 | 10 | 100 | 0 (subdomain only) | URL linking only |
| **Pro** | $149 | 5 | 50 | 1,000 | 5 | 500 MB |
| **Enterprise** | $499 | Unlimited | Unlimited | Unlimited | 10 | 5 GB |

### Features by Tier
| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Ticketing & Orders | ✅ | ✅ | ✅ |
| Check-In & Scanning | ✅ | ✅ | ✅ |
| Time Tracking | ✅ | ✅ | ✅ |
| Email Notifications | ✅ | ✅ | ✅ |
| Link External Images | ✅ | ✅ | ✅ |
| Staff Scheduling | ❌ | ✅ | ✅ |
| Inventory Management | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Storefronts | ❌ | ✅ | ✅ |
| Custom Domains | ❌ | ✅ | ✅ |
| Media Uploads (500MB) | ❌ | ✅ | ✅ |
| Virtual Queue | ❌ | ❌ | ✅ |
| SMS Notifications | ❌ | ❌ | ✅ |
| Media Uploads (5GB) | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |

### Demo Accounts
Password for all test accounts: `password123`

| Email | Organization | Tier | Role |
|-------|--------------|------|------|
| `admin@haunt.dev` | Platform | N/A | Super Admin |
| `free@haunt.dev` | Spooky Hollow | Free | Owner |
| `pro@haunt.dev` | Nightmare Manor | Pro | Owner |
| `enterprise@haunt.dev` | Terror Collective | Enterprise | Owner |
| `owner@haunt.dev` | Nightmare Manor | Pro | Owner |
| `manager@haunt.dev` | Nightmare Manor | Pro | Manager |
| `actor1@haunt.dev` | Nightmare Manor | Pro | Actor |

## Feature Flags

The platform uses a tier-based feature flag system for plan-based access control.

### Flag Keys by Tier
| Tier | Feature Keys |
|------|--------------|
| **free** | ticketing, checkin, time_tracking, notifications |
| **pro** | + scheduling, inventory, analytics_pro, storefronts, media_uploads |
| **enterprise** | + virtual_queue, sms_notifications, custom_domains |

### Per-Org Activation
Feature flags are enabled per-organization via:
- `enabled: true` + `rollout_percentage: 100` = All orgs get it
- `org_ids: ['uuid']` = Only specific orgs get the feature
- Orgs upgrade their tier to unlock gated features

### Using Feature Flags

**API (Controller level)**:
```typescript
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Feature } from '../../core/features/decorators/feature.decorator.js';

@Controller('organizations/:orgId/schedules')
@UseGuards(FeatureGuard)
@Feature('scheduling')  // Requires 'scheduling' flag to be enabled
export class SchedulingController {}
```

**API (Service level)**:
```typescript
import { FeaturesService } from '../../core/features/features.service.js';

if (await this.featuresService.isEnabled('virtual_queue', orgId)) {
  // Enable virtual queue features
}
```

### Database Function
```sql
-- Check if feature is enabled for org/user
SELECT is_feature_enabled('scheduling', user_id, org_id);
```

### Adding New Feature Flags
1. Add to `supabase/seed.sql` in the `feature_flags` INSERT
2. Set `metadata.tier` to 'basic', 'pro', or 'enterprise'
3. Set `metadata.module: true` for module-level flags
4. Apply `@Feature('flag-key')` decorator to controllers

## Feature Implementation

Before implementing any feature:
1. Create ERD in `docs/features/FX-name/ERD.md`
2. Design API in `docs/features/FX-name/API.md`
3. Write migrations in `supabase/migrations/` (NOT `infrastructure/supabase/migrations/`)

See `.claude/plans/feature-roadmap.md` for implementation order.

## Agent Auto-Activation

### Frontend Agent (`/frontend`)
**Auto-activate when working on:**
- Components in `apps/web/src/components/`
- Pages in `apps/web/src/app/`
- React hooks in `apps/web/src/hooks/`
- Any UI/UX implementation tasks
- Keywords: component, page, form, dashboard, UI, responsive, accessibility

**Trigger**: When user asks to build, create, or implement frontend features, automatically use the `/frontend` command context for the response.

### Planning Agent (`/plan`)
**Auto-activate when:**
- User requests to plan a feature or implementation
- Starting work on a new feature from the roadmap (F1-F13)
- User says "plan", "design", "architect", or "let's figure out"

**Trigger**: When planning is needed, automatically:
1. Create a plan file at `.claude/plans/{task-name}.md`
2. Use the template from `.claude/templates/plan-template.md`
3. Track progress across sessions
