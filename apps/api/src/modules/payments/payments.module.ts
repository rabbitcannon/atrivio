import { Module } from '@nestjs/common';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';

@Module({
  imports: [TenancyModule, RbacModule],
  controllers: [PaymentsController, SubscriptionsController, WebhooksController],
  providers: [PaymentsService, SubscriptionsService, WebhooksService],
  exports: [PaymentsService, SubscriptionsService],
})
export class PaymentsModule {}
