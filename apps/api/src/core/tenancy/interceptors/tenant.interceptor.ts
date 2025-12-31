import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { TenancyService } from '../tenancy.service.js';
import type { OrgId, UserId } from '@haunt/shared';

/**
 * Interceptor that resolves tenant context from :orgId route parameter
 *
 * Usage: Apply to controllers/routes that need org context
 *
 * @example
 * @UseInterceptors(TenantInterceptor)
 * @Controller('organizations/:orgId/attractions')
 * export class AttractionsController {}
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private tenancyService: TenancyService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId = request.params.orgId as OrgId;

    if (!user) {
      throw new ForbiddenException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication required',
      });
    }

    if (!orgId) {
      throw new ForbiddenException({
        code: 'ORG_ID_REQUIRED',
        message: 'Organization ID is required',
      });
    }

    // Check if user is super admin (bypasses org membership check)
    const isSuperAdmin = await this.tenancyService.isSuperAdmin(
      user.id as UserId,
    );

    if (isSuperAdmin) {
      // Super admins get full access with owner permissions
      const { data: org } = await (
        this.tenancyService as any
      ).supabase.adminClient
        .from('organizations')
        .select('id, name, slug')
        .eq('id', orgId)
        .single();

      if (org) {
        request.tenant = {
          orgId: org.id as OrgId,
          orgName: org.name,
          orgSlug: org.slug,
          userId: user.id as UserId,
          role: 'owner' as const,
          isOwner: false,
          isSuperAdmin: true,
          permissions: ['*'], // Super admin has all permissions
        };
        return next.handle();
      }
    }

    // Resolve tenant context for regular users
    const tenant = await this.tenancyService.resolveTenantContext(
      user.id as UserId,
      orgId,
    );

    // Attach to request for use in controllers
    request.tenant = tenant;

    return next.handle();
  }
}
