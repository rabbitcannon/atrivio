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
import type { AuthUser } from '../../core/auth/auth.service.js';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import { Public } from '../../core/auth/decorators/public.decorator.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type { AcceptInvitationDto, CreateInvitationDto } from './dto/invitations.dto.js';
import { InvitationsService } from './invitations.service.js';

@ApiTags('Organization Invitations')
@Controller()
@ApiBearerAuth()
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  // Organization-scoped invitation endpoints

  @Post('organizations/:orgId/invitations')
  @UseInterceptors(TenantInterceptor)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Create invitation' })
  async create(@Tenant() ctx: TenantContext, @Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(ctx.orgId, dto.email, dto.role, ctx.userId, ctx.role);
  }

  @Get('organizations/:orgId/invitations')
  @UseInterceptors(TenantInterceptor)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'List pending invitations' })
  async list(@Tenant() ctx: TenantContext) {
    return this.invitationsService.findAll(ctx.orgId);
  }

  @Delete('organizations/:orgId/invitations/:invitationId')
  @UseInterceptors(TenantInterceptor)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Cancel invitation' })
  async cancel(@Tenant() ctx: TenantContext, @Param('invitationId') invitationId: string) {
    return this.invitationsService.cancel(ctx.orgId, invitationId);
  }

  // Public invitation endpoints

  @Public()
  @Get('invitations/:token')
  @ApiOperation({ summary: 'Get invitation details (public)' })
  async getByToken(@Param('token') token: string) {
    return this.invitationsService.getByToken(token);
  }

  @Post('invitations/accept')
  @ApiOperation({ summary: 'Accept invitation' })
  async accept(@CurrentUser() user: AuthUser, @Body() dto: AcceptInvitationDto) {
    return this.invitationsService.accept(dto.token, user.id as UserId);
  }
}
