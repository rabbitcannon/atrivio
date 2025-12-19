# Haunt Platform

Multi-tenant SaaS for the haunt industry (haunted attractions, escape rooms, mazes).

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

- **Branded IDs**: `OrgId`, `HauntId`, `UserId` prevent mixing types
- **Permission strings**: Template literals like `ticket:refund`, `schedule:publish`
- **Money**: Always integers (cents) - use `@haunt/shared/utils/money`

## Feature Implementation

Before implementing any feature:
1. Create ERD in `docs/features/FX-name/ERD.md`
2. Design API in `docs/features/FX-name/API.md`
3. Write migrations in `packages/database/migrations/`

See `.claude/plans/feature-roadmap.md` for implementation order.
