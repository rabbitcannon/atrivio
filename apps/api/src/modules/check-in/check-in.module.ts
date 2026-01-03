import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { CheckInController } from './check-in.controller.js';
import { CheckInService } from './check-in.service.js';
import { StationsService } from './stations.service.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule],
  controllers: [CheckInController],
  providers: [CheckInService, StationsService],
  exports: [CheckInService, StationsService],
})
export class CheckInModule {}
