import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { SuperAdminGuard } from './guards/super-admin.guard.js';
import { HealthService } from './health.service.js';
import { PlatformController } from './platform.controller.js';

@Module({
  controllers: [AdminController, PlatformController],
  providers: [AdminService, HealthService, SuperAdminGuard],
  exports: [AdminService, HealthService, SuperAdminGuard],
})
export class AdminModule {}
