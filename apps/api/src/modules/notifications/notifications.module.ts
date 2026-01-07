import { Module } from '@nestjs/common';
import { FeaturesModule } from '../../core/features/features.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import {
  NotificationsController,
  UserNotificationsController,
} from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule, FeaturesModule],
  controllers: [NotificationsController, UserNotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
