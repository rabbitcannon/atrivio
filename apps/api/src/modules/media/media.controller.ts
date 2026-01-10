import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Feature } from '../../core/features/decorators/feature.decorator.js';
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { MediaService } from './media.service.js';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('organizations/:orgId/media')
@UseInterceptors(TenantInterceptor)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(FeatureGuard, RolesGuard)
  @Feature('media_uploads')
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async upload(
    @Tenant() tenant: TenantContext,
    @Req() request: FastifyRequest,
  ) {
    // Get multipart file from Fastify request
    const data = await request.file();

    if (!data) {
      throw new BadRequestException('No file uploaded');
    }

    // Read file buffer
    const buffer = await data.toBuffer();

    return this.mediaService.upload(tenant.orgId, tenant.userId, {
      buffer,
      originalname: data.filename,
      mimetype: data.mimetype,
      size: buffer.length,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List media files' })
  async list(
    @Tenant() tenant: TenantContext,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.mediaService.list(
      tenant.orgId,
      parseInt(page, 10),
      Math.min(parseInt(limit, 10), 100),
    );
  }

  @Get('storage')
  @ApiOperation({ summary: 'Get storage usage' })
  async getStorageUsage(@Tenant() tenant: TenantContext) {
    return this.mediaService.getStorageUsage(tenant.orgId);
  }

  @Get(':mediaId')
  @ApiOperation({ summary: 'Get a media file' })
  async findById(
    @Tenant() tenant: TenantContext,
    @Param('mediaId') mediaId: string,
  ) {
    return this.mediaService.findById(tenant.orgId, mediaId);
  }

  @Delete(':mediaId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Delete a media file' })
  async delete(
    @Tenant() tenant: TenantContext,
    @Param('mediaId') mediaId: string,
  ) {
    await this.mediaService.delete(tenant.orgId, mediaId);
    return { success: true };
  }
}
