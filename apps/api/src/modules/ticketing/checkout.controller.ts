import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/auth/decorators/public.decorator.js';
import { CheckoutService } from './checkout.service.js';
import type {
  CancelCheckoutDto,
  ConfirmPaymentDto,
  CreateCheckoutSessionDto,
} from './dto/checkout.dto.js';

/**
 * Public checkout controller for ticket purchases.
 * All endpoints are public (no auth required) since customers purchasing
 * tickets don't have accounts.
 *
 * The :identifier can be either:
 * - A verified custom domain (e.g., tickets.myhaunt.com)
 * - An attraction slug (e.g., haunted-mansion)
 */
@ApiTags('Checkout (Public)')
@Controller('storefronts/:identifier/checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  /**
   * Create a Stripe Checkout session and redirect URL.
   * This creates a pending order and returns a URL to redirect
   * the customer to Stripe's hosted checkout page.
   */
  @Post()
  @Public()
  @ApiOperation({
    summary: 'Create Stripe Checkout session',
    description: 'Creates an order and returns Stripe Checkout URL for redirect',
  })
  async createCheckoutSession(
    @Param('identifier') identifier: string,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.checkoutService.createCheckoutSession(identifier, dto);
  }

  /**
   * Verify a Stripe Checkout session and complete the order.
   * This should be called after Stripe redirects back to the success page.
   * Generates tickets and sends confirmation email.
   */
  @Get('verify/:sessionId')
  @Public()
  @ApiOperation({
    summary: 'Verify checkout session and complete order',
    description: 'Verifies Stripe Checkout session and generates tickets',
  })
  async verifyCheckoutSession(
    @Param('identifier') identifier: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.checkoutService.verifyCheckoutSession(identifier, sessionId);
  }

  /**
   * Confirm that payment was successful and complete the order (legacy).
   * @deprecated Use verifyCheckoutSession instead
   */
  @Post('confirm')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Confirm payment and complete order (legacy)',
    description: 'Legacy: Verifies PaymentIntent and generates tickets',
  })
  async confirmPayment(
    @Param('identifier') identifier: string,
    @Body() dto: ConfirmPaymentDto,
  ) {
    return this.checkoutService.confirmPayment(identifier, dto);
  }

  /**
   * Get the status of an order.
   * Can be queried by order ID or payment intent ID.
   */
  @Get('status/:orderIdOrPaymentIntent')
  @Public()
  @ApiOperation({
    summary: 'Get order status',
    description: 'Check the status of an order by order ID or payment intent ID',
  })
  async getOrderStatus(
    @Param('identifier') identifier: string,
    @Param('orderIdOrPaymentIntent') orderIdOrPaymentIntent: string,
  ) {
    return this.checkoutService.getOrderStatus(identifier, orderIdOrPaymentIntent);
  }

  /**
   * Cancel a pending checkout/order.
   * Only works for orders that haven't been completed yet.
   */
  @Post('cancel')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cancel checkout',
    description: 'Cancel a pending payment and order',
  })
  async cancelCheckout(
    @Param('identifier') identifier: string,
    @Body() dto: CancelCheckoutDto,
  ) {
    return this.checkoutService.cancelCheckout(identifier, dto.paymentIntentId);
  }
}
