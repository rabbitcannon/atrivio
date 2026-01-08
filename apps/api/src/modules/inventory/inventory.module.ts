import { Module } from '@nestjs/common';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { CategoriesService } from './categories.service.js';
import { CheckoutsService } from './checkouts.service.js';
import { InventoryController } from './inventory.controller.js';
import { InventoryService } from './inventory.service.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule],
  controllers: [InventoryController],
  providers: [InventoryService, CategoriesService, CheckoutsService],
  exports: [InventoryService, CategoriesService, CheckoutsService],
})
export class InventoryModule {}
