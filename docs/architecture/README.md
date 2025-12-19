# Architecture Documentation

This folder contains architecture documentation for the Attraction Platform.

## Overview

The Attraction Platform is a multi-tenant SaaS application for the attractions industry, including:
- Haunted attractions
- Escape rooms
- Mazes
- Other immersive entertainment venues

## Key Documents

- [Main Architecture Document](/.claude/references/architecture.md) - Core architecture decisions
- [Feature Roadmap](/.claude/plans/feature-roadmap.md) - Implementation phases

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS v4 |
| Backend | NestJS 10+ with Fastify adapter |
| Database | Supabase (PostgreSQL with RLS) |
| Auth | Supabase Auth (PKCE flow) |
| Payments | Stripe Connect (Express accounts) |
| Queue | BullMQ with Redis |
| Monorepo | pnpm workspaces + Turborepo |

## Role Hierarchy

```
Platform Level
├── Super Admin (God Mode)
│
Organization Level
├── Owner (original signup)
├── Admin (promoted by owner)
├── Manager
├── HR
├── Box Office
├── Finance
├── Actor
└── Scanner
```

## Multi-Tenancy

- All organization data is scoped via `org_id`
- Row Level Security (RLS) enforces tenant isolation
- Users can belong to multiple organizations with different roles
