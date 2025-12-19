# Web - Next.js Frontend

## Stack

- Next.js 14 with **App Router** (not Pages Router)
- React 18 with Server Components by default
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

## Auth Flow

- Supabase Auth with PKCE
- HTTP-only cookies for session tokens
- Middleware checks auth and redirects

## Route Groups

- `(auth)`: Login, register, forgot-password
- `(dashboard)`: Main app, requires org membership
- `(admin)`: Super admin area, requires `platform_admins` check

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
