import { Module } from '@nestjs/common';
import { TenancyService } from './tenancy.service.js';
import { TenantGuard } from './guards/tenant.guard.js';

@Module({
  providers: [TenancyService, TenantGuard],
  exports: [TenancyService, TenantGuard],
})
export class TenancyModule {}
