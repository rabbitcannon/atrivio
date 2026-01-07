import type { OrgRole } from '@haunt/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type { UpdateMemberDto } from './dto/members.dto.js';
import { MembersService } from './members.service.js';

@ApiTags('Organization Members')
@Controller('organizations/:orgId/members')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: 'List organization members' })
  async list(
    @Tenant() ctx: TenantContext,
    @Query('role') role?: OrgRole,
    @Query('status') status?: string,
    @Query('search') search?: string
  ) {
    return this.membersService.findAll(ctx.orgId, {
      ...(role !== undefined && { role }),
      ...(status !== undefined && { status }),
      ...(search !== undefined && { search }),
    });
  }

  @Patch(':memberId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update member role' })
  async updateRole(
    @Tenant() ctx: TenantContext,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto
  ) {
    return this.membersService.updateRole(ctx.orgId, memberId, dto.role, ctx.role);
  }

  @Delete(':memberId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Remove member from organization' })
  async remove(@Tenant() ctx: TenantContext, @Param('memberId') memberId: string) {
    return this.membersService.remove(ctx.orgId, memberId, ctx.role);
  }
}
