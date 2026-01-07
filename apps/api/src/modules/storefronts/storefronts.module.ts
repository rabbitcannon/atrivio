import { Module } from '@nestjs/common';
import { FeaturesModule } from '../../core/features/features.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { PublicStorefrontsController, StorefrontsController } from './storefronts.controller.js';
import { StorefrontsService } from './storefronts.service.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule, FeaturesModule],
  controllers: [StorefrontsController, PublicStorefrontsController],
  providers: [StorefrontsService],
  exports: [StorefrontsService],
})
export class StorefrontsModule {}
