# Scaffolding Phase Checklist

## Overview

This checklist tracks the scaffolding phase. No business logic is implemented - only project structure.

---

## Root Configuration

- [x] `package.json` - Workspace root with scripts
- [x] `pnpm-workspace.yaml` - Workspace package definitions
- [x] `turbo.json` - Turborepo task pipeline
- [x] `biome.json` - Linting/formatting configuration
- [x] `tsconfig.base.json` - Base TypeScript configuration
- [ ] `.env.example` - Environment template
- [ ] `.gitignore` - Git ignore patterns
- [ ] `README.md` - Project documentation

---

## Apps

### API (NestJS + Fastify)

- [ ] `apps/api/package.json`
- [ ] `apps/api/tsconfig.json`
- [ ] `apps/api/nest-cli.json`
- [ ] `apps/api/src/main.ts` - Fastify bootstrap
- [ ] `apps/api/src/app.module.ts` - Root module

#### Core Modules (Empty)
- [ ] `apps/api/src/core/auth/.gitkeep`
- [ ] `apps/api/src/core/admin/.gitkeep`
- [ ] `apps/api/src/core/tenancy/.gitkeep`
- [ ] `apps/api/src/core/rbac/.gitkeep`
- [ ] `apps/api/src/core/audit/.gitkeep`

#### Business Modules (Empty)
- [ ] `apps/api/src/modules/organizations/.gitkeep`
- [ ] `apps/api/src/modules/haunts/.gitkeep`
- [ ] `apps/api/src/modules/staff/.gitkeep`
- [ ] `apps/api/src/modules/scheduling/.gitkeep`
- [ ] `apps/api/src/modules/ticketing/.gitkeep`
- [ ] `apps/api/src/modules/check-in/.gitkeep`
- [ ] `apps/api/src/modules/payments/.gitkeep`
- [ ] `apps/api/src/modules/inventory/.gitkeep`
- [ ] `apps/api/src/modules/operations/.gitkeep`
- [ ] `apps/api/src/modules/marketing/.gitkeep`
- [ ] `apps/api/src/modules/analytics/.gitkeep`
- [ ] `apps/api/src/modules/notifications/.gitkeep`

#### Shared (Empty)
- [ ] `apps/api/src/shared/database/.gitkeep`
- [ ] `apps/api/src/shared/events/.gitkeep`
- [ ] `apps/api/src/shared/queues/.gitkeep`
- [ ] `apps/api/src/shared/storage/.gitkeep`
- [ ] `apps/api/src/shared/websockets/.gitkeep`

#### Config
- [ ] `apps/api/src/config/.gitkeep`

#### Tests
- [ ] `apps/api/test/e2e/.gitkeep`
- [ ] `apps/api/test/unit/.gitkeep`

### Web (Next.js 14)

- [ ] `apps/web/package.json`
- [ ] `apps/web/tsconfig.json`
- [ ] `apps/web/next.config.js`
- [ ] `apps/web/tailwind.config.js`
- [ ] `apps/web/postcss.config.js`
- [ ] `apps/web/src/app/layout.tsx`
- [ ] `apps/web/src/app/page.tsx`
- [ ] `apps/web/src/app/(auth)/.gitkeep`
- [ ] `apps/web/src/app/(dashboard)/.gitkeep`
- [ ] `apps/web/src/app/(admin)/.gitkeep`
- [ ] `apps/web/src/components/ui/.gitkeep`
- [ ] `apps/web/src/lib/supabase/.gitkeep`
- [ ] `apps/web/src/styles/globals.css`
- [ ] `apps/web/public/.gitkeep`

### Workers (BullMQ)

- [ ] `apps/workers/package.json`
- [ ] `apps/workers/tsconfig.json`
- [ ] `apps/workers/src/main.ts`
- [ ] `apps/workers/src/processors/.gitkeep`
- [ ] `apps/workers/src/config/.gitkeep`

---

## Packages

### Shared Types

- [ ] `packages/shared/package.json`
- [ ] `packages/shared/tsconfig.json`
- [ ] `packages/shared/src/types/index.ts`
- [ ] `packages/shared/src/types/ids.ts` - Branded types
- [ ] `packages/shared/src/constants/index.ts`

### Database

- [ ] `packages/database/package.json`
- [ ] `packages/database/migrations/.gitkeep`
- [ ] `packages/database/seeds/.gitkeep`
- [ ] `packages/database/types/.gitkeep`

---

## Infrastructure

### Docker

- [ ] `infrastructure/docker/docker-compose.yml`
- [ ] `infrastructure/docker/docker-compose.test.yml`

### Supabase

- [ ] `infrastructure/supabase/config.toml`

### Scripts

- [ ] `infrastructure/scripts/setup.sh`

---

## Documentation

- [ ] `docs/architecture/README.md`
- [ ] `docs/features/.gitkeep`

---

## CI/CD

- [ ] `.github/workflows/ci.yml`
- [ ] `.github/workflows/deploy.yml`

---

## Verification

After scaffolding is complete, run:

```bash
# Install dependencies
pnpm install

# Verify TypeScript compilation
pnpm typecheck

# Verify linting
pnpm lint

# Verify build
pnpm build
```
