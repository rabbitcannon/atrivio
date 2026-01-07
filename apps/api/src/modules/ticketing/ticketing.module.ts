import { Module } from '@nestjs/common';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { TicketingController } from './ticketing.controller.js';
import { TicketingService } from './ticketing.service.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule, PaymentsModule],
  controllers: [TicketingController, OrdersController],
  providers: [TicketingService, OrdersService],
  exports: [TicketingService, OrdersService],
})
export class TicketingModule {}
