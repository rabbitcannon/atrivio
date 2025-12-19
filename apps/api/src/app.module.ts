import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Core modules (to be implemented)
// import { AuthModule } from './core/auth/auth.module.js';
// import { AdminModule } from './core/admin/admin.module.js';
// import { TenancyModule } from './core/tenancy/tenancy.module.js';
// import { RbacModule } from './core/rbac/rbac.module.js';
// import { AuditModule } from './core/audit/audit.module.js';

// Business modules (to be implemented)
// import { OrganizationsModule } from './modules/organizations/organizations.module.js';
// import { HauntsModule } from './modules/haunts/haunts.module.js';
// import { StaffModule } from './modules/staff/staff.module.js';
// import { SchedulingModule } from './modules/scheduling/scheduling.module.js';
// import { TicketingModule } from './modules/ticketing/ticketing.module.js';
// import { CheckInModule } from './modules/check-in/check-in.module.js';
// import { PaymentsModule } from './modules/payments/payments.module.js';
// import { InventoryModule } from './modules/inventory/inventory.module.js';
// import { OperationsModule } from './modules/operations/operations.module.js';
// import { MarketingModule } from './modules/marketing/marketing.module.js';
// import { AnalyticsModule } from './modules/analytics/analytics.module.js';
// import { NotificationsModule } from './modules/notifications/notifications.module.js';

// Shared modules (to be implemented)
// import { DatabaseModule } from './shared/database/database.module.js';
// import { EventBusModule } from './shared/events/event-bus.module.js';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Core modules
    // AuthModule,
    // AdminModule,
    // TenancyModule,
    // RbacModule,
    // AuditModule,

    // Shared modules
    // DatabaseModule,
    // EventBusModule,

    // Business modules
    // OrganizationsModule,
    // HauntsModule,
    // StaffModule,
    // SchedulingModule,
    // TicketingModule,
    // CheckInModule,
    // PaymentsModule,
    // InventoryModule,
    // OperationsModule,
    // MarketingModule,
    // AnalyticsModule,
    // NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
