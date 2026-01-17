# Atrivio Demo Access

Hey!

I wanted to share access to the Atrivio platform I've been working on. It's a multi-tenant SaaS for the attractions industry - think haunted houses, escape rooms, theme parks, etc.

## Demo URL

**https://dev.atrivio.io/**

## Test Accounts

All accounts use the same password: **`password123`**

### Recommended Starting Points

| Email | Organization | Tier | Role | Best For Testing |
|-------|--------------|------|------|------------------|
| `pro@haunt.dev` | Nightmare Manor | Pro | Owner | Full feature access - scheduling, ticketing, analytics |
| `enterprise@haunt.dev` | Terror Collective | Enterprise | Owner | All features including virtual queue, SMS |
| `free@haunt.dev` | Spooky Hollow | Free | Owner | Basic tier limitations |

### Additional Accounts (same org as pro@)

| Email | Role | Best For Testing |
|-------|------|------------------|
| `owner@haunt.dev` | Owner | Same as pro, different user |
| `manager@haunt.dev` | Manager | Manager-level permissions |
| `actor1@haunt.dev` | Actor | Staff view, time clock |

### Platform Admin

| Email | Role | Access |
|-------|------|--------|
| `admin@haunt.dev` | Super Admin | Platform-wide admin dashboard |

## Key Features to Explore

### As an Owner/Admin (pro@ or enterprise@)
- **Dashboard** - Overview of your organization
- **Attractions** - Manage your haunted houses/attractions
- **Staff** - Add team members, assign roles
- **Scheduling** - Create shifts, manage availability (Pro+)
- **Ticketing** - Create ticket types, promo codes, view orders
- **Check-In** - Scan tickets, manage capacity
- **Analytics** - Revenue and attendance insights (Pro+)
- **Settings** - Billing, integrations, organization settings

### As Staff (actor1@)
- **Time Clock** - Clock in/out
- **My Schedule** - View assigned shifts
- **Availability** - Set when you're available to work

### As Platform Admin (admin@)
- **Admin Dashboard** - Platform-wide statistics
- **Organizations** - View/manage all orgs
- **Users** - Platform user management
- **Feature Flags** - Control feature rollouts

## Subscription Tiers

The platform has three tiers that gate features:

| Feature | Free | Pro ($149/mo) | Enterprise ($499/mo) |
|---------|:----:|:-------------:|:--------------------:|
| Ticketing & Orders | ✅ | ✅ | ✅ |
| Check-In & Scanning | ✅ | ✅ | ✅ |
| Time Tracking | ✅ | ✅ | ✅ |
| Staff Scheduling | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Storefronts | ❌ | ✅ | ✅ |
| Virtual Queue | ❌ | ❌ | ✅ |
| SMS Notifications | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |

## Testing Payments

Stripe is in test mode. Use these test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`

Any future expiry date and any 3-digit CVC will work.

---

Let me know what you think! Happy to walk you through anything.
