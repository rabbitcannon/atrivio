import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QueueService } from './queue.service.js';
import { PublicJoinQueueDto } from './dto/queue.dto.js';
import { Public } from '../../core/auth/decorators/public.decorator.js';

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
    @Body() dto: PublicJoinQueueDto,
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
