# Infrastructure

Local development and deployment configuration.

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
