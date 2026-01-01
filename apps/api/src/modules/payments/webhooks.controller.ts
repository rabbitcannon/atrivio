import {
  Controller,
  Post,
  Headers,
  RawBody,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service.js';

@ApiTags('Webhooks')
@Controller('webhooks')
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
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = rawBody.toString('utf8');
    return this.webhooksService.handleWebhook(payload, signature);
  }
}
