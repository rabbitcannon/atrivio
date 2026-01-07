import type { UserId } from '@haunt/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { CertificationsService } from './certifications.service.js';
import type { AddCertificationDto } from './dto/certifications.dto.js';

@ApiTags('Staff Certifications')
@Controller('organizations/:orgId/staff/:staffId/certifications')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class CertificationsController {
  constructor(private certificationsService: CertificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get staff certifications' })
  async list(@Tenant() ctx: TenantContext, @Param('staffId') staffId: string) {
    return this.certificationsService.findAll(ctx.orgId, staffId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Add certification' })
  async add(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: AddCertificationDto
  ) {
    return this.certificationsService.add(ctx.orgId, staffId, dto);
  }

  @Post(':certId/verify')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'hr')
  @ApiOperation({ summary: 'Verify certification' })
  async verify(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Param('certId') certId: string,
    @CurrentUser('id') userId: UserId
  ) {
    return this.certificationsService.verify(ctx.orgId, staffId, certId, userId);
  }

  @Delete(':certId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'hr')
  @ApiOperation({ summary: 'Delete certification' })
  async delete(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Param('certId') certId: string
  ) {
    return this.certificationsService.delete(ctx.orgId, staffId, certId);
  }
}
