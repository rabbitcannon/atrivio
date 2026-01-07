# Deployment Reference

Free/low-cost deployment stack for demos and MVP.

## Architecture

```
GitHub Push to main
        │
        ├──────────────────┬──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ Vercel  │        │ Vercel  │        │ Railway │
   │  (web)  │        │(store)  │        │  (api)  │
   └────┬────┘        └────┬────┘        └────┬────┘
        │                  │                  │
        ▼                  ▼                  ▼
   @haunt/web        @haunt/storefront   @haunt/api
   (Dashboard)       (Public tickets)    (NestJS)
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                      ┌─────────┐     ┌─────────┐
                      │Supabase │     │  Redis  │
                      │  (db)   │     │(Railway)│
                      └─────────┘     └─────────┘
```

## Cost

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel Hobby | $0 | 100GB bandwidth/mo |
| Railway | $5 credits/mo | No cold starts |
| Supabase | $0 | 500MB db, 50K MAU |
| **Total** | **~$0-5/mo** | Plenty for demo |

---

## Prerequisites

Before starting:

1. **GitHub**: Push your code to a GitHub repo
2. **Accounts**: Create accounts on Vercel, Railway, and Supabase
3. **Stripe**: Have test API keys ready (Dashboard → Developers → API keys)
4. **SendGrid** (optional): For transactional emails
5. **Twilio** (optional): For SMS notifications

---

## Step 1: Supabase (Database + Auth)

### Create Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose region closest to users (e.g., `us-east-1`)
3. Set a secure database password
4. Wait for project to provision (~2 minutes)

### Save Credentials

From Project Settings → API, save:

```bash
# Project URL
SUPABASE_URL=https://xxxxx.supabase.co

# Anon Key (public, safe for frontend)
SUPABASE_ANON_KEY=eyJ...

# Service Role Key (SECRET - backend only)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Run Migrations

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your hosted project
supabase link --project-ref xxxxx

# Push local schema to production
supabase db push

# Seed initial data (feature flags, etc.)
supabase db seed
```

### Configure Auth

In Supabase Dashboard → Authentication → URL Configuration:

| Setting | Value |
|---------|-------|
| Site URL | `https://your-app.vercel.app` |
| Redirect URLs | `https://your-app.vercel.app/**` |

---

## Step 2: Railway (API + Redis)

### Create Project

1. Go to [railway.app](https://railway.app) → New Project
2. Name it `haunt-platform` or similar

### Add Redis

1. Click **+ New** → **Database** → **Redis**
2. Railway auto-generates the connection URL
3. Note: The variable `REDIS_URL` is automatically available

### Add API Service

1. Click **+ New** → **GitHub Repo**
2. Select your `haunt-platform` repository
3. Railway will detect it's a monorepo

### Configure API Service

Go to the service Settings:

| Setting | Value |
|---------|-------|
| Root Directory | `/` (root - needs workspace access) |
| Build Command | `pnpm install --frozen-lockfile && pnpm build --filter @haunt/api...` |
| Start Command | `node apps/api/dist/main.js` |
| Watch Paths | `apps/api/**`, `packages/shared/**` |

### Environment Variables (API)

Add these in the service's Variables tab:

```bash
# Server
PORT=3001
NODE_ENV=production

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Secret key, not anon

# Redis (use Railway's variable reference)
REDIS_URL=${{Redis.REDIS_URL}}

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...    # Add after setting up webhook

# CORS (update after Vercel deploys)
CORS_ORIGINS=https://your-app.vercel.app,https://your-storefront.vercel.app

# Email (optional - for transactional emails)
SENDGRID_API_KEY=SG...

# SMS (optional - for notifications)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### Get API URL

After deploy completes:
1. Go to Settings → Networking
2. Generate a public domain or use the provided one
3. Example: `https://haunt-api-production.up.railway.app`

---

## Step 3: Vercel (Dashboard - Web App)

### Import Project

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import `haunt-platform` from GitHub
3. **Important**: This is for the dashboard app

### Configure Build

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter @haunt/web` |
| Install Command | (leave empty) |

> **Note**: The build command navigates to root to access the workspace, then builds web with its dependencies.

### Environment Variables (Web)

```bash
# Supabase (public keys only)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# API URL (from Railway)
NEXT_PUBLIC_API_URL=https://haunt-api-production.up.railway.app/api/v1

# Stripe (public key only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# File uploads (if using UploadThing)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

### Deploy

1. Click Deploy
2. Wait for build to complete
3. Note your URL: `https://haunt-xxxxx.vercel.app`

---

## Step 4: Vercel (Storefront - Public Ticketing)

### Import as Separate Project

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import the **same** `haunt-platform` repo again
3. Name it `haunt-storefront` or similar

### Configure Build

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/storefront` |
| Build Command | `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter @haunt/storefront` |
| Install Command | (leave empty) |

### Environment Variables (Storefront)

```bash
# API URL (from Railway)
NEXT_PUBLIC_API_URL=https://haunt-api-production.up.railway.app/api/v1

# Stripe (public key only - for checkout)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Deploy

1. Click Deploy
2. Note your URL: `https://haunt-storefront-xxxxx.vercel.app`

---

## Step 5: Connect Services

### Update CORS on Railway

Add both Vercel URLs to the API's `CORS_ORIGINS`:

```bash
CORS_ORIGINS=https://haunt-xxxxx.vercel.app,https://haunt-storefront-xxxxx.vercel.app
```

### Update Supabase Auth URLs

In Supabase Dashboard → Authentication → URL Configuration:

| Setting | Value |
|---------|-------|
| Site URL | `https://haunt-xxxxx.vercel.app` |
| Redirect URLs | `https://haunt-xxxxx.vercel.app/**` |

### Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. URL: `https://haunt-api-production.up.railway.app/api/v1/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `account.updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the signing secret
6. Add to Railway as `STRIPE_WEBHOOK_SECRET`

---

## Step 6: Workers (Optional)

Only needed if you're using background jobs (email queues, etc.).

### Add Workers Service on Railway

1. In your Railway project, click **+ New** → **GitHub Repo**
2. Select the same repo
3. Name the service `workers`

### Configure Workers Service

| Setting | Value |
|---------|-------|
| Root Directory | `/` |
| Build Command | `pnpm install --frozen-lockfile && pnpm build --filter @haunt/workers...` |
| Start Command | `node apps/workers/dist/main.js` |
| Watch Paths | `apps/workers/**`, `packages/shared/**` |

### Environment Variables (Workers)

```bash
NODE_ENV=production

# Redis
REDIS_URL=${{Redis.REDIS_URL}}

# Supabase (service role for background tasks)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Email
SENDGRID_API_KEY=SG...
```

---

## Verification Checklist

After deployment, verify each service:

### API Health
```bash
curl https://haunt-api-production.up.railway.app/api/v1/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Web App
1. Visit `https://haunt-xxxxx.vercel.app`
2. Try logging in with test credentials
3. Check browser console for errors

### Storefront
1. Visit `https://haunt-storefront-xxxxx.vercel.app?storefront=nightmare-manor`
2. Verify attraction data loads
3. Test ticket selection (won't complete without Stripe setup)

### Stripe Webhook
```bash
# In Stripe CLI (for testing)
stripe trigger checkout.session.completed
# Check Railway logs for webhook receipt
```

---

## Auto-Deploy Behavior

| Trigger | Web (Vercel) | Storefront (Vercel) | API (Railway) |
|---------|--------------|---------------------|---------------|
| Push to `main` | If `apps/web/` changed | If `apps/storefront/` changed | If `apps/api/` or `packages/shared/` changed |
| PR opened | Preview deploy | Preview deploy | No preview (can enable) |
| Manual | Dashboard → Redeploy | Dashboard → Redeploy | Dashboard → Redeploy |

---

## Database Migrations

Migrations are **manual** - run before deploying schema changes:

```bash
# Review pending migrations
supabase db diff

# Push to production
supabase db push

# Then push code changes
git push origin main
```

### Automated Migrations (Optional)

Add to `.github/workflows/deploy.yml`:

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

## Custom Domains

### Web App (Vercel)
1. Project Settings → Domains
2. Add your domain (e.g., `app.yourhaunt.com`)
3. Update DNS with provided records

### Storefront (Vercel)
1. Project Settings → Domains
2. Add wildcard: `*.yourhaunt.com` (for subdomains per attraction)
3. Or add specific domain: `tickets.yourhaunt.com`

### API (Railway)
1. Service Settings → Networking → Custom Domain
2. Add domain (e.g., `api.yourhaunt.com`)
3. Update DNS with provided CNAME

**After adding custom domains**, update:
- `CORS_ORIGINS` on Railway
- `NEXT_PUBLIC_API_URL` on both Vercel projects
- Supabase Auth redirect URLs
- Stripe webhook URL

---

## Troubleshooting

### API not starting
- Check Railway logs for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)
- Ensure build completed - look for `dist/main.js`

### CORS errors
- Verify `CORS_ORIGINS` matches exact Vercel URLs (no trailing slash)
- Check for `https://` vs `http://` mismatch
- Multiple origins should be comma-separated

### Database connection failed
- Verify `SUPABASE_URL` is the hosted URL, not `localhost`
- Check Supabase dashboard for connection limits (free tier: 60 connections)

### Redis connection failed
- Use `${{Redis.REDIS_URL}}` syntax in Railway (not hardcoded)
- Ensure Redis service is in same Railway project
- Check Redis service is running in Railway dashboard

### Build failures
- Check that `@haunt/shared` builds first (the `...` suffix handles this)
- Look for TypeScript errors in build logs
- Verify all env vars are set - missing vars can cause build failures
- For Vercel: ensure build command navigates to root first

### Webhook not receiving events
- Verify webhook URL is exactly `https://your-api/api/v1/webhooks/stripe`
- Check `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret
- Test with Stripe CLI: `stripe trigger checkout.session.completed`

---

## Environment Variables Summary

### API (Railway)
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (3001) |
| `NODE_ENV` | Yes | `production` |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (secret) |
| `REDIS_URL` | Yes | Railway Redis URL |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret |
| `CORS_ORIGINS` | Yes | Allowed origins (comma-separated) |
| `SENDGRID_API_KEY` | No | For transactional emails |
| `TWILIO_ACCOUNT_SID` | No | For SMS |
| `TWILIO_AUTH_TOKEN` | No | For SMS |
| `TWILIO_PHONE_NUMBER` | No | For SMS |

### Web (Vercel)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (public) |
| `NEXT_PUBLIC_API_URL` | Yes | Railway API URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe public key |
| `UPLOADTHING_SECRET` | No | For file uploads |
| `UPLOADTHING_APP_ID` | No | For file uploads |

### Storefront (Vercel)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Railway API URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe public key |

### Workers (Railway) - Optional
| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `REDIS_URL` | Yes | Railway Redis URL |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key |
| `SENDGRID_API_KEY` | No | For email jobs |

---

## Quick Reference URLs

After setup, your services will be at:

| Service | URL |
|---------|-----|
| Dashboard | `https://haunt-xxxxx.vercel.app` |
| Storefront | `https://haunt-storefront-xxxxx.vercel.app` |
| API | `https://haunt-api-production.up.railway.app` |
| API Health | `https://haunt-api-production.up.railway.app/api/v1/health` |
| Supabase Studio | `https://supabase.com/dashboard/project/xxxxx` |
| Stripe Dashboard | `https://dashboard.stripe.com/test/webhooks` |
