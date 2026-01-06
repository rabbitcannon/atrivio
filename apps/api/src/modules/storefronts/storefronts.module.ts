import { Module } from '@nestjs/common';
import { StorefrontsService } from './storefronts.service.js';
import { StorefrontsController, PublicStorefrontsController } from './storefronts.controller.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { FeaturesModule } from '../../core/features/features.module.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule, FeaturesModule],
  controllers: [StorefrontsController, PublicStorefrontsController],
  providers: [StorefrontsService],
  exports: [StorefrontsService],
})
export class StorefrontsModule {}
