# Deployment Reference

Free-tier deployment stack for MVP demos.

## Architecture

```
GitHub Push to main
        │
        ├──────────────────┐
        ▼                  ▼
   ┌─────────┐        ┌─────────┐
   │ Vercel  │        │ Railway │
   │  (web)  │        │  (api)  │
   └────┬────┘        └────┬────┘
        │                  │
        ▼                  ▼
   @haunt/web         @haunt/api ←── Redis (Railway)
   (Next.js)          (NestJS)
        │                  │
        └────────┬─────────┘
                 ▼
            ┌─────────┐
            │Supabase │
            │  (db)   │
            └─────────┘
```

## Cost

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel Hobby | $0 | 100GB bandwidth/mo |
| Railway | $5 credits/mo | No cold starts |
| Supabase | $0 | 500MB db, 50K MAU |
| **Total** | **$0** | Plenty for MVP |

---

## Setup Guide

### 1. Supabase (Database)

**Create Project**:
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose region closest to users
3. Save these values:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJ...` (public, safe for frontend)
   - Service Role Key: `eyJ...` (secret, backend only)

**Run Migrations**:
```bash
# Link to hosted project
supabase link --project-ref xxxxx

# Push local schema to production
supabase db push

# Optionally seed data
supabase db seed
```

---

### 2. Railway (API + Redis)

**Create Project**:
1. Go to [railway.app](https://railway.app) → New Project

**Add Redis**:
1. Click "+ New" → "Database" → "Redis"
2. Railway auto-generates `REDIS_URL`

**Add API Service**:
1. Click "+ New" → "GitHub Repo" → Select `haunt-platform`
2. Configure in Settings:

| Setting | Value |
|---------|-------|
| Root Directory | `/` |
| Build Command | `pnpm install && pnpm build --filter @haunt/api...` |
| Start Command | `node apps/api/dist/main.js` |
| Watch Paths | `apps/api/**`, `packages/shared/**` |

**Environment Variables**:
```env
PORT=3001
NODE_ENV=production

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis (use Railway's variable reference)
REDIS_URL=${{Redis.REDIS_URL}}

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS (update after Vercel deploy)
CORS_ORIGINS=https://your-app.vercel.app
```

**Get Public URL**:
- After deploy, find URL in Settings → Networking
- Example: `https://haunt-api-production.up.railway.app`

---

### 3. Vercel (Frontend)

**Import Project**:
1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import `haunt-platform` from GitHub
3. Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | (auto-detected) |
| Install Command | `pnpm install` |

**Environment Variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://haunt-api-production.up.railway.app/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Get Public URL**:
- After deploy, find URL in Project Settings
- Example: `https://haunt.vercel.app`

---

### 4. Connect Services

**Update CORS on Railway**:
```env
CORS_ORIGINS=https://haunt.vercel.app
```

**Configure Stripe Webhook** (if testing payments):
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://haunt-api-production.up.railway.app/api/v1/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `account.updated`
   - `payment_intent.succeeded`
4. Copy signing secret to Railway as `STRIPE_WEBHOOK_SECRET`

---

## Auto-Deploy Behavior

| Trigger | Vercel | Railway |
|---------|--------|---------|
| Push to `main` | Deploys if `apps/web/` changed | Deploys if `apps/api/` or `packages/shared/` changed |
| PR opened | Preview deploy | No preview (can enable) |
| Manual | Dashboard → Redeploy | Dashboard → Redeploy |

Your existing CI (`.github/workflows/ci.yml`) runs lint/typecheck/test on PRs as a quality gate.

---

## Optional Config Files

These are **not required** but version-control your settings.

### `apps/web/vercel.json`
```json
{
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next"
}
```

### `railway.json` (project root)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build --filter @haunt/api..."
  },
  "deploy": {
    "startCommand": "node apps/api/dist/main.js",
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

---

## Database Migrations

Migrations are **not automated** in this setup. Before deploying schema changes:

```bash
# Review pending migrations
supabase db diff

# Push to production
supabase db push

# Then push code changes
git push origin main
```

For automated migrations, add to `.github/workflows/deploy.yml`:
```yaml
migrate:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: supabase/setup-cli@v1
    - run: supabase db push
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

---

## Troubleshooting

### API not starting
- Check Railway logs for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Ensure build completed (check for `dist/main.js`)

### CORS errors
- Verify `CORS_ORIGINS` matches exact Vercel URL (no trailing slash)
- Check for `https://` vs `http://` mismatch

### Database connection failed
- Verify `SUPABASE_URL` is the hosted URL, not `localhost`
- Check Supabase dashboard for connection limits

### Redis connection failed
- Use `${{Redis.REDIS_URL}}` syntax in Railway (not hardcoded URL)
- Ensure Redis service is in same Railway project

### Build failures
- Check that `@haunt/shared` builds successfully
- Look for TypeScript errors in build logs
- Verify all env vars are set (missing vars can cause build failures)

---

## Scaling Beyond Free Tier

When ready to scale:

| Need | Solution | Cost |
|------|----------|------|
| Remove cold starts | Already handled (Railway) | - |
| More bandwidth | Vercel Pro | $20/mo |
| More compute | Railway usage-based | ~$10-50/mo |
| More database | Supabase Pro | $25/mo |
| Background jobs | Add `@haunt/workers` to Railway | +$5/mo |
| Custom domain | Add in Vercel + Railway | Free |

---

## Quick Reference

### URLs After Setup

| Service | URL Pattern |
|---------|-------------|
| Frontend | `https://haunt.vercel.app` |
| API | `https://haunt-api-production.up.railway.app` |
| API Health | `https://haunt-api-production.up.railway.app/api/v1/health` |
| Supabase | `https://xxxxx.supabase.co` |
| Supabase Studio | `https://supabase.com/dashboard/project/xxxxx` |

### Environment Variables Summary

**Frontend (Vercel)**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Backend (Railway)**:
- `PORT`, `NODE_ENV`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `CORS_ORIGINS`
