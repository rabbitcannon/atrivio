# Deployment Reference

Free/low-cost deployment stack for demos and MVP.

**Domain**: `atrivio.io`

## URL Structure

| Purpose | URL |
|---------|-----|
| Marketing/Landing | `https://atrivio.io` |
| Dashboard (after login) | `https://dashboard.atrivio.io` |
| Client Storefronts | `https://{client-slug}.atrivio.io` |
| API | `https://api.atrivio.io` |

**Examples:**
- `https://nightmare-manor.atrivio.io` - Nightmare Manor's public ticketing
- `https://haunted-mansion.atrivio.io` - Haunted Mansion's public ticketing

## Architecture

```
GitHub Push to main
        │
        ├──────────────────────────┬──────────────────┐
        ▼                          ▼                  ▼
   ┌──────────┐              ┌───────────┐       ┌─────────┐
   │  Vercel  │              │  Vercel   │       │ Railway │
   │  (web)   │              │(storefront)│       │  (api)  │
   └────┬─────┘              └─────┬─────┘       └────┬────┘
        │                          │                  │
        ▼                          ▼                  ▼
   atrivio.io               *.atrivio.io         api.atrivio.io
   dashboard.atrivio.io     (client subdomains)
        │                          │                  │
        └──────────────────────────┼──────────────────┘
                                   ▼
                              ┌─────────┐     ┌─────────┐
                              │Supabase │     │  Redis  │
                              │  (db)   │     │(Railway)│
                              └─────────┘     └─────────┘
```

## Cost

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Vercel | Pro | $20/mo | Required for wildcard subdomains |
| Railway | Hobby | ~$5/mo | API + Redis |
| Supabase | Free | $0 | 500MB db, 50K MAU |
| **Total** | | **~$25/mo** | Production-ready |

> **Demo on free tier?** Use `dashboard.atrivio.io?storefront=client-slug` instead of wildcard subdomains. Upgrade to Vercel Pro when ready for real clients.

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
| Site URL | `https://dashboard.atrivio.io` |
| Redirect URLs | `https://dashboard.atrivio.io/**`, `https://atrivio.io/**` |

---

## Step 2: Railway (API + Redis)

### Create Project

1. Go to [railway.app](https://railway.app) → New Project
2. Name it `atrivio` or similar

### Add Redis

1. Click **+ New** → **Database** → **Redis**
2. Railway auto-generates the connection URL
3. Note: The variable `REDIS_URL` is automatically available

### Add API Service

1. Click **+ New** → **GitHub Repo**
2. Select your `atrivio` repository
3. Railway will detect it's a monorepo

### Configure API Service

Go to the service Settings:

| Setting | Value |
|---------|-------|
| Root Directory | `/` (root - needs workspace access) |
| Build Command | `pnpm install --frozen-lockfile && pnpm build --filter @atrivio/api...` |
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

# CORS
CORS_ORIGINS=https://atrivio.io,https://dashboard.atrivio.io,https://*.atrivio.io

# Email (optional - for transactional emails)
SENDGRID_API_KEY=SG...

# SMS (optional - for notifications)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### Get API URL

After deploy completes:
1. Go to Settings → Networking → Custom Domain
2. Add `api.atrivio.io`
3. Railway will provide a CNAME target (e.g., `xyz.up.railway.app`)
4. Add DNS record: `CNAME api → xyz.up.railway.app`

---

## Step 3: Vercel (Dashboard - Web App)

### Import Project

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import `atrivio` from GitHub
3. **Important**: This is for the dashboard app

### Configure Build

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter @atrivio/web` |
| Install Command | (leave empty) |

> **Note**: The build command navigates to root to access the workspace, then builds web with its dependencies.

### Environment Variables (Web)

```bash
# Supabase (public keys only)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# API URL
NEXT_PUBLIC_API_URL=https://api.atrivio.io/api/v1

# Stripe (public key only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# File uploads (if using UploadThing)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

### Add Custom Domains

After initial deploy:
1. Go to Project Settings → Domains
2. Add `atrivio.io` (apex domain for landing/marketing)
3. Add `dashboard.atrivio.io` (for authenticated dashboard)

### DNS Records (Web)

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `dashboard` | `cname.vercel-dns.com` |

---

## Step 4: Vercel (Storefront - Client Subdomains)

### Import as Separate Project

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import the **same** `atrivio` repo again
3. Name it `atrivio-storefront`

### Configure Build

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/storefront` |
| Build Command | `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter @atrivio/storefront` |
| Install Command | (leave empty) |

### Environment Variables (Storefront)

```bash
# API URL
NEXT_PUBLIC_API_URL=https://api.atrivio.io/api/v1

# Stripe (public key only - for checkout)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Add Wildcard Domain (Requires Vercel Pro)

After initial deploy:
1. Go to Project Settings → Domains
2. Add `*.atrivio.io` (wildcard for all client subdomains)

### DNS Record (Storefront)

| Type | Name | Value |
|------|------|-------|
| CNAME | `*` | `cname.vercel-dns.com` |

> **How it works**: When someone visits `nightmare-manor.atrivio.io`, the storefront middleware extracts `nightmare-manor` as the identifier and fetches that attraction's data from the API.

### Reserved Subdomains

These subdomains are used by other services and should NOT resolve to storefront:
- `dashboard` → Web app
- `api` → Railway API
- `www` → Redirect to apex

The wildcard CNAME is lower priority than explicit records, so these will route correctly.

---

## Step 5: Connect Services

### Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. URL: `https://api.atrivio.io/api/v1/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `account.updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the signing secret
6. Add to Railway as `STRIPE_WEBHOOK_SECRET`

### DNS Summary

Add these records at your domain registrar:

**Production:**
| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A | `@` | `76.76.21.21` | atrivio.io (landing) |
| CNAME | `www` | `cname.vercel-dns.com` | www redirect |
| CNAME | `dashboard` | `cname.vercel-dns.com` | Dashboard app |
| CNAME | `api` | `xyz.up.railway.app` | API (Railway provides) |
| CNAME | `*` | `cname.vercel-dns.com` | Client storefronts (wildcard) |

**Development (add later):**
| Type | Name | Value | Purpose |
|------|------|-------|---------|
| CNAME | `dev` | `cname.vercel-dns.com` | Dev dashboard |
| CNAME | `dev-api` | `xyz.up.railway.app` | Dev API (Railway provides) |
| CNAME | `*.dev` | `cname.vercel-dns.com` | Dev storefronts |

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
| Build Command | `pnpm install --frozen-lockfile && pnpm build --filter @atrivio/workers...` |
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
curl https://api.atrivio.io/api/v1/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Web App
1. Visit `https://atrivio.io` - should show landing/marketing page
2. Visit `https://dashboard.atrivio.io` - should redirect to login
3. Log in with test credentials
4. Check browser console for errors

### Storefront
1. Visit `https://nightmare-manor.atrivio.io`
2. Verify attraction data loads (name, logo, ticket types)
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

## Development Environment

Dev environment for development AND client demos. Production stays clean for real clients only.

### URL Structure

| Environment | Dashboard | API | Storefronts | Purpose |
|-------------|-----------|-----|-------------|---------|
| **Production** | `dashboard.atrivio.io` | `api.atrivio.io` | `*.atrivio.io` | Real paying clients |
| **Development** | `dev.atrivio.io` | `dev-api.atrivio.io` | `*.dev.atrivio.io` | Development + client demos |

### Why This Split

- **Production**: Clean, only real client data, never reset
- **Development**: Enhanced seed data for demos, can reset anytime, safe to experiment

### Branch Strategy

```
develop branch  →  Development environment (dev.atrivio.io)
main branch     →  Production environment (atrivio.io)
```

### Supabase (Dev Database)

Create a second Supabase project for development:

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `atrivio-dev`
3. Run migrations: `supabase link --project-ref xxxxx && supabase db push`
4. Save separate credentials for dev

### Railway (Dev API)

**Option A: Environments (Same Project)**

1. In Railway project → **Environments** (top right)
2. Click **+ New Environment** → Name it `development`
3. Railway clones all services into the new environment
4. Configure the dev environment:
   - Go to API service in `development` environment
   - Settings → Change deploy branch to `develop`
   - Update environment variables (dev Supabase, dev domains)

**Option B: Separate Project (More Isolated)**

1. Create new Railway project: `atrivio-dev`
2. Add Redis + API service (same config as production)
3. Point to `develop` branch

### Railway Dev Environment Variables

```bash
PORT=3001
NODE_ENV=development

# Dev Supabase
SUPABASE_URL=https://xxxxx-dev.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis (same project, shared is fine for dev)
REDIS_URL=${{Redis.REDIS_URL}}

# Stripe TEST mode (same keys work, it's already test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # Create separate webhook for dev

# Dev CORS
CORS_ORIGINS=https://dev.atrivio.io,https://*.dev.atrivio.io
```

### Vercel (Dev Dashboard & Storefront)

Vercel automatically creates preview deploys, but for a persistent dev environment:

**Option A: Environment Variables by Branch**

In each Vercel project → Settings → Environment Variables:

| Variable | Environment | Value |
|----------|-------------|-------|
| `NEXT_PUBLIC_API_URL` | Production | `https://api.atrivio.io/api/v1` |
| `NEXT_PUBLIC_API_URL` | Preview | `https://dev-api.atrivio.io/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_URL` | Preview | `https://xxxxx-dev.supabase.co` |

**Option B: Separate Domain for Dev**

1. In Vercel project → Settings → Domains
2. Add `dev.atrivio.io`
3. In Settings → Git → Production Branch, keep `main`
4. Add custom domain for `develop` branch

### DNS Records (Dev)

Add these to your DNS:

| Type | Name | Value |
|------|------|-------|
| CNAME | `dev` | `cname.vercel-dns.com` |
| CNAME | `dev-api` | *(Railway dev environment provides)* |
| CNAME | `*.dev` | `cname.vercel-dns.com` |

### Stripe Webhook (Dev)

Create a separate webhook endpoint for dev:

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://dev-api.atrivio.io/api/v1/webhooks/stripe`
3. Select same events as production
4. Copy signing secret → Add to Railway dev environment as `STRIPE_WEBHOOK_SECRET`

### Supabase Auth (Dev)

In the dev Supabase project → Authentication → URL Configuration:

| Setting | Value |
|---------|-------|
| Site URL | `https://dev.atrivio.io` |
| Redirect URLs | `https://dev.atrivio.io/**` |

### Workflow

```bash
# Work on feature
git checkout -b feature/new-thing

# Push to GitHub - Vercel creates preview deploy
git push origin feature/new-thing

# Merge to develop - deploys to dev environment
git checkout develop
git merge feature/new-thing
git push origin develop

# Test on dev.atrivio.io

# Merge to main - deploys to production
git checkout main
git merge develop
git push origin main
```

### Dev Environment Checklist

After setup, verify:

- [ ] `https://dev-api.atrivio.io/api/v1/health` returns OK
- [ ] `https://dev.atrivio.io` loads dashboard
- [ ] Login works (dev Supabase auth)
- [ ] `https://nightmare-manor.dev.atrivio.io` loads storefront
- [ ] Stripe webhook receives test events

---

## Demo Quick Start

The dev environment comes with comprehensive demo data. Use this for client demos.

### Demo Login Accounts

**Password for ALL accounts: `password123`**

| Role | Email | Organization | Best For Demoing |
|------|-------|--------------|------------------|
| **Owner** | `owner@haunt.dev` | Nightmare Manor (Pro) | Full feature tour |
| **Manager** | `manager@haunt.dev` | Nightmare Manor | Scheduling, staff management |
| **Actor** | `actor1@haunt.dev` | Nightmare Manor | Staff experience, time clock |
| **Box Office** | `boxoffice@haunt.dev` | Nightmare Manor | Ticket sales, check-in |
| **HR** | `hr@haunt.dev` | Nightmare Manor | Staff onboarding |
| **Platform Admin** | `admin@haunt.dev` | Platform-wide | Super admin features |

### Demo Organizations

| Organization | Tier | Features Enabled | Slug |
|--------------|------|------------------|------|
| **Nightmare Manor** | Pro | All core + scheduling, inventory | `nightmare-manor` |
| **Spooky Hollow** | Basic | Core features only | `spooky-hollow` |
| **Terror Collective** | Enterprise | Everything including virtual queue | `terror-collective` |
| **Newhouse Haunts** | Onboarding | Incomplete setup (demo onboarding flow) | `newhouse-haunts` |

### Demo Storefront URLs

```
https://nightmare-manor.dev.atrivio.io
https://spooky-hollow.dev.atrivio.io
https://terror-collective.dev.atrivio.io
```

### Pre-Loaded Demo Data

The seed includes:
- **26 users** across all organizations with realistic names
- **Multiple attractions** per org with zones and seasons
- **Staff profiles** with skills, certifications, photos
- **Shift templates** and scheduled shifts
- **Ticket types** (General, VIP, Fast Pass, Group rates)
- **Promo codes** (SAVE10, VIP50, GROUPRATE)
- **Sample orders** with tickets
- **Check-in stations** configured
- **Inventory items** (props, costumes, equipment)

### Demo Script Suggestions

**"Full Platform Tour" (15 min)**
1. Log in as `owner@haunt.dev`
2. Show dashboard overview
3. Walk through Attractions → Staff → Schedule
4. Show ticketing and promo codes
5. Demo check-in flow (scan ticket)
6. Show storefront: `nightmare-manor.dev.atrivio.io`

**"Staff Experience" (5 min)**
1. Log in as `actor1@haunt.dev`
2. Show time clock (clock in/out)
3. Show their schedule and shifts
4. Show availability management

**"Box Office Demo" (5 min)**
1. Log in as `boxoffice@haunt.dev`
2. Sell a walk-up ticket
3. Scan a ticket at check-in station
4. Show capacity management

### Reset Demo Data

To reset the dev environment to clean state:

```bash
# Re-run seed on dev Supabase
supabase db reset --linked
```

This will:
1. Drop all tables
2. Run all migrations
3. Re-run seed.sql with fresh demo data

---

## Custom Client Domains

Clients can use their own domains (e.g., `hauntedmansion.com`) instead of subdomains.

### How It Works

1. Client buys their domain
2. Client adds CNAME record: `@ → cname.vercel-dns.com`
3. You add their domain in Vercel (storefront project) → Domains
4. Add their domain to `storefront_domains` table in database

### Database Entry
```sql
INSERT INTO storefront_domains (attraction_id, domain, verified)
VALUES ('uuid-of-attraction', 'hauntedmansion.com', true);
```

The storefront middleware checks `storefront_domains` first, then falls back to slug matching.

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
- Check that `@atrivio/shared` builds first (the `...` suffix handles this)
- Look for TypeScript errors in build logs
- Verify all env vars are set - missing vars can cause build failures
- For Vercel: ensure build command navigates to root first

### Webhook not receiving events
- Verify webhook URL is exactly `https://api.atrivio.io/api/v1/webhooks/stripe`
- Check `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret
- Test with Stripe CLI: `stripe trigger checkout.session.completed`

### Subdomain not resolving
- Verify wildcard CNAME `*` points to `cname.vercel-dns.com`
- Check the domain is added in Vercel storefront project
- DNS propagation can take up to 48 hours (usually 5-30 min)
- Test with: `dig nightmare-manor.atrivio.io`

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

| Service | URL |
|---------|-----|
| Landing/Marketing | `https://atrivio.io` |
| Dashboard | `https://dashboard.atrivio.io` |
| API | `https://api.atrivio.io` |
| API Health | `https://api.atrivio.io/api/v1/health` |
| Client Storefront | `https://{slug}.atrivio.io` |
| Supabase Studio | `https://supabase.com/dashboard/project/xxxxx` |
| Stripe Dashboard | `https://dashboard.stripe.com/test/webhooks` |

**Example Client URLs:**
- `https://nightmare-manor.atrivio.io`
- `https://haunted-mansion.atrivio.io`
- `https://escape-room-nyc.atrivio.io`
