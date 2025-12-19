# Attraction Platform

Multi-tenant SaaS for the attractions industry (haunted attractions, escape rooms, mazes, theme parks, entertainment venues).

## Architecture

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: NestJS 10+ with Fastify adapter
- **Frontend**: Next.js 14 App Router, Tailwind v4, shadcn/ui
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
- **Money**: Always integers (cents) - use `@haunt/shared/utils/money`

## Feature Implementation

Before implementing any feature:
1. Create ERD in `docs/features/FX-name/ERD.md`
2. Design API in `docs/features/FX-name/API.md`
3. Write migrations in `packages/database/migrations/`

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
