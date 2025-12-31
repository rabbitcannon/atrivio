import { Module } from '@nestjs/common';
import { AttractionsController } from './attractions.controller.js';
import { AttractionsService } from './attractions.service.js';
import { SeasonsController } from './seasons.controller.js';
import { SeasonsService } from './seasons.service.js';
import { ZonesController } from './zones.controller.js';
import { ZonesService } from './zones.service.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';

@Module({
  imports: [TenancyModule, RbacModule],
  controllers: [AttractionsController, SeasonsController, ZonesController],
  providers: [AttractionsService, SeasonsService, ZonesService],
  exports: [AttractionsService, SeasonsService, ZonesService],
})
export class HauntsModule {}
