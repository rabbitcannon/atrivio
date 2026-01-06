# Storefront Deployment Guide

This guide covers deploying the public storefront app (`apps/storefront`) with support for subdomains and custom domains.

> **Note**: Storefronts are **per-attraction**, not per-organization. Each attraction can have its own public website with custom branding.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DNS Resolution                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Subdomain:     haunted-mansion.hauntplatform.com               │
│                         │                                        │
│                         ▼                                        │
│              *.hauntplatform.com → Vercel/Railway               │
│                                                                  │
│  Custom Domain: hauntedmansion.com                              │
│                         │                                        │
│                         ▼                                        │
│              CNAME → cname.hauntplatform.com                    │
│                         │                                        │
│                         ▼                                        │
│              Vercel/Railway (auto SSL)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the best experience for Next.js with automatic SSL, edge caching, and easy custom domain management.

#### Initial Setup

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   pnpm add -g vercel

   # Link project
   cd apps/storefront
   vercel link
   ```

2. **Configure Project Settings**
   - Framework Preset: Next.js
   - Build Command: `pnpm turbo build --filter=@haunt/storefront`
   - Output Directory: `apps/storefront/.next`
   - Install Command: `pnpm install`
   - Root Directory: `./` (monorepo root)

3. **Set Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://api.hauntplatform.com/api/v1
   NEXT_PUBLIC_PLATFORM_DOMAIN=hauntplatform.com
   ```

#### Domain Configuration

1. **Add Wildcard Subdomain**

   In Vercel Dashboard → Project Settings → Domains:
   ```
   *.hauntplatform.com
   ```

   Then in your DNS provider (e.g., Cloudflare, Route53):
   ```
   Type: CNAME
   Name: *
   Target: cname.vercel-dns.com
   TTL: Auto
   ```

2. **Add Platform Apex Domain**
   ```
   hauntplatform.com → 76.76.21.21 (A record)
   www.hauntplatform.com → cname.vercel-dns.com (CNAME)
   ```

#### Custom Domain Support

When customers add custom domains, they need to:

1. **Add CNAME Record** (for subdomains like www):
   ```
   Type: CNAME
   Name: www (or @)
   Target: cname.hauntplatform.com
   TTL: 3600
   ```

2. **Or A Record** (for apex domains):
   ```
   Type: A
   Name: @
   Target: 76.76.21.21
   TTL: 3600
   ```

3. **Add Domain in Vercel**

   Use the Vercel API to programmatically add domains:
   ```typescript
   // In your API when domain is verified
   const response = await fetch(
     `https://api.vercel.com/v10/projects/${PROJECT_ID}/domains`,
     {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${VERCEL_TOKEN}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ name: 'hauntedmansion.com' }),
     }
   );
   ```

   Vercel automatically provisions SSL certificates.

### Option 2: Railway

Railway offers simpler pricing and good monorepo support.

#### Initial Setup

1. **Create Service**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and init
   railway login
   railway init
   ```

2. **Configure railway.json**
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "pnpm turbo build --filter=@haunt/storefront"
     },
     "deploy": {
       "startCommand": "pnpm --filter @haunt/storefront start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NEXT_PUBLIC_API_URL=https://api.hauntplatform.com/api/v1
   railway variables set NEXT_PUBLIC_PLATFORM_DOMAIN=hauntplatform.com
   ```

#### Domain Configuration

1. **Add Custom Domain in Railway Dashboard**
   - Go to Service Settings → Domains
   - Add `*.hauntplatform.com` (wildcard)
   - Add `hauntplatform.com` (apex)

2. **Configure DNS**

   Railway provides a CNAME target for your service:
   ```
   Type: CNAME
   Name: *
   Target: <your-service>.up.railway.app
   TTL: 3600
   ```

3. **Custom Domains**

   Use Railway API to add customer domains:
   ```typescript
   const response = await fetch('https://backboard.railway.app/graphql/v2', {
     method: 'POST',
     headers: {
       Authorization: `Bearer ${RAILWAY_TOKEN}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       query: `
         mutation AddCustomDomain($serviceId: String!, $domain: String!) {
           customDomainCreate(input: { serviceId: $serviceId, domain: $domain }) {
             id
             domain
           }
         }
       `,
       variables: {
         serviceId: SERVICE_ID,
         domain: 'hauntedmansion.com',
       },
     }),
   });
   ```

## SSL Certificate Management

### Vercel
- **Automatic**: Vercel provisions Let's Encrypt certificates automatically
- **Timeline**: Certificates issued within minutes of domain verification
- **Renewal**: Automatic renewal before expiration

### Railway
- **Automatic**: Railway uses Let's Encrypt
- **Timeline**: 1-5 minutes after domain is added
- **Renewal**: Automatic

### Custom Certificate Support

For enterprise customers requiring their own certificates:

```typescript
// Store certificate info in database
interface CustomCertificate {
  domain: string;
  certificate: string; // PEM encoded
  privateKey: string;  // PEM encoded (encrypted at rest)
  expiresAt: Date;
}
```

Both Vercel and Railway support uploading custom certificates via their APIs.

## DNS Verification Flow

When a customer adds a custom domain:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Custom Domain Setup Flow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Customer enters domain in dashboard                         │
│                         │                                        │
│                         ▼                                        │
│  2. System generates verification token                         │
│     Token: haunt-verify=abc123xyz                               │
│                         │                                        │
│                         ▼                                        │
│  3. Customer adds DNS TXT record                                │
│     _haunt-verify.hauntedmansion.com TXT "haunt-verify=abc123"  │
│                         │                                        │
│                         ▼                                        │
│  4. Customer clicks "Verify"                                    │
│                         │                                        │
│                         ▼                                        │
│  5. System queries DNS for TXT record                           │
│     - Uses 8.8.8.8 and 1.1.1.1 resolvers                       │
│     - Retries with exponential backoff                          │
│                         │                                        │
│                         ▼                                        │
│  6. On success:                                                  │
│     - Mark domain as verified                                    │
│     - Add domain to Vercel/Railway via API                      │
│     - SSL certificate auto-provisioned                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### DNS Record Examples

**TXT Record (Ownership Verification)**:
```
Name: _haunt-verify
Type: TXT
Value: haunt-verify=<generated-token>
TTL: 3600
```

**CNAME Record (Traffic Routing)**:
```
Name: @ or www
Type: CNAME
Value: cname.hauntplatform.com
TTL: 3600
```

**A Record (Apex Domain)**:
```
Name: @
Type: A
Value: 76.76.21.21 (Vercel) or Railway IP
TTL: 3600
```

## Environment Configuration

### Production Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API endpoint | `https://api.hauntplatform.com/api/v1` |
| `NEXT_PUBLIC_PLATFORM_DOMAIN` | Platform domain for subdomain detection | `hauntplatform.com` |
| `VERCEL_TOKEN` | Vercel API token (for domain management) | `xxx` |
| `RAILWAY_TOKEN` | Railway API token (alternative) | `xxx` |

### Development

```bash
# Local development with attraction slug
http://localhost:3002?storefront=haunted-mansion

# Or use subdomain with hosts file
# Add to /etc/hosts:
127.0.0.1 haunted-mansion.localhost

# Then access:
http://haunted-mansion.localhost:3002
```

## Monitoring & Troubleshooting

### Health Checks

Both platforms support health check endpoints:

```typescript
// apps/storefront/src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### Common Issues

1. **SSL Certificate Not Provisioning**
   - Ensure DNS is properly configured
   - Check CAA records don't block Let's Encrypt
   - Wait up to 24 hours for DNS propagation

2. **Wildcard Subdomain Not Working**
   - Verify wildcard CNAME is set correctly
   - Some DNS providers require explicit wildcard setup

3. **Custom Domain Shows Wrong Storefront**
   - Check `custom_domains` table has correct `storefront_id`
   - Verify domain is marked as `verified`
   - Clear CDN cache if using Cloudflare

### Logging

```typescript
// Enable verbose logging in production
if (process.env['NODE_ENV'] === 'production') {
  console.log(`[Storefront] Resolving: ${identifier}`);
}
```

## Cost Considerations

### Vercel
- **Pro Plan**: $20/member/month
- Includes: Unlimited custom domains, automatic SSL
- Bandwidth: 1TB included, $40/100GB after

### Railway
- **Team Plan**: $20/seat/month
- Usage-based: ~$5-10/month for typical storefront traffic
- Includes: Custom domains, automatic SSL

## Migration Guide

### From Single App to Separate Storefront

If you started with the storefront in the main app:

1. **Extract Components**
   ```bash
   cp -r apps/web/src/app/\(storefront\)/* apps/storefront/src/app/
   ```

2. **Update Imports**
   - Change `@/` to storefront-specific paths
   - Extract shared components to `@haunt/shared`

3. **Configure Routing**
   - Set up new domain in deployment platform
   - Update DNS to point to new service

4. **Test Thoroughly**
   - Verify all pages render correctly
   - Test custom domain resolution
   - Check SEO metadata
