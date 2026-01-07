import type { UserId } from '@haunt/shared';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
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
import type {
  StaffQueryDto,
  TerminateStaffDto,
  UpdateAssignmentsDto,
  UpdateStaffDto,
} from './dto/staff.dto.js';
import { StaffService } from './staff.service.js';

@ApiTags('Staff')
@Controller('organizations/:orgId/staff')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'List staff members' })
  async list(@Tenant() ctx: TenantContext, @Query() query: StaffQueryDto) {
    return this.staffService.findAll(ctx.orgId, query);
  }

  @Get(':staffId')
  @ApiOperation({ summary: 'Get staff member details' })
  async findOne(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @CurrentUser('id') userId: UserId
  ) {
    // Allow self or managers to view
    const isSelf = await this.staffService.isSelf(staffId, userId);
    const hasRole = ['owner', 'admin', 'manager', 'hr'].includes(ctx.role);

    if (!isSelf && !hasRole) {
      throw new ForbiddenException({
        code: 'STAFF_FORBIDDEN',
        message: 'No permission to view this staff member',
      });
    }

    return this.staffService.findById(ctx.orgId, staffId, userId);
  }

  @Patch(':staffId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Update staff member' })
  async update(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffDto
  ) {
    return this.staffService.update(ctx.orgId, staffId, dto);
  }

  @Post(':staffId/terminate')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'hr')
  @ApiOperation({ summary: 'Terminate staff member' })
  async terminate(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: TerminateStaffDto
  ) {
    return this.staffService.terminate(ctx.orgId, staffId, dto);
  }

  @Put(':staffId/attractions')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Update attraction assignments' })
  async updateAssignments(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateAssignmentsDto
  ) {
    return this.staffService.updateAssignments(ctx.orgId, staffId, dto);
  }
}
