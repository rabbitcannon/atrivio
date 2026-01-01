import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';

@Module({
  imports: [TenancyModule, RbacModule],
  controllers: [PaymentsController, WebhooksController],
  providers: [PaymentsService, WebhooksService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
