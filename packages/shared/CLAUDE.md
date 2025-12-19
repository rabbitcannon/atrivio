# Shared - Types & Utilities

Shared code used by all apps (api, web, workers).

## Exports

```typescript
import { OrgId, UserId } from '@haunt/shared/types';
import { ORG_ROLES, ROLE_PERMISSIONS } from '@haunt/shared/constants';
import { formatCurrency, dollarsToCents } from '@haunt/shared/utils';
```

## Branded Types

Prevent mixing up IDs at compile time:

```typescript
// This would be a compile error:
assignHaunt(userId, orgId); // Error: UserId not assignable to HauntId
```

Available: `OrgId`, `HauntId`, `UserId`, `StaffId`, `TicketId`, `OrderId`, etc.

## Role Constants

```typescript
PLATFORM_ROLES: ['super_admin', 'support']
ORG_ROLES: ['owner', 'admin', 'manager', 'hr', 'box_office', 'finance', 'actor', 'scanner']
```

## Permission Strings

Template literal types: `${Resource}:${Action}`

```typescript
type Permission = 'ticket:refund' | 'schedule:publish' | ...
```

## Money Utilities

Always use integers (cents):

```typescript
dollarsToCents(10.99)  // 1099
formatCurrency(1099)   // "$10.99"
calculatePlatformFee(10000, 3.0)  // 300 (3% of $100)
```

## Adding New Types

1. Add to appropriate file in `src/types/`
2. Export from `src/types/index.ts`
3. Re-export from `src/index.ts` if top-level
