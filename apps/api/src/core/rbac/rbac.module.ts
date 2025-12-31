import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RbacService } from './rbac.service.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { SuperAdminGuard } from './guards/super-admin.guard.js';

@Module({
  providers: [
    RbacService,
    // These are not global - use decorators to apply
    PermissionsGuard,
    RolesGuard,
    SuperAdminGuard,
  ],
  exports: [RbacService, PermissionsGuard, RolesGuard, SuperAdminGuard],
})
export class RbacModule {}
