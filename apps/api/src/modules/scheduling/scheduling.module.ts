import { Module } from '@nestjs/common';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { AvailabilityController } from './availability.controller.js';
import { AvailabilityService } from './availability.service.js';
import { SchedulingController } from './scheduling.controller.js';
import { SchedulingService } from './scheduling.service.js';
import { SwapsController } from './swaps.controller.js';
import { SwapsService } from './swaps.service.js';
import { TemplatesController } from './templates.controller.js';
import { TemplatesService } from './templates.service.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule],
  controllers: [SchedulingController, AvailabilityController, TemplatesController, SwapsController],
  providers: [SchedulingService, AvailabilityService, TemplatesService, SwapsService],
  exports: [SchedulingService, AvailabilityService, TemplatesService, SwapsService],
})
export class SchedulingModule {}
