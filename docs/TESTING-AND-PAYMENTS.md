# Testing Guide & Stripe Connect Architecture

This document covers how to test the Atrivio and explains the Stripe Connect payment architecture.

---

## Table of Contents

1. [Test Accounts](#test-accounts)
2. [Starting the Development Environment](#starting-the-development-environment)
3. [Testing by Role](#testing-by-role)
4. [Stripe Connect Architecture](#stripe-connect-architecture)
5. [Platform Fee Structure](#platform-fee-structure)
6. [Onboarding Flow](#onboarding-flow)
7. [Transaction Flow](#transaction-flow)
8. [Development vs Production](#development-vs-production)

---

## Test Accounts

All test accounts use the password: `password123`

### Platform Admin

| Email | Role | Organization | Access |
|-------|------|--------------|--------|
| `superadmin@haunt.dev` | Super Admin | Platform-level | Full admin panel at `/admin` |

### Nightmare Manor (Primary Test Org)

| Email | Role | Payments Access | Notes |
|-------|------|-----------------|-------|
| `owner@haunt.dev` | Owner | Full | Can connect Stripe, view all data |
| `admin@haunt.dev` | Admin | Full | Can manage payments, not Stripe setup |
| `manager@haunt.dev` | Manager | None | Staff & attractions only |
| `hr@haunt.dev` | HR | None | Staff & members only |
| `finance@haunt.dev` | Finance | View Only | Transactions & payouts, no management |
| `boxoffice@haunt.dev` | Box Office | None | Ticket sales (future feature) |
| `actor1@haunt.dev` | Actor | None | Personal schedule & time only |

### Role Permissions Matrix

| Feature | Owner | Admin | Manager | HR | Finance | Box Office | Actor |
|---------|:-----:|:-----:|:-------:|:--:|:-------:|:----------:|:-----:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Attractions | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Staff Management | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Schedule | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Connect Stripe** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Payments** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Issue Refunds** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Members & Invites | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Org Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| My Schedule | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Time Tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin Panel** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

> **Note**: Only `superadmin@haunt.dev` can access the platform admin panel at `/admin`.

---

## Starting the Development Environment

### Prerequisites
- Node.js 18+
- pnpm
- Docker (for Supabase)

### Quick Start

```bash
# Terminal 1: Start Supabase
supabase start

# Terminal 2: Start the API (NestJS)
pnpm --filter @atrivio/api dev

# Terminal 3: Start the frontend (Next.js)
pnpm --filter @atrivio/web dev
```

### URLs
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Supabase Studio**: http://localhost:54323
- **API Docs (Swagger)**: http://localhost:3001/api/docs

### Reset Database
```bash
supabase db reset
```
This re-runs all migrations and seed data.

---

## Testing by Role

### Super Admin Testing
1. Login with `superadmin@haunt.dev`
2. Navigate to http://localhost:3000/admin
3. Features to test:
   - Dashboard with platform stats
   - View all organizations
   - Audit logs across tenants
   - Feature flags management
   - System health monitoring

### Owner Testing (Payments Focus)
1. Login with `owner@haunt.dev`
2. Auto-redirects to `/nightmare-manor`
3. Click **Payments** in the sidebar
4. Test:
   - View Stripe account status (shows "Active" with seed data)
   - View revenue summary cards
   - Browse transactions list
   - Browse payouts list
   - Click "View Stripe Dashboard" (mock redirect in dev)

### Finance Role Testing
1. Login with `finance@haunt.dev`
2. Should only see limited sidebar options
3. Can access Payments section
4. Cannot access Staff, Attractions, or Settings

---

## Stripe Connect Architecture

### Overview

We use **Stripe Connect with Express Accounts**. This is the recommended approach for marketplace/platform businesses where:

- **You (the platform)** collect payments from customers
- **Merchants (haunt owners)** receive payouts to their bank accounts
- **You take a fee** from each transaction

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER                                 │
│                    (Buys a $50 ticket)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HAUNT PLATFORM                              │
│                    (Stripe Connect)                              │
│                                                                  │
│   Payment Intent: $50.00                                        │
│   ├── Platform Fee (2.9%): $1.45 → Goes to YOUR Stripe account  │
│   ├── Stripe Fee (~2.9% + 30¢): $1.75 → Goes to Stripe          │
│   └── Net to Merchant: $46.80 → Goes to connected account       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NIGHTMARE MANOR                               │
│                 (Connected Stripe Account)                       │
│                                                                  │
│   Receives: $46.80                                              │
│   Payout Schedule: Daily/Weekly (their choice in Stripe)        │
└─────────────────────────────────────────────────────────────────┘
```

### Why Express Accounts?

| Account Type | Setup | Dashboard | Best For |
|--------------|-------|-----------|----------|
| **Express** (ours) | Stripe-hosted onboarding | Stripe-hosted dashboard | Marketplaces, minimal friction |
| Standard | User creates own Stripe account | Full Stripe dashboard | SaaS with sophisticated users |
| Custom | You build everything | You build everything | Full control, high dev cost |

**Express accounts** are ideal because:
1. **Stripe handles onboarding** - KYC, identity verification, bank account setup
2. **Stripe handles compliance** - Tax forms, regulatory requirements
3. **Stripe handles payouts** - Automatic transfers to merchant bank accounts
4. **Merchants get a dashboard** - They can see their transactions/payouts
5. **Minimal liability for you** - Stripe is the merchant of record

---

## Platform Fee Structure

### How We Take a Cut

When a customer makes a payment, we use Stripe's `application_fee_amount` parameter:

```typescript
// Example: Customer pays $50 for a ticket
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5000,                    // $50.00 in cents
  currency: 'usd',
  application_fee_amount: 145,     // $1.45 (2.9% platform fee)
  transfer_data: {
    destination: 'acct_xxxxx',     // Merchant's connected account
  },
});
```

### Fee Breakdown Example

| Item | Amount | Recipient |
|------|--------|-----------|
| Customer Pays | $50.00 | - |
| Platform Fee (2.9%) | $1.45 | **Your Stripe Account** |
| Stripe Processing Fee | ~$1.75 | Stripe |
| **Merchant Receives** | **$46.80** | Connected Account |

### Configuring the Platform Fee

The fee percentage is stored in `platform_settings` with a default of 3%:

```sql
-- Current setting in seed data
INSERT INTO public.platform_settings (key, value, description)
VALUES ('stripe_platform_fee_percent', '3.0', 'Platform fee percentage for Stripe transactions');
```

**Per-Client Custom Fees**: Organizations can have custom fees set by super admin via the admin panel at `/admin/organizations/:orgId`. If not set, the global default (3%) is used.

To change it:
1. Update via Admin Panel → Settings
2. Or directly in the database
3. The API reads this when processing payments

### Fee Considerations

| Fee Level | Your Take (on $50) | Merchant Gets | Competitiveness |
|-----------|-------------------|---------------|-----------------|
| 1.0% | $0.50 | $47.75 | Very competitive |
| 2.0% | $1.00 | $47.25 | Competitive |
| **2.9%** | **$1.45** | **$46.80** | **Industry standard** |
| 5.0% | $2.50 | $45.75 | Premium services |
| 10.0% | $5.00 | $43.25 | High-touch/managed |

> **Recommendation**: Start at 2.9% (industry standard), adjust based on value provided.

---

## Onboarding Flow

### Who Can Connect Stripe?

**Only Organization Owners** can connect a Stripe account. This is enforced at the API level:

```typescript
@Post('connect')
@Roles('owner', 'admin')  // Only owner/admin can initiate
async createAccount(...) { ... }
```

In practice, we may want to restrict this to `owner` only for security.

### The Onboarding Process

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. OWNER CLICKS "CONNECT WITH STRIPE"                            │
│    Location: /nightmare-manor/payments                           │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. API CREATES EXPRESS ACCOUNT                                   │
│    POST /api/v1/organizations/:orgId/payments/connect            │
│                                                                  │
│    - Creates Stripe account with type: 'express'                 │
│    - Stores account ID in our database                           │
│    - Generates onboarding link                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. REDIRECT TO STRIPE                                            │
│    User is sent to Stripe's hosted onboarding flow               │
│                                                                  │
│    Stripe collects:                                              │
│    - Business information                                        │
│    - Owner identity verification                                 │
│    - Bank account for payouts                                    │
│    - Tax information                                             │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. RETURN TO PLATFORM                                            │
│    User redirected back to /nightmare-manor/payments             │
│                                                                  │
│    Meanwhile, Stripe sends webhook:                              │
│    - account.updated event                                       │
│    - We update status in our database                            │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. ACCOUNT ACTIVE                                                │
│    Status changes from "onboarding" → "active"                   │
│    Merchant can now accept payments                              │
└──────────────────────────────────────────────────────────────────┘
```

### Account Statuses

| Status | Meaning | Can Accept Payments? |
|--------|---------|---------------------|
| `pending` | Account created, never started onboarding | No |
| `onboarding` | Started but not completed onboarding | No |
| `active` | Fully set up and verified | **Yes** |
| `restricted` | Missing info or verification issues | Limited |
| `disabled` | Deauthorized or suspended | No |

---

## Transaction Flow

### When a Customer Buys a Ticket

```
1. Customer → Frontend: "Buy $50 ticket"
2. Frontend → API: Create payment intent
3. API → Stripe: Create PaymentIntent with platform fee
4. Stripe → Frontend: Client secret for payment form
5. Customer → Stripe: Enters card details (via Stripe Elements)
6. Stripe → Webhook: payment_intent.succeeded
7. API → Database: Record transaction
8. Stripe → Merchant: Automatic payout (daily/weekly)
```

### Webhook Events We Handle

| Event | What It Means | Our Action |
|-------|---------------|------------|
| `account.updated` | Merchant account status changed | Update account status |
| `account.application.deauthorized` | Merchant disconnected | Mark account disabled |
| `payment_intent.succeeded` | Payment completed | Record transaction |
| `payment_intent.payment_failed` | Payment failed | Log failure |
| `charge.refunded` | Refund processed | Update transaction status |
| `charge.dispute.created` | Customer disputed charge | Flag transaction |
| `payout.created` | Payout initiated | Record payout |
| `payout.paid` | Payout completed | Update payout status |
| `payout.failed` | Payout failed | Alert and log |

---

## Development vs Production

### What's Different in Development

| Feature | Development | Production |
|---------|-------------|------------|
| Stripe API | Mock responses | Real Stripe SDK |
| Onboarding | Fake URLs | Real Stripe hosted pages |
| Webhooks | Manual testing | Real webhook delivery |
| Payments | Simulated | Real card processing |
| Payouts | Fake records | Real bank transfers |

### Enabling Production Stripe

1. **Get Stripe Keys**:
   ```env
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

2. **Uncomment Stripe SDK Code** in:
   - `apps/api/src/modules/payments/payments.service.ts`
   - `apps/api/src/modules/payments/webhooks.service.ts`

3. **Set Up Webhook Endpoint** in Stripe Dashboard:
   - URL: `https://api.yourdomain.com/api/v1/webhooks/stripe`
   - Events: All account and payment events

4. **Enable HTTPS** (required for Stripe)

### Testing with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger account.updated
```

---

## Common Questions

### Q: Can merchants see their transactions?
**A:** Yes! When they click "View Stripe Dashboard", they're redirected to Stripe's Express dashboard where they can see all their transactions, payouts, and settings.

### Q: Can merchants change their payout schedule?
**A:** Yes, through their Stripe Express dashboard. They can choose daily, weekly, or monthly payouts.

### Q: What if a merchant wants to disconnect?
**A:** They can deauthorize through Stripe. We receive a webhook and mark their account as disabled. They'd need to reconnect to accept payments again.

### Q: Can we block a merchant from receiving payouts?
**A:** Yes, through the Stripe API we can pause payouts. This might be needed for dispute resolution or policy violations.

### Q: How do refunds work?
**A:** When we issue a refund:
- Customer gets their money back
- Our platform fee is **not** refunded (configurable in Stripe)
- Merchant's balance is debited

### Q: What about disputes/chargebacks?
**A:** Stripe handles the dispute process. We receive webhooks to track status. The merchant is responsible for providing evidence.

---

## Next Steps

1. **Test the current implementation** with the seed accounts
2. **Decide on your platform fee percentage**
3. **Create a Stripe account** and get API keys
4. **Set up the Stripe Connect application** in Stripe Dashboard
5. **Configure webhooks** for production
6. **Implement the payment flow** when ticketing (F8) is built

---

## Related Documentation

- [MVP Implementation Plan](/.claude/plans/mvp-implementation.md)
- [F6 Payments ERD](/docs/features/F6-payments/ERD.md)
- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Express Account Guide](https://stripe.com/docs/connect/express-accounts)
