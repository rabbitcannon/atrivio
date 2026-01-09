import type { OrgId } from '@atrivio/shared';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import { PaymentsService } from '../payments/payments.service.js';
import { OrdersService } from './orders.service.js';
import { TicketingService } from './ticketing.service.js';
import type {
  CreateCheckoutSessionDto,
  ConfirmPaymentDto,
} from './dto/checkout.dto.js';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  private stripe: Stripe;

  constructor(
    private supabase: SupabaseService,
    private ordersService: OrdersService,
    private ticketingService: TicketingService,
    private paymentsService: PaymentsService,
  ) {
    const stripeKey = process.env['STRIPE_SECRET_KEY'];
    if (!stripeKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured - Checkout will fail');
      this.stripe = new Stripe('sk_test_dummy_key_for_initialization');
    } else {
      this.stripe = new Stripe(stripeKey);
    }
  }

  /**
   * Ensure Stripe is configured
   */
  private ensureStripeConfigured(): void {
    if (!process.env['STRIPE_SECRET_KEY']) {
      throw new BadRequestException({
        code: 'STRIPE_NOT_CONFIGURED',
        message: 'Payment processing is not available',
      });
    }
  }

  /**
   * Get attraction and org info from storefront identifier
   */
  private async getAttractionByIdentifier(identifier: string): Promise<{
    id: string;
    org_id: string;
    name: string;
    slug: string;
    status: string;
  }> {
    // First try to find by domain
    const { data: domain } = await this.supabase.adminClient
      .from('storefront_domains')
      .select(`
        attraction_id,
        attraction:attractions(
          id,
          org_id,
          name,
          slug,
          status,
          organization:organizations(
            id,
            name,
            subscription_tier
          )
        )
      `)
      .eq('domain', identifier)
      .eq('is_verified', true)
      .single();

    if (domain?.attraction) {
      const attraction = Array.isArray(domain.attraction)
        ? domain.attraction[0]
        : domain.attraction;
      if (attraction) {
        return attraction;
      }
    }

    // Fall back to attraction slug lookup
    const { data: attraction } = await this.supabase.adminClient
      .from('attractions')
      .select(`
        id,
        org_id,
        name,
        slug,
        status,
        organization:organizations(
          id,
          name,
          subscription_tier
        )
      `)
      .eq('slug', identifier)
      .eq('status', 'active')
      .single();

    if (!attraction) {
      throw new NotFoundException({
        code: 'ATTRACTION_NOT_FOUND',
        message: 'Attraction not found',
      });
    }

    return attraction;
  }

  /**
   * Get the Stripe connected account for an organization
   */
  private async getStripeAccount(orgId: OrgId): Promise<string> {
    const { data: account, error } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('stripe_account_id, status, charges_enabled')
      .eq('org_id', orgId)
      .single();

    if (error || !account) {
      throw new BadRequestException({
        code: 'PAYMENT_NOT_CONFIGURED',
        message: 'This attraction is not set up to accept payments',
      });
    }

    if (account.status !== 'active' || !account.charges_enabled) {
      throw new BadRequestException({
        code: 'PAYMENT_NOT_ENABLED',
        message: 'Payment processing is not enabled for this attraction',
      });
    }

    return account.stripe_account_id;
  }

  /**
   * Create a Stripe Checkout Session for ticket purchases
   * This redirects users to Stripe's hosted checkout page
   */
  async createCheckoutSession(
    identifier: string,
    dto: CreateCheckoutSessionDto,
  ): Promise<{
    checkoutUrl: string;
    sessionId: string;
    orderId: string;
    orderNumber: string;
    total: number;
    platformFee: number;
    currency: string;
  }> {
    this.ensureStripeConfigured();

    // Get attraction and org info
    const attraction = await this.getAttractionByIdentifier(identifier);
    const orgId = attraction.org_id as OrgId;

    // Get the connected Stripe account
    const stripeAccountId = await this.getStripeAccount(orgId);

    // Create the order first (in pending status)
    const order = await this.ordersService.createOrder(orgId, {
      attractionId: attraction.id,
      customerEmail: dto.customerEmail,
      ...(dto.customerName && { customerName: dto.customerName }),
      ...(dto.customerPhone && { customerPhone: dto.customerPhone }),
      items: dto.items,
      ...(dto.promoCode && { promoCode: dto.promoCode }),
      ...(dto.sourceId && { sourceId: dto.sourceId }),
    });

    // Calculate the tier-based platform fee
    const platformFee = await this.paymentsService.calculatePlatformFee(orgId, order.total);

    this.logger.log(
      `Creating Stripe Checkout for order ${order.order_number}: amount=${order.total}, platformFee=${platformFee}`,
    );

    // Get ticket type details for line items
    const ticketTypeIds = dto.items.map((item) => item.ticketTypeId);
    const { data: ticketTypes } = await this.supabase.adminClient
      .from('ticket_types')
      .select('id, name, description, price')
      .in('id', ticketTypeIds);

    if (!ticketTypes || ticketTypes.length === 0) {
      throw new BadRequestException({
        code: 'INVALID_TICKET_TYPES',
        message: 'One or more ticket types not found',
      });
    }

    // Build line items for Stripe Checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = dto.items.map((item) => {
      const ticketType = ticketTypes.find((t) => t.id === item.ticketTypeId);
      if (!ticketType) {
        throw new BadRequestException({
          code: 'INVALID_TICKET_TYPE',
          message: `Ticket type ${item.ticketTypeId} not found`,
        });
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: ticketType.name,
            description: ticketType.description || `Ticket for ${attraction.name}`,
          },
          unit_amount: ticketType.price, // Price is already in cents
        },
        quantity: item.quantity,
      };
    });

    // Build success URL with order number
    const successUrl = `${dto.successUrl}?order=${order.order_number}&session_id={CHECKOUT_SESSION_ID}`;

    // Create Stripe Checkout Session
    let session: Stripe.Checkout.Session;
    try {
      session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: dto.customerEmail,
        line_items: lineItems,
        success_url: successUrl,
        cancel_url: dto.cancelUrl,
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: {
            destination: stripeAccountId,
          },
          metadata: {
            org_id: orgId,
            attraction_id: attraction.id,
            order_id: order.id,
            order_number: order.order_number,
          },
        },
        metadata: {
          org_id: orgId,
          attraction_id: attraction.id,
          order_id: order.id,
          order_number: order.order_number,
          customer_email: dto.customerEmail,
          customer_name: dto.customerName || '',
          customer_phone: dto.customerPhone || '',
        },
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minute expiry
      });

      this.logger.log(
        `Created Stripe Checkout Session ${session.id} for order ${order.order_number}`,
      );
    } catch (err) {
      // If Checkout Session creation fails, cancel the order
      await this.supabase.adminClient
        .from('orders')
        .update({ status: 'canceled', notes: 'Payment initialization failed' })
        .eq('id', order.id);

      const message = err instanceof Error ? err.message : 'Unknown Stripe error';
      this.logger.error(`Failed to create Checkout Session: ${message}`);
      throw new BadRequestException({
        code: 'PAYMENT_INIT_FAILED',
        message: 'Failed to initialize payment. Please try again.',
      });
    }

    // Update order with checkout session ID
    await this.supabase.adminClient
      .from('orders')
      .update({
        stripe_checkout_session_id: session.id,
        status: 'processing',
      })
      .eq('id', order.id);

    return {
      checkoutUrl: session.url!,
      sessionId: session.id,
      orderId: order.id,
      orderNumber: order.order_number,
      total: order.total,
      platformFee,
      currency: 'usd',
    };
  }

  /**
   * Verify checkout session was successful and complete the order
   * Called after Stripe redirects back to success page
   */
  async verifyCheckoutSession(
    identifier: string,
    sessionId: string,
  ): Promise<{
    success: boolean;
    order: {
      id: string;
      orderNumber: string;
      status: string;
      customerEmail: string;
      tickets: Array<{
        id: string;
        ticketNumber: string;
        barcode: string;
      }>;
    };
  }> {
    this.ensureStripeConfigured();

    // Get attraction info
    const attraction = await this.getAttractionByIdentifier(identifier);
    const orgId = attraction.org_id as OrgId;

    // Find the order by checkout session ID
    const { data: order, error } = await this.supabase.adminClient
      .from('orders')
      .select('id, order_number, status, stripe_checkout_session_id, customer_email')
      .eq('stripe_checkout_session_id', sessionId)
      .eq('org_id', orgId)
      .single();

    if (error || !order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found for this checkout session',
      });
    }

    // Verify checkout session status with Stripe
    let session: Stripe.Checkout.Session;
    try {
      session = await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to retrieve Checkout Session: ${message}`);
      throw new BadRequestException({
        code: 'SESSION_VERIFICATION_FAILED',
        message: 'Could not verify checkout session status',
      });
    }

    if (session.payment_status !== 'paid') {
      throw new BadRequestException({
        code: 'PAYMENT_NOT_COMPLETE',
        message: `Payment status is ${session.payment_status}. Payment must be completed.`,
      });
    }

    // If order is already completed, just return the order info
    if (order.status === 'completed') {
      const completedOrder = await this.ordersService.getOrder(orgId, order.id);
      return {
        success: true,
        order: {
          id: completedOrder.id,
          orderNumber: completedOrder.order_number,
          status: completedOrder.status,
          customerEmail: completedOrder.customer_email,
          tickets: (completedOrder.tickets || []).map((t: { id: string; ticket_number: string; barcode: string }) => ({
            id: t.id,
            ticketNumber: t.ticket_number,
            barcode: t.barcode,
          })),
        },
      };
    }

    // Update order with payment intent ID from the session
    if (session.payment_intent) {
      await this.supabase.adminClient
        .from('orders')
        .update({ stripe_payment_intent_id: session.payment_intent as string })
        .eq('id', order.id);
    }

    // Complete the order (generates tickets)
    const completedOrder = await this.ordersService.completeOrder(orgId, order.id);

    // Auto-create waiver record for checkout purchases
    const { data: attractionData } = await this.supabase.adminClient
      .from('attractions')
      .select('waiver_text')
      .eq('id', attraction.id)
      .single();

    const waiverText =
      attractionData?.waiver_text ||
      'By purchasing these tickets, I acknowledge and agree to the standard liability waiver and release of claims.';

    await this.supabase.adminClient.from('ticket_waivers').insert({
      org_id: orgId,
      order_id: order.id,
      customer_email: session.customer_email || order.customer_email,
      customer_name: session.metadata?.['customer_name'] || null,
      waiver_text: waiverText,
      accepted_at: new Date().toISOString(),
      ip_address: null,
    });

    this.logger.log(`Order ${completedOrder.order_number} completed successfully via Stripe Checkout`);

    return {
      success: true,
      order: {
        id: completedOrder.id,
        orderNumber: completedOrder.order_number,
        status: completedOrder.status,
        customerEmail: completedOrder.customer_email,
        tickets: (completedOrder.tickets || []).map((t: { id: string; ticket_number: string; barcode: string }) => ({
          id: t.id,
          ticketNumber: t.ticket_number,
          barcode: t.barcode,
        })),
      },
    };
  }

  /**
   * Confirm payment was successful and complete the order (legacy - for PaymentIntent flow)
   * @deprecated Use verifyCheckoutSession instead
   */
  async confirmPayment(
    identifier: string,
    dto: ConfirmPaymentDto,
  ): Promise<{
    success: boolean;
    order: {
      id: string;
      orderNumber: string;
      status: string;
      tickets: Array<{
        id: string;
        ticketNumber: string;
        barcode: string;
      }>;
    };
  }> {
    this.ensureStripeConfigured();

    // Get attraction info
    const attraction = await this.getAttractionByIdentifier(identifier);
    const orgId = attraction.org_id as OrgId;

    // Find the order by payment intent ID
    const { data: order, error } = await this.supabase.adminClient
      .from('orders')
      .select('id, order_number, status, stripe_payment_intent_id')
      .eq('stripe_payment_intent_id', dto.paymentIntentId)
      .eq('org_id', orgId)
      .single();

    if (error || !order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found for this payment',
      });
    }

    // Verify payment status with Stripe
    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await this.stripe.paymentIntents.retrieve(dto.paymentIntentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to retrieve PaymentIntent: ${message}`);
      throw new BadRequestException({
        code: 'PAYMENT_VERIFICATION_FAILED',
        message: 'Could not verify payment status',
      });
    }

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException({
        code: 'PAYMENT_NOT_COMPLETE',
        message: `Payment status is ${paymentIntent.status}. Payment must be completed.`,
      });
    }

    // If order is already completed, just return the order info
    if (order.status === 'completed') {
      const completedOrder = await this.ordersService.getOrder(orgId, order.id);
      return {
        success: true,
        order: {
          id: completedOrder.id,
          orderNumber: completedOrder.order_number,
          status: completedOrder.status,
          tickets: (completedOrder.tickets || []).map((t: { id: string; ticket_number: string; barcode: string }) => ({
            id: t.id,
            ticketNumber: t.ticket_number,
            barcode: t.barcode,
          })),
        },
      };
    }

    // Complete the order (generates tickets)
    const completedOrder = await this.ordersService.completeOrder(orgId, order.id);

    // Handle waiver if customer accepted it
    if (dto.waiverAccepted) {
      const { data: attractionData } = await this.supabase.adminClient
        .from('attractions')
        .select('waiver_text')
        .eq('id', attraction.id)
        .single();

      const waiverText =
        attractionData?.waiver_text ||
        'By purchasing these tickets, I acknowledge and agree to the standard liability waiver and release of claims.';

      await this.supabase.adminClient.from('ticket_waivers').insert({
        org_id: orgId,
        order_id: order.id,
        customer_email: paymentIntent.receipt_email || paymentIntent.metadata?.['customer_email'],
        customer_name: dto.customerName,
        waiver_text: waiverText,
        accepted_at: new Date().toISOString(),
        ip_address: null,
      });
    }

    this.logger.log(`Order ${completedOrder.order_number} completed successfully`);

    return {
      success: true,
      order: {
        id: completedOrder.id,
        orderNumber: completedOrder.order_number,
        status: completedOrder.status,
        tickets: (completedOrder.tickets || []).map((t: { id: string; ticket_number: string; barcode: string }) => ({
          id: t.id,
          ticketNumber: t.ticket_number,
          barcode: t.barcode,
        })),
      },
    };
  }

  /**
   * Get order status by order ID or payment intent ID
   * Used by frontend to poll for order status
   */
  async getOrderStatus(
    identifier: string,
    orderIdOrPaymentIntent: string,
  ): Promise<{
    orderId: string;
    orderNumber: string;
    status: string;
    total: number;
    ticketCount: number;
    customerEmail: string;
  }> {
    const attraction = await this.getAttractionByIdentifier(identifier);
    const orgId = attraction.org_id as OrgId;

    // Try to find by order ID first, then by payment intent ID
    let order;
    const { data: byId } = await this.supabase.adminClient
      .from('orders')
      .select('id, order_number, status, total, customer_email')
      .eq('id', orderIdOrPaymentIntent)
      .eq('org_id', orgId)
      .single();

    if (byId) {
      order = byId;
    } else {
      const { data: byPaymentIntent } = await this.supabase.adminClient
        .from('orders')
        .select('id, order_number, status, total, customer_email')
        .eq('stripe_payment_intent_id', orderIdOrPaymentIntent)
        .eq('org_id', orgId)
        .single();
      order = byPaymentIntent;
    }

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      });
    }

    // Get ticket count
    const { count } = await this.supabase.adminClient
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('order_id', order.id);

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      status: order.status,
      total: order.total,
      ticketCount: count || 0,
      customerEmail: order.customer_email,
    };
  }

  /**
   * Cancel a pending payment/order
   */
  async cancelCheckout(
    identifier: string,
    paymentIntentId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.ensureStripeConfigured();

    const attraction = await this.getAttractionByIdentifier(identifier);
    const orgId = attraction.org_id as OrgId;

    // Find the order
    const { data: order } = await this.supabase.adminClient
      .from('orders')
      .select('id, status')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .eq('org_id', orgId)
      .single();

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      });
    }

    if (order.status === 'completed') {
      throw new BadRequestException({
        code: 'ORDER_ALREADY_COMPLETED',
        message: 'Cannot cancel a completed order',
      });
    }

    // Cancel the PaymentIntent in Stripe
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch (err) {
      // PaymentIntent might already be canceled or succeeded
      this.logger.warn(`Could not cancel PaymentIntent: ${err}`);
    }

    // Update order status
    await this.supabase.adminClient
      .from('orders')
      .update({ status: 'canceled', notes: 'Checkout canceled by customer' })
      .eq('id', order.id);

    return {
      success: true,
      message: 'Checkout canceled successfully',
    };
  }
}
