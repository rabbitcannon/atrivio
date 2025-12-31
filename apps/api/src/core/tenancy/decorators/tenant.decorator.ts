import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { TenantContext } from '../tenancy.service.js';

/**
 * Decorator to extract the tenant context from the request
 *
 * @example
 * @Get()
 * list(@Tenant() ctx: TenantContext) {
 *   // ctx.orgId, ctx.role, ctx.permissions available
 * }
 */
export const Tenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request.tenant as TenantContext;

    if (data) {
      return tenant?.[data];
    }

    return tenant;
  },
);

/**
 * Decorator to extract just the org ID from the request
 */
export const OrgContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant?.orgId;
  },
);
