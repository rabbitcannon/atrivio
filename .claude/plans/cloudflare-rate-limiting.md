# Cloudflare Rate Limiting Implementation Plan

## Overview

This plan outlines the steps to implement production rate limiting using Cloudflare. The current system has:
- **Database**: `rate_limit_rules` table with configurable thresholds
- **API**: Traffic monitoring interceptor that logs would-be violations
- **Dashboard**: Admin panel showing traffic stats and throttle events

This plan enables actual enforcement at the edge via Cloudflare.

## Why Cloudflare (vs AWS CloudFront/WAF)

| Feature | Cloudflare | AWS CloudFront + WAF |
|---------|-----------|---------------------|
| Setup Complexity | Simple dashboard | Complex rule chains |
| Rate Limiting | Built-in, easy | Requires WAF + rules |
| Bot Protection | Excellent (free tier) | AWS Shield (paid) |
| DDoS Protection | Automatic (free) | AWS Shield Standard |
| Cost | Generous free tier | Pay per rule/request |
| API | Simple REST API | AWS SDK required |
| DNS Integration | Native | Separate Route 53 |

**Recommendation**: Use Cloudflare for simplicity and cost-effectiveness.

---

## Phase 1: Cloudflare Setup (Day 1)

### 1.1 Create Cloudflare Account
- Sign up at cloudflare.com
- Add your domain (e.g., `yourdomain.com`)
- Update nameservers at your registrar

### 1.2 Configure DNS
- Add A/CNAME records for your API subdomain
- Enable proxy (orange cloud) for rate limiting to work
- Example:
  ```
  api.yourdomain.com  ->  CNAME  ->  your-vercel-app.vercel.app  (Proxied)
  ```

### 1.3 SSL/TLS Configuration
- Set to "Full (Strict)" mode
- Enable "Always Use HTTPS"
- Configure edge certificates

---

## Phase 2: Basic Rate Limiting (Day 2-3)

### 2.1 Create Rate Limiting Rules

Go to **Security > WAF > Rate limiting rules** and create these rules:

#### Rule 1: Login Protection
```yaml
Name: Login Rate Limit
If: URI Path contains "/api/v1/auth/login"
Rate: 5 requests per 1 minute
Action: Block for 10 minutes
Response: Custom JSON (429)
```

#### Rule 2: Registration Protection
```yaml
Name: Registration Rate Limit
If: URI Path contains "/api/v1/auth/register"
Rate: 3 requests per 1 minute
Action: Block for 30 minutes
Response: Custom JSON (429)
```

#### Rule 3: API General (Authenticated)
```yaml
Name: API General Rate Limit
If: URI Path starts with "/api/v1/"
  AND Header "Authorization" exists
Rate: 1000 requests per 1 minute
Action: Block for 1 minute
Response: Custom JSON (429)
```

#### Rule 4: API General (Anonymous)
```yaml
Name: Public API Rate Limit
If: URI Path starts with "/api/v1/"
  AND Header "Authorization" does not exist
Rate: 100 requests per 1 minute
Action: Block for 5 minutes
Response: Custom JSON (429)
```

#### Rule 5: Ticket Purchase (Critical)
```yaml
Name: Ticket Purchase Rate Limit
If: URI Path contains "/tickets/purchase"
  OR URI Path contains "/orders"
Rate: 60 requests per 1 minute
Action: Block for 2 minutes
Response: Custom JSON (429)
```

### 2.2 Custom Block Response

Create a custom JSON response for rate-limited requests:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please wait before trying again.",
    "retry_after": 60
  }
}
```

---

## Phase 3: Advanced Rules (Day 4-5)

### 3.1 Bot Protection

Enable **Security > Bots** settings:
- Enable Bot Fight Mode (free)
- Configure Super Bot Fight Mode (Pro plan)
- Set challenge for suspected bots

### 3.2 Geographic Rate Limiting (Optional)

If you have region-specific traffic patterns:
```yaml
Name: International Rate Limit
If: Country not in [US, CA, GB, AU]
Rate: 30 requests per 1 minute
Action: Challenge
```

### 3.3 Endpoint-Specific Rules

Add rules matching your `rate_limit_rules` table:

| Endpoint Pattern | Limit | Scope |
|-----------------|-------|-------|
| `/api/v1/*/check-in/scan` | 600/min | Authenticated |
| `/api/v1/*/storefronts/*` | 300/min | Anonymous |
| `/api/v1/*/queue/*` | 60/min | All |

---

## Phase 4: Monitoring & Alerts (Day 6)

### 4.1 Configure Cloudflare Analytics

- Enable **Analytics > Security** dashboard
- Monitor rate limiting events
- Set up email alerts for high block rates

### 4.2 Create Alert Rules

Go to **Notifications** and create:

1. **High Rate Limit Blocks**
   - Trigger: >100 blocks in 5 minutes
   - Action: Email + Slack webhook

2. **DDoS Alert**
   - Trigger: >1000 requests/second from single IP
   - Action: Email + PagerDuty

### 4.3 Integrate with Your Dashboard

Your admin traffic monitor already tracks would-be throttles. Add a comparison view:

```typescript
// Future enhancement: Fetch Cloudflare analytics via API
// GET https://api.cloudflare.com/client/v4/zones/{zone_id}/analytics/dashboard
```

---

## Phase 5: API Integration (Optional, Week 2)

### 5.1 Cloudflare API Setup

Get API credentials:
1. Go to **My Profile > API Tokens**
2. Create token with permissions:
   - Zone: Read, Edit
   - Firewall Services: Read, Edit

### 5.2 Sync Rate Limit Rules

Create a sync service to push your `rate_limit_rules` to Cloudflare:

```typescript
// apps/api/src/core/admin/cloudflare-sync.service.ts

interface CloudflareRateLimitRule {
  id?: string;
  description: string;
  match: {
    request: {
      methods: string[];
      schemes: string[];
      url: string;
    };
  };
  threshold: number;
  period: number;
  action: {
    mode: 'simulate' | 'ban' | 'challenge';
    timeout: number;
    response?: {
      content_type: string;
      body: string;
    };
  };
}

async function syncRateLimitToCloudflare(
  rule: RateLimitRule,
  mode: 'simulate' | 'ban' = 'simulate'
): Promise<void> {
  const cfRule: CloudflareRateLimitRule = {
    description: rule.name,
    match: {
      request: {
        methods: ['_ALL_'],
        schemes: ['_ALL_'],
        url: `*${rule.endpoint_pattern.replace(/\*/g, '**')}*`,
      },
    },
    threshold: rule.requests_per_minute,
    period: 60,
    action: {
      mode,
      timeout: 60,
      response: {
        content_type: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'RATE_LIMITED',
            message: `Rate limit exceeded for ${rule.name}`,
          },
        }),
      },
    },
  };

  await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rate_limits`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cfRule),
    }
  );
}
```

### 5.3 Add Dashboard Controls

Add a "Push to Cloudflare" button in admin:
1. Select rules to enforce
2. Choose mode (simulate first, then ban)
3. Sync to Cloudflare
4. Monitor in both dashboards

---

## Phase 6: Gradual Rollout

### Week 1: Simulate Mode
- All rules in "simulate" (log-only)
- Compare Cloudflare logs with your traffic monitor
- Tune thresholds based on real data

### Week 2: Partial Enforcement
- Enable "ban" mode for:
  - Login/registration (security-critical)
  - Anonymous endpoints (abuse-prone)
- Keep authenticated API in simulate

### Week 3: Full Enforcement
- Enable "ban" mode for all rules
- Monitor error rates and user complaints
- Have quick rollback plan ready

---

## Rollback Plan

If rate limiting causes issues:

1. **Quick Disable**:
   - Go to Cloudflare dashboard
   - Disable specific rules or all rate limiting
   - Takes effect in <30 seconds

2. **Emergency Bypass**:
   - Create IP allowlist for known-good IPs
   - Temporarily increase all limits 10x

3. **Full Rollback**:
   - Disable Cloudflare proxy (grey cloud)
   - Traffic goes directly to origin
   - Loses protection but restores access

---

## Cost Considerations

### Free Plan Includes:
- 5 rate limiting rules (enough for basic protection)
- Basic bot protection
- DDoS protection
- SSL/TLS

### Pro Plan ($20/month) Adds:
- 25 rate limiting rules
- Super Bot Fight Mode
- Cache analytics
- Faster rule propagation

### Business Plan ($200/month) Adds:
- Unlimited rate limiting rules
- Advanced DDoS protection
- Custom WAF rules
- 24/7 support

**Recommendation**: Start with Free tier, upgrade to Pro when you need more rules.

---

## Checklist

### Phase 1: Setup
- [ ] Create Cloudflare account
- [ ] Add domain and update nameservers
- [ ] Configure SSL/TLS
- [ ] Verify site loads through Cloudflare

### Phase 2: Basic Rules
- [ ] Create login rate limit rule
- [ ] Create registration rate limit rule
- [ ] Create API general rate limit rules
- [ ] Create ticket purchase rate limit rule
- [ ] Configure custom block response

### Phase 3: Advanced
- [ ] Enable bot protection
- [ ] Add endpoint-specific rules
- [ ] Configure geographic rules (if needed)

### Phase 4: Monitoring
- [ ] Set up Cloudflare alerts
- [ ] Review analytics dashboard
- [ ] Compare with app-level monitoring

### Phase 5: Integration (Optional)
- [ ] Create Cloudflare API token
- [ ] Build sync service
- [ ] Add dashboard controls

### Phase 6: Rollout
- [ ] Week 1: Simulate all rules
- [ ] Week 2: Enforce critical rules
- [ ] Week 3: Full enforcement
- [ ] Document rollback procedures

---

## Related Files

- `supabase/migrations/20241231000002_platform_admin_f5.sql` - Rate limit rules table
- `apps/api/src/core/rate-monitor/` - Traffic monitoring service
- `apps/api/src/core/admin/admin.controller.ts` - Traffic stats endpoints
- `apps/web/src/app/(admin)/admin/traffic/page.tsx` - Traffic monitor dashboard
- `apps/web/src/app/(admin)/admin/rate-limits/page.tsx` - Rate limits management
