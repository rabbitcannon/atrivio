# API - NestJS Backend

## Stack

- NestJS 10+ with **Fastify** adapter (not Express)
- SWC compiler for fast builds
- Swagger/OpenAPI auto-generated

## Structure

```
src/
├── core/           # Platform-level (auth, admin, tenancy, rbac, audit)
├── modules/        # Business modules (orgs, haunts, staff, etc.)
├── shared/         # Database, events, queues, storage, websockets
└── config/         # Configuration files
```

## Module Pattern

Each module follows:
```
module/
├── module.module.ts      # NestJS module
├── module.controller.ts  # HTTP endpoints
├── module.service.ts     # Business logic
├── module.repository.ts  # Database access (ALWAYS requires org_id)
├── dto/                  # Zod schemas + class-validator
└── events/               # Domain events
```

## Key Rules

1. **Repository pattern**: Always pass `orgId` explicitly - no implicit globals
2. **Fastify**: Use Fastify decorators, not Express middleware
3. **Validation**: Use class-validator + class-transformer with Zod for shared schemas
4. **API prefix**: All routes under `/api/v1/`

## Auth & Tenancy

- JWT from Supabase Auth in `Authorization: Bearer <token>`
- `TenantInterceptor` extracts org context from token claims
- `@Permissions('resource:action')` decorator for RBAC

## Super Admin

- Check `platform_admins` table (bypasses RLS with service-role)
- Use `SuperAdminGuard` for admin-only endpoints
- Impersonation creates scoped token with audit trail

## Testing

- Vitest for unit/integration
- `test/e2e/` for end-to-end tests
