import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { InventoryController } from './inventory.controller.js';
import { InventoryService } from './inventory.service.js';
import { CategoriesService } from './categories.service.js';
import { CheckoutsService } from './checkouts.service.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule],
  controllers: [InventoryController],
  providers: [InventoryService, CategoriesService, CheckoutsService],
  exports: [InventoryService, CategoriesService, CheckoutsService],
})
export class InventoryModule {}
