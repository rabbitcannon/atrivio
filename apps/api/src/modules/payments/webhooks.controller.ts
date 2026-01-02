import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { WebhooksService } from './webhooks.service.js';
import { Public } from '../../core/auth/decorators/public.decorator.js';

@ApiTags('Webhooks')
@Controller('webhooks')
@Public() // Webhooks don't use JWT auth - they use signature verification
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  /**
   * Stripe webhook endpoint
   * Note: This endpoint must receive raw body for signature verification
   */
  @Post('stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiExcludeEndpoint() // Don't expose in public docs
  async handleStripeWebhook(
    @Req() request: FastifyRequest,
    @Headers('stripe-signature') signature: string,
  ) {
    // Get raw body from request (enabled via rawBody: true in main.ts)
    const rawBody = (request as FastifyRequest & { rawBody?: Buffer }).rawBody;

    if (!rawBody) {
      throw new BadRequestException({
        code: 'MISSING_RAW_BODY',
        message: 'Raw body is required for webhook signature verification',
      });
    }

    const payload = rawBody.toString('utf8');
    return this.webhooksService.handleWebhook(payload, signature);
  }
}
