import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Shared modules
import { DatabaseModule } from './shared/database/database.module.js';

// Core modules
import { AuthModule } from './core/auth/auth.module.js';
import { JwtAuthGuard } from './core/auth/guards/jwt-auth.guard.js';
import { TenancyModule } from './core/tenancy/tenancy.module.js';
import { TenantGuard } from './core/tenancy/guards/tenant.guard.js';
import { RbacModule } from './core/rbac/rbac.module.js';
import { AdminModule } from './core/admin/admin.module.js';

// Business modules
import { OrganizationsModule } from './modules/organizations/organizations.module.js';
import { HauntsModule } from './modules/haunts/haunts.module.js';
import { StaffModule } from './modules/staff/staff.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';

// Scheduling (F7 Scheduling)
import { SchedulingModule } from './modules/scheduling/scheduling.module.js';

// Future modules (to be implemented)
// import { AuditModule } from './core/audit/audit.module.js';
// import { TicketingModule } from './modules/ticketing/ticketing.module.js';
// import { CheckInModule } from './modules/check-in/check-in.module.js';
// import { InventoryModule } from './modules/inventory/inventory.module.js';
// import { OperationsModule } from './modules/operations/operations.module.js';
// import { MarketingModule } from './modules/marketing/marketing.module.js';
// import { AnalyticsModule } from './modules/analytics/analytics.module.js';
// import { NotificationsModule } from './modules/notifications/notifications.module.js';
// import { EventBusModule } from './shared/events/event-bus.module.js';

@Module({
  imports: [
    // Configuration - load from root directory
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env.local', '../../.env', '.env.local', '.env'],
    }),

    // Shared modules
    DatabaseModule,

    // Core modules
    AuthModule,
    TenancyModule,
    RbacModule,
    AdminModule,

    // Business modules (F1-F4 Foundation)
    OrganizationsModule,
    HauntsModule,
    StaffModule,

    // Payments (F6 Stripe Connect)
    PaymentsModule,

    // Scheduling (F7 Scheduling)
    SchedulingModule,
  ],
  controllers: [],
  providers: [
    // Global JWT Auth Guard (runs first - sets request.user)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Tenant Guard (runs second - sets request.tenant)
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}
