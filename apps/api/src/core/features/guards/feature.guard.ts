import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/feature.decorator.js';
import { FeaturesService } from '../features.service.js';

/**
 * Guard that checks if required feature flags are enabled for the org
 *
 * Must be used after TenantInterceptor to have tenant context.
 * Super admins bypass feature flag checks.
 *
 * @example
 * @UseGuards(FeatureGuard)
 * @Feature('scheduling')
 * @Controller('schedules')
 * export class SchedulingController {}
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featuresService: FeaturesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeatures = this.reflector.getAllAndOverride<string[]>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No feature requirement = allow access
    if (!requiredFeatures || requiredFeatures.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenant = request.tenant;

    // Super admins bypass feature flag checks
    if (tenant?.isSuperAdmin) {
      return true;
    }

    const orgId = tenant?.orgId || request.params?.orgId;
    const userId = tenant?.userId;

    // Check if all required features are enabled
    const allEnabled = await this.featuresService.areAllEnabled(requiredFeatures, orgId, userId);

    if (!allEnabled) {
      // Get flag details for better error message
      const disabledFeatures: string[] = [];
      for (const feature of requiredFeatures) {
        const enabled = await this.featuresService.isEnabled(feature, orgId, userId);
        if (!enabled) {
          disabledFeatures.push(feature);
        }
      }

      // Check if it's a tier-restricted feature
      const firstDisabled = disabledFeatures[0];
      const flag = firstDisabled ? await this.featuresService.getFlag(firstDisabled) : null;
      const tier = flag?.metadata?.['tier'] as string | undefined;

      throw new ForbiddenException({
        code: 'FEATURE_NOT_ENABLED',
        message: tier
          ? `This feature requires a ${tier} plan or higher`
          : `Feature not enabled: ${disabledFeatures.join(', ')}`,
        features: disabledFeatures,
        tier: tier || null,
      });
    }

    return true;
  }
}
