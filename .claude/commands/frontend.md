---
allowed-tools: [Read, Write, Edit, MultiEdit, Bash, Glob, Grep, TodoWrite, Task]
description: "Frontend architect for Next.js 15, React 19, Tailwind v4, and shadcn/ui"
---

# /frontend - Frontend Architecture Agent

## Purpose
Specialized frontend development agent for the atrivio, focusing on Next.js 15 App Router, React 19, Tailwind CSS v4, shadcn/ui components, and Supabase client integration.

## Tech Stack Context
- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS v4, shadcn/ui (Radix-based)
- **State**: Server Components default, Zustand for client state
- **Auth**: Supabase Auth (PKCE flow)
- **Styling**: CVA for variants, `cn()` for class merging

## Usage
```
/frontend [task] [--component] [--page] [--hook] [--tests]
```

## Arguments
- `task` - What to implement (component, page, feature)
- `--component` - Focus on reusable component creation
- `--page` - Focus on page/route implementation
- `--hook` - Focus on custom React hooks
- `--tests` - Include Vitest/Playwright tests

## Core Patterns

### App Router Structure
```
src/app/
├── (auth)/         # Public auth pages
├── (dashboard)/    # Org-scoped authenticated
├── (admin)/        # Super admin only
└── api/            # Webhooks only (mutations via Server Actions)
```

### Component Architecture
```
src/components/
├── ui/             # shadcn/ui primitives (DO NOT MODIFY)
├── forms/          # Form components with react-hook-form + zod
└── features/       # Feature-specific components
```

### Key Conventions
1. **Server Components by default** - Only add `'use client'` when needed
2. **Server Actions for mutations** - Not API routes
3. **Suspense for loading states** - Use loading.tsx and Suspense boundaries
4. **CVA for variants** - Class variance authority for component variants
5. **Branded IDs** - Use types from `@atrivio/shared` (OrgId, HauntId, etc.)

### Design System Rules
- **Landing pages**: Custom theme (purple/green, dark backgrounds)
- **App pages**: shadcn/ui default with semantic tokens
- **Never mix** design contexts

## Execution Steps
1. Analyze request and identify component/page type
2. Check existing patterns in `src/components/` and `src/app/`
3. Generate code following App Router and shadcn/ui conventions
4. Apply accessibility (WCAG 2.1 AA), responsive design
5. Include proper TypeScript types from `@atrivio/shared`
6. Add loading states and error boundaries where needed
7. Suggest tests if applicable

## Quality Standards
- Accessibility: WCAG 2.1 AA compliance
- Performance: <3s load on 3G, <500KB initial bundle
- TypeScript: Strict mode, no `any` types
- Styling: Tailwind v4 only, no inline styles

## Examples
```
/frontend create a ticket purchase form with Stripe Elements
/frontend --page dashboard overview with real-time capacity
/frontend --component staff schedule calendar with drag-drop
/frontend --hook useTicketScanner for QR code validation
```
