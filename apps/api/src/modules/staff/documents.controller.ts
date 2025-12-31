import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DocumentsService } from './documents.service.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';

@ApiTags('Staff Documents')
@Controller('organizations/:orgId/staff/:staffId/documents')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List staff documents' })
  async list(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
  ) {
    return this.documentsService.findAll(ctx.orgId, staffId);
  }

  @Post('upload-url')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Get signed upload URL' })
  @ApiQuery({ name: 'fileName', required: true })
  @ApiQuery({ name: 'contentType', required: true })
  async getUploadUrl(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Query('fileName') fileName: string,
    @Query('contentType') contentType: string,
  ) {
    return this.documentsService.getUploadUrl(ctx.orgId, staffId, fileName, contentType);
  }

  @Delete(':docId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'hr')
  @ApiOperation({ summary: 'Delete document' })
  async delete(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Param('docId') docId: string,
  ) {
    return this.documentsService.delete(ctx.orgId, staffId, docId);
  }
}
