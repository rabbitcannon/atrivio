# Storefront - Public-Facing Attraction Websites

## Purpose

Public storefronts for attractions. Each attraction gets its own subdomain or custom domain.

## Stack

- Next.js 15 with App Router
- Server Components by default
- Tailwind CSS v4
- No auth required (public pages)

## Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with theme injection
│   ├── page.tsx         # Homepage
│   ├── tickets/         # Ticket purchasing
│   ├── faqs/            # FAQ page
│   ├── [slug]/          # Dynamic content pages
│   └── not-found.tsx    # 404 page
├── components/
│   ├── header.tsx       # Public header with nav
│   ├── footer.tsx       # Footer with social links
│   └── announcement-banner.tsx
├── lib/
│   ├── api.ts           # API client for public endpoints
│   ├── storefront-context.tsx  # React context
│   └── utils.ts         # Utilities
├── styles/
│   └── globals.css      # Base styles with CSS variables
└── middleware.ts        # Domain resolution
```

## Domain Resolution

Storefronts are **per-attraction** (not per-org). Each attraction can have its own public website.

The middleware handles three scenarios:

1. **Development**: `localhost:3002?storefront=haunted-mansion` (attraction slug)
2. **Subdomain**: `haunted-mansion.atrivio.io`
3. **Custom Domain**: `hauntedmansion.com`

The identifier is passed to the layout via `x-storefront-identifier` header.

**Resolution order** (in API):
1. Check `storefront_domains` table for exact domain match
2. Fall back to `attractions.slug` lookup

## Theming

Each storefront can customize:
- Colors (primary, secondary, accent, background, text)
- Fonts (heading, body)
- Custom CSS

CSS variables are injected in the layout based on storefront settings.

## API Integration

All data comes from the NestJS API:
- `GET /api/v1/storefronts/:identifier` - Full storefront data
- `GET /api/v1/storefronts/:identifier/pages/:slug` - Single page
- `GET /api/v1/storefronts/:identifier/faqs` - FAQs

## Development

```bash
# Start the storefront app (included in `pnpm dev` at root)
pnpm --filter @atrivio/storefront dev

# Access with attraction slug
http://localhost:3002?storefront=haunted-mansion
```

## Deployment

For production with custom domains:

### Vercel
1. Deploy the storefront app
2. Add wildcard domain: `*.atrivio.io`
3. For custom domains, users add CNAME pointing to Vercel

### Railway
1. Deploy as separate service
2. Configure custom domains in Railway dashboard
3. SSL auto-provisioned

## Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Domain → identifier resolution |
| `app/layout.tsx` | Theme injection, analytics, layout |
| `lib/api.ts` | API client with caching |
| `lib/storefront-context.tsx` | Storefront data context |
