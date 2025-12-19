# Haunt Platform

Multi-tenant SaaS platform for the haunt industry (haunted attractions, escape rooms, mazes).

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (or use corepack: `corepack enable`)
- **Docker** (for Redis)
- **Supabase CLI** (optional, for local database)

```bash
# Install Supabase CLI (macOS)
brew install supabase/tap/supabase
```

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Start Redis
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 4. Start all apps
pnpm dev
```

**URLs:**
- Web: http://localhost:3000
- API: http://localhost:3001
- API Docs (Swagger): http://localhost:3001/api/docs

## Full Stack Setup (with Supabase)

For full database and auth functionality:

```bash
# 1. Start local Supabase
supabase start

# 2. Copy the credentials printed to .env.local:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY

# 3. Start Redis
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 4. Start all apps
pnpm dev
```

**Supabase URLs:**
- Studio (DB GUI): http://localhost:54323
- API: http://localhost:54321
- Database: localhost:54322

## Running Individual Apps

```bash
# Web frontend only
pnpm --filter @haunt/web dev

# API backend only
pnpm --filter @haunt/api dev

# Workers only
pnpm --filter @haunt/workers dev
```

## Project Structure

```
haunt-platform/
├── apps/
│   ├── api/          # NestJS backend (Fastify)
│   ├── web/          # Next.js 14 frontend
│   └── workers/      # BullMQ background jobs
├── packages/
│   ├── shared/       # Shared types & utilities
│   └── database/     # Migrations & seeds
├── infrastructure/
│   ├── docker/       # Docker compose files
│   ├── supabase/     # Supabase config
│   └── scripts/      # Setup scripts
└── docs/             # Documentation
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS v4, shadcn/ui |
| Backend | NestJS 10+ with Fastify adapter |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (PKCE flow) |
| Payments | Stripe Connect (Express accounts) |
| Queue | BullMQ + Redis |
| Monorepo | pnpm workspaces + Turborepo |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in development mode |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run tests |
| `pnpm format` | Format code with Biome |
| `pnpm format:check` | Check formatting |
| `pnpm clean` | Clean all build artifacts |

## Database Commands

```bash
# Generate TypeScript types from database
pnpm db:types

# Run migrations
pnpm db:migrate

# Seed development data
pnpm db:seed
```

## Stopping Services

```bash
# Stop Redis
docker compose -f infrastructure/docker/docker-compose.yml down

# Stop Supabase
supabase stop
```

## Troubleshooting

### pnpm not found
```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

### Port already in use
```bash
# Find process on port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Reset everything
```bash
# Clean all node_modules and build artifacts
pnpm clean

# Reset Supabase database
supabase db reset

# Reinstall
pnpm install
```

## Documentation

- [Architecture](docs/architecture/README.md)
- [Feature Roadmap](.claude/plans/feature-roadmap.md)
- [ERD Template](.claude/plans/erd-template.md)
- [API Design Template](.claude/plans/api-design-template.md)
