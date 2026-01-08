import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/auth/decorators/public.decorator.js';
import type { PublicJoinQueueDto } from './dto/queue.dto.js';
import { QueueService } from './queue.service.js';

@ApiTags('Virtual Queue (Public)')
@Controller('attractions/:attractionSlug/queue')
@Public()
export class QueuePublicController {
  constructor(private queueService: QueueService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get queue info (no auth)' })
  async getQueueInfo(@Param('attractionSlug') attractionSlug: string) {
    return this.queueService.getPublicQueueInfo(attractionSlug);
  }

  @Post('join')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Join the virtual queue' })
  async joinQueue(
    @Param('attractionSlug') attractionSlug: string,
    @Body() dto: PublicJoinQueueDto
  ) {
    return this.queueService.publicJoinQueue(attractionSlug, dto);
  }

  @Get('status/:confirmationCode')
  @ApiOperation({ summary: 'Check queue position by confirmation code' })
  async checkStatus(@Param('confirmationCode') confirmationCode: string) {
    return this.queueService.getPublicPositionInfo(confirmationCode);
  }

  @Delete(':confirmationCode')
  @HttpCode(200)
  @ApiOperation({ summary: 'Leave the queue' })
  async leaveQueue(@Param('confirmationCode') confirmationCode: string) {
    return this.queueService.publicLeaveQueue(confirmationCode);
  }
}
