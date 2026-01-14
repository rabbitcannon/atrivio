import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AdminModule } from './core/admin/admin.module.js';
// Core modules
import { AuthModule } from './core/auth/auth.module.js';
import { JwtAuthGuard } from './core/auth/guards/jwt-auth.guard.js';
import { FeaturesModule } from './core/features/features.module.js';
import { MetricsInterceptor } from './core/metrics/metrics.interceptor.js';
// Metrics module (global)
import { MetricsModule } from './core/metrics/metrics.module.js';
// Rate monitoring (global)
import { RateMonitorInterceptor } from './core/rate-monitor/rate-monitor.interceptor.js';
import { RateMonitorModule } from './core/rate-monitor/rate-monitor.module.js';
import { RbacModule } from './core/rbac/rbac.module.js';
import { TenantGuard } from './core/tenancy/guards/tenant.guard.js';
import { TenancyModule } from './core/tenancy/tenancy.module.js';
// Check-In (F9 Check-In)
import { CheckInModule } from './modules/check-in/check-in.module.js';
import { HauntsModule } from './modules/haunts/haunts.module.js';
// Inventory (F10 Inventory)
import { InventoryModule } from './modules/inventory/inventory.module.js';
// Notifications (F12 Notifications)
import { NotificationsModule } from './modules/notifications/notifications.module.js';
// Business modules
import { OrganizationsModule } from './modules/organizations/organizations.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
// Virtual Queue (F11 Virtual Queue)
import { QueueModule } from './modules/queue/queue.module.js';
// Scheduling (F7 Scheduling)
import { SchedulingModule } from './modules/scheduling/scheduling.module.js';
import { StaffModule } from './modules/staff/staff.module.js';
// Storefronts (F14 Storefronts)
import { StorefrontsModule } from './modules/storefronts/storefronts.module.js';
// Ticketing (F8 Ticketing)
import { TicketingModule } from './modules/ticketing/ticketing.module.js';
// Media (F15 Media)
import { MediaModule } from './modules/media/media.module.js';
// Shared modules
import { DatabaseModule } from './shared/database/database.module.js';
import { StorageModule } from './shared/storage/storage.module.js';

// Future modules (to be implemented)
// import { AuditModule } from './core/audit/audit.module.js';
// import { OperationsModule } from './modules/operations/operations.module.js';
// import { MarketingModule } from './modules/marketing/marketing.module.js';
// import { AnalyticsModule } from './modules/analytics/analytics.module.js';
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
    StorageModule,

    // Metrics (global)
    MetricsModule,

    // Rate monitoring (global)
    RateMonitorModule,

    // Core modules
    AuthModule,
    TenancyModule,
    RbacModule,
    AdminModule,
    FeaturesModule,

    // Business modules (F1-F4 Foundation)
    OrganizationsModule,
    HauntsModule,
    StaffModule,

    // Payments (F6 Stripe Connect)
    PaymentsModule,

    // Scheduling (F7 Scheduling)
    SchedulingModule,

    // Ticketing (F8 Ticketing)
    TicketingModule,

    // Check-In (F9 Check-In)
    CheckInModule,

    // Inventory (F10 Inventory)
    InventoryModule,

    // Virtual Queue (F11 Virtual Queue)
    QueueModule,

    // Notifications (F12 Notifications)
    NotificationsModule,

    // Storefronts (F14 Storefronts)
    StorefrontsModule,

    // Media (F15 Media)
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    // Global Metrics Interceptor (runs on every request)
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    // Global Rate Monitor Interceptor (logs traffic, doesn't block)
    {
      provide: APP_INTERCEPTOR,
      useClass: RateMonitorInterceptor,
    },
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
