import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { FeaturesModule } from '../../core/features/features.module.js';
import { QueueController } from './queue.controller.js';
import { QueuePublicController } from './queue-public.controller.js';
import { QueueService } from './queue.service.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule, FeaturesModule],
  controllers: [QueueController, QueuePublicController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
