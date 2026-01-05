# Infrastructure

Local development and deployment configuration.

## Database Migrations

**IMPORTANT**: All migrations must go in `supabase/migrations/` at the project root.

```
haunt-platform/
└── supabase/
    ├── migrations/        ← ALL MIGRATIONS GO HERE
    │   └── 20260104000000_f12_notifications.sql
    ├── seed.sql
    └── config.toml
```

Migration naming: `YYYYMMDDHHMMSS_description.sql`

```bash
# Apply migrations
supabase db reset

# Check migration status
supabase migration list --local
```

## Docker

```bash
# Start Redis for development
docker compose -f docker/docker-compose.yml up -d

# Start Redis for testing
docker compose -f docker/docker-compose.test.yml up -d
```

## Supabase Local

```bash
# Start local Supabase
supabase start

# Stop
supabase stop

# Reset database
supabase db reset
```

Configuration in `supabase/config.toml`.

## Ports

| Service | Port |
|---------|------|
| API | 3001 |
| Web | 3000 |
| Supabase API | 54321 |
| Supabase DB | 54322 |
| Supabase Studio | 54323 |
| Redis | 6379 |
| Redis (test) | 6380 |

## Setup Script

```bash
./scripts/setup.sh
```

Installs dependencies, sets up env files, starts Docker and Supabase.
