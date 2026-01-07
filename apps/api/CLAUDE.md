# API - NestJS Backend

## Stack

- NestJS 11+ with **Fastify** adapter (not Express)
- SWC compiler for fast builds
- Swagger/OpenAPI auto-generated

## Structure

```
src/
├── core/                # Platform-level concerns
│   ├── auth/            # JWT auth from Supabase
│   │   ├── guards/      # JwtAuthGuard
│   │   ├── decorators/  # @CurrentUser, @Public
│   │   └── strategies/  # JWT strategy
│   ├── tenancy/         # Multi-tenant context
│   │   ├── interceptors/# TenantInterceptor
│   │   ├── decorators/  # @Tenant
│   │   └── guards/      # TenantGuard
│   ├── rbac/            # Role-based access control
│   │   ├── guards/      # RolesGuard, PermissionsGuard
│   │   └── decorators/  # @Roles, @Permissions
│   ├── features/        # Feature flag system
│   │   ├── guards/      # FeatureGuard
│   │   ├── decorators/  # @Feature
│   │   └── features.service.ts
│   └── admin/           # Super admin functionality
│       └── guards/      # SuperAdminGuard
├── modules/             # Business modules
│   ├── organizations/   # Org CRUD, membership
│   ├── haunts/          # Attractions management
│   ├── staff/           # Staff profiles, invites
│   ├── time-tracking/   # Clock in/out, status
│   ├── payments/        # Stripe Connect
│   ├── scheduling/      # Shifts, availability, swaps
│   ├── ticketing/       # Ticket types, orders, promo codes
│   └── check-in/        # Barcode scan, capacity, waivers
├── shared/              # Database, events, queues, storage
└── config/              # Configuration files
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

## Guards & Decorators

### Guard Stack (Applied in Order)
```typescript
@Controller('organizations/:orgId/schedules')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)  // 1. Extract tenant context
@UseGuards(FeatureGuard)              // 2. Check feature flags
@Feature('scheduling')                // 3. Require 'scheduling' flag
export class SchedulingController {

  @Get()
  @UseGuards(RolesGuard)              // 4. Check user role
  @Roles('owner', 'admin', 'manager') // 5. Allowed roles
  async list(@Tenant() ctx: TenantContext) {}
}
```

### Available Guards

| Guard | Purpose | Decorator |
|-------|---------|-----------|
| `JwtAuthGuard` | Validates JWT token | Global (auto-applied) |
| `TenantGuard` | Ensures valid org membership | `@UseGuards(TenantGuard)` |
| `RolesGuard` | Checks user role in org | `@Roles('owner', 'admin')` |
| `PermissionsGuard` | Checks granular permissions | `@Permissions('ticket:refund')` |
| `FeatureGuard` | Checks feature flag enabled | `@Feature('scheduling')` |
| `SuperAdminGuard` | Platform admin only | `@UseGuards(SuperAdminGuard)` |

### Common Decorators

| Decorator | Usage |
|-----------|-------|
| `@Tenant()` | Get `TenantContext` (orgId, userId, role) |
| `@CurrentUser()` | Get authenticated `AuthUser` |
| `@Roles(...)` | Require specific org roles |
| `@Feature(...)` | Require feature flag(s) enabled |
| `@Public()` | Skip JWT auth for endpoint |

## Feature Flags by Module

| Module | Flag Key | Tier | Description |
|--------|----------|------|-------------|
| Time Tracking | `time_tracking` | basic | Clock in/out, time entries |
| Ticketing | `ticketing` | basic | Ticket types, orders, promos |
| Check-In | `checkin` | basic | Barcode scan, capacity |
| Scheduling | `scheduling` | pro | Shifts, availability, swaps |
| Inventory | `inventory` | pro | Props, costumes (F10) |
| Virtual Queue | `virtual_queue` | enterprise | Line management |
| SMS Notifications | `sms_notifications` | enterprise | Twilio integration |

### Using Feature Flags in Services
```typescript
import { FeaturesService } from '../../core/features/features.service.js';

@Injectable()
export class MyService {
  constructor(private featuresService: FeaturesService) {}

  async doSomething(orgId: string) {
    if (await this.featuresService.isEnabled('virtual_queue', orgId)) {
      // Virtual queue is enabled for this org
    }
  }
}
```

## Super Admin

- Check `platform_admins` table (bypasses RLS with service-role)
- Use `SuperAdminGuard` for admin-only endpoints
- Impersonation creates scoped token with audit trail

## Testing

- Vitest for unit/integration
- `test/e2e/` for end-to-end tests
