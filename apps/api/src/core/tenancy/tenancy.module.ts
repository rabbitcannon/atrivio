import { Module } from '@nestjs/common';
import { TenantGuard } from './guards/tenant.guard.js';
import { TenancyService } from './tenancy.service.js';

@Module({
  providers: [TenancyService, TenantGuard],
  exports: [TenancyService, TenantGuard],
})
export class TenancyModule {}
