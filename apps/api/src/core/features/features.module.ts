import { Global, Module } from '@nestjs/common';
import { FeaturesService } from './features.service.js';
import { FeatureGuard } from './guards/feature.guard.js';

/**
 * Feature Flags Module
 *
 * Provides feature flag checking for the entire application.
 * Uses the feature_flags table and is_feature_enabled() SQL function.
 *
 * ## Usage
 *
 * ### Controller-level (all routes require feature)
 * ```typescript
 * @UseGuards(FeatureGuard)
 * @Feature('scheduling')
 * @Controller('organizations/:orgId/schedules')
 * export class SchedulingController {}
 * ```
 *
 * ### Route-level (specific routes require feature)
 * ```typescript
 * @Controller('organizations/:orgId/tickets')
 * export class TicketsController {
 *   @UseGuards(FeatureGuard)
 *   @Feature('checkin')
 *   @Post('scan')
 *   scanTicket() {}
 * }
 * ```
 *
 * ### Service-level (programmatic check)
 * ```typescript
 * if (await this.featuresService.isEnabled('virtual_queue', orgId)) {
 *   // Enable virtual queue features
 * }
 * ```
 *
 * ## Feature Flag Tiers
 *
 * - **basic**: Core features (ticketing, checkin) - always enabled
 * - **pro**: Advanced features (scheduling, inventory, analytics_pro)
 * - **enterprise**: Premium features (virtual_queue, sms_notifications, custom_domains)
 *
 * ## Notes
 *
 * - Super admins bypass all feature flag checks
 * - Flags are cached for 60 seconds to reduce DB calls
 * - The SQL function handles tier-based access and org/user allowlists
 */
@Global()
@Module({
  providers: [FeaturesService, FeatureGuard],
  exports: [FeaturesService, FeatureGuard],
})
export class FeaturesModule {}
