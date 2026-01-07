import { Module } from '@nestjs/common';
import { FeaturesModule } from '../../core/features/features.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { QueueController } from './queue.controller.js';
import { QueueService } from './queue.service.js';
import { QueuePublicController } from './queue-public.controller.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule, FeaturesModule, NotificationsModule],
  controllers: [QueueController, QueuePublicController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
