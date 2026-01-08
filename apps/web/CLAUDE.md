# Web - Next.js Frontend

## Stack

- Next.js 15 with **App Router** (not Pages Router)
- React 19 with Server Components by default
- Tailwind CSS v4 + shadcn/ui + CVA
- TanStack Query for server state
- Zustand for client state

## Structure

```
src/
├── app/                  # App Router
│   ├── (auth)/          # Public auth pages
│   ├── (dashboard)/     # Org-scoped dashboard
│   ├── (admin)/         # Super admin only
│   └── api/             # API routes (webhooks only)
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── forms/           # Form components
│   ├── layouts/         # Layout components
│   └── features/        # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/
│   ├── supabase/        # Supabase client (server + client)
│   ├── api/             # API client for backend
│   └── utils/           # Utilities (cn, etc.)
└── stores/              # Zustand stores
```

## Key Patterns

1. **Server Components**: Default, use `'use client'` only when needed
2. **Server Actions**: For mutations, not API routes
3. **Suspense**: Use for loading states, no `isLoading` booleans
4. **CVA**: Use class-variance-authority for component variants

### React 19 Features (Available)
- **ref as prop**: Can pass `ref` directly to components without `forwardRef` wrapper
- **use() hook**: Unwrap promises/context in render (alternative to Suspense)
- **Actions**: Form handling with `useActionState`, `useFormStatus`, `useOptimistic`
- **Note**: 85 existing `forwardRef` usages work unchanged (backward compatible)

### Next.js 15 Notes
- **Async Request APIs**: `params`, `searchParams`, `cookies()`, `headers()` are async
- **Caching**: Default is `no-store` (fetch caching opt-in)
- **Auth layouts**: Use `export const dynamic = 'force-dynamic'` for pages requiring cookies

## Auth Flow

- Supabase Auth with PKCE
- HTTP-only cookies for session tokens
- Middleware checks auth and redirects

## Route Groups

- `(auth)`: Login, register, forgot-password
- `(dashboard)`: Main app, requires org membership
- `(admin)`: Super admin area, requires `platform_admins` check
- `(time)`: Public time clock for staff

## Implemented Dashboard Routes

```
[orgId]/
├── page.tsx              # Dashboard overview
├── attractions/          # F3 Attractions
├── staff/                # F4 Staff management
│   └── [staffId]/        # Staff detail
├── payments/             # F6 Stripe Connect
├── schedule/             # F7b Scheduling
│   ├── page.tsx          # Calendar view
│   ├── availability/     # Staff availability
│   └── templates/        # Shift templates
├── ticketing/            # F8 Ticketing
│   ├── page.tsx          # Ticket types list
│   ├── orders/           # Order management
│   └── promo-codes/      # Promo codes
└── check-in/             # F9 Check-In
    ├── page.tsx          # Stations list
    ├── scan/             # Scanner interface
    ├── queue/            # Queue management
    └── reports/          # Check-in analytics
```

## Feature Flags (Frontend)

The API enforces feature flags, but the frontend should also check them for UI/UX:

### Hide Navigation for Disabled Features
```tsx
// In sidebar/navigation - hide links to disabled features
{features.scheduling && (
  <NavLink href={`/${orgId}/schedule`}>Schedule</NavLink>
)}
```

### Show Upgrade Prompts
```tsx
// When a feature is disabled, show upgrade prompt instead of content
if (!features.scheduling) {
  return (
    <UpgradePrompt
      feature="Scheduling"
      tier="pro"
      description="Manage staff shifts, availability, and swaps"
    />
  );
}
```

### Feature Flag Context (TODO)
```tsx
// Future: Create a FeatureFlagsProvider
const { isEnabled, tier } = useFeatureFlags();

if (!isEnabled('virtual_queue')) {
  return <UpgradeCard feature="Virtual Queue" requiredTier="enterprise" />;
}
```

### Current Feature Tiers
| Feature | Flag Key | Tier |
|---------|----------|------|
| Time Tracking | `time_tracking` | basic |
| Ticketing | `ticketing` | basic |
| Check-In | `checkin` | basic |
| Scheduling | `scheduling` | pro |
| Inventory | `inventory` | pro |
| Virtual Queue | `virtual_queue` | enterprise |

## Styling

- Use `cn()` utility from `@/lib/utils/cn` for class merging
- CSS variables for theming (see `globals.css`)
- No `@apply` - use component abstraction instead

## Design System

### Two Design Contexts

#### 1. Public/Landing Pages
For marketing, landing pages, and public-facing content:

- **Theme**: Wrap with `data-theme="landing"`
- **Styles**: `src/styles/themes/landing.css`
- **Components**: `src/components/home/`
- **Colors**: Purple primary (`--landing-accent-primary`), green secondary (`--landing-accent-secondary`), dark backgrounds
- **Background**: Always use `bg-[hsl(var(--landing-bg-darkest))]` on wrapper

```tsx
// Example: Public page structure
<div data-theme="landing" className="min-h-screen bg-[hsl(var(--landing-bg-darkest))]">
  <LandingHeader />
  <main>{/* content */}</main>
  <LandingFooter />
</div>
```

**Available Components**:
- `LandingHeader` - Sticky nav with mobile menu
- `HeroSection` - Hero with headline + illustration
- `FeatureGrid` - 3-column feature cards
- `SplitSection` - Text + visual split layout
- `LandingFooter` - Footer with link columns

**Animations** (respect `prefers-reduced-motion`):
- `landing-float` - Subtle floating effect
- `landing-pulse` - Opacity pulse
- `landing-glow` - Box shadow pulse

#### 2. App Pages (Dashboard, Auth, Admin)
For authenticated app UI:

- **Theme**: Default shadcn/ui (light/dark via `.dark` class on `<html>`)
- **Styles**: CSS variables in `globals.css`
- **Components**: `src/components/ui/` (shadcn primitives)
- **Colors**: Use semantic tokens (`primary`, `secondary`, `muted`, `destructive`)

```tsx
// Example: App page structure
export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {/* Use shadcn/ui components */}
    </div>
  );
}
```

### Design Principles (All Pages)

1. **Mobile-first**: Design for mobile, enhance for larger screens
   - `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)

2. **Accessibility**:
   - Semantic HTML (`<header>`, `<main>`, `<section>`, `<nav>`)
   - ARIA labels for icon-only buttons
   - Focus states on all interactive elements
   - Proper heading hierarchy (h1 > h2 > h3)
   - Skip links for keyboard navigation

3. **Performance**:
   - Server Components by default
   - `'use client'` only when needed (interactivity, hooks)
   - Suspense boundaries for loading states

4. **Component Patterns**:
   - Use `cn()` for conditional class merging
   - CVA for component variants
   - Props interface for type safety

### Color Usage

```tsx
// Landing pages - use landing theme variables
className="text-[hsl(var(--landing-text-primary))]"
className="bg-[hsl(var(--landing-accent-primary))]"

// App pages - use semantic tokens
className="text-foreground"
className="bg-primary"
className="text-muted-foreground"
```

## Animations

### Library
- Uses `motion` package (v12+) - import from `motion/react`
- Motion is a wrapper around framer-motion (same library, new branding)
- All animation components must have `'use client'` directive

### Pre-built Components (`@/components/ui/motion`)
| Component | Use Case |
|-----------|----------|
| `MotionDiv` | General animated container |
| `MotionCard` | Cards with hover effects |
| `MotionList/Item` | Staggered list animations |
| `FadeIn` | Simple fade with direction |
| `StaggerContainer/Item` | Grid animations |

### Variants (`@/lib/motion`)
- `fadeVariants`, `fadeUpVariants` - Fade animations
- `scaleVariants` - Scale in/out
- `slideLeftVariants`, `slideRightVariants` - Slide panels
- `cardHover`, `buttonStates` - Interactive states

### Accessibility
- All components check `useReducedMotion()`
- Fallback to static rendering when reduced motion preferred
- Use `prefersReducedMotion()` utility for custom animations

### When to Use What
| Context | Approach |
|---------|----------|
| Landing page sections | `FadeIn`, `StaggerContainer` with `useInView` |
| Dashboard cards | `MotionCard` or CSS transitions |
| Page transitions | `PageTransition` component |
| Hover effects | `cardHover` or `buttonStates` presets |
| Loading states | CSS `skeleton-shimmer` class |

### Configuration (next.config.js)
```js
transpilePackages: ['motion', 'framer-motion'],
// Both needed - motion re-exports framer-motion
```
