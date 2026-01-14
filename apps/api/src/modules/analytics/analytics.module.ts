import { Module } from '@nestjs/common';
import { FeaturesModule } from '../../core/features/features.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule, FeaturesModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
