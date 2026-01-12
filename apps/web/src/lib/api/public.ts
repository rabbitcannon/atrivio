/**
 * Public API functions for client components
 *
 * These functions don't require authentication and can be safely imported
 * in client components without pulling in server-only dependencies.
 */

const PUBLIC_API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api/v1';

// ============================================================================
// Public Checkout Types
// ============================================================================

export interface CheckoutItem {
  ticketTypeId: string;
  timeSlotId?: string;
  quantity: number;
}

export interface CreateCheckoutSessionRequest {
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  items: CheckoutItem[];
  promoCode?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  checkoutUrl: string;
  sessionId: string;
  orderId: string;
  orderNumber: string;
  total: number;
  platformFee: number;
  currency: string;
}

export interface VerifiedCheckout {
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
}

/** @deprecated Use VerifiedCheckout instead */
export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  waiverAccepted?: boolean;
  customerName?: string;
}

/** @deprecated Use VerifiedCheckout instead */
export interface OrderConfirmation {
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
}

export interface OrderStatus {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  ticketCount: number;
  customerEmail: string;
}

// ============================================================================
// Public Checkout Functions (No Auth Required)
// ============================================================================

/**
 * Create a Stripe Checkout session for ticket purchase (public, no auth required)
 * Returns a checkout URL to redirect the customer to Stripe's hosted checkout
 */
export async function createCheckoutSession(
  identifier: string,
  data: CreateCheckoutSessionRequest
): Promise<CheckoutSession> {
  const response = await fetch(`${PUBLIC_API_URL}/storefronts/${identifier}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Checkout failed' }));
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Verify a Stripe Checkout session and complete the order (public, no auth required)
 * Call this after Stripe redirects back to the success page
 */
export async function verifyCheckoutSession(
  identifier: string,
  sessionId: string
): Promise<VerifiedCheckout> {
  const response = await fetch(
    `${PUBLIC_API_URL}/storefronts/${identifier}/checkout/verify/${sessionId}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Verification failed' }));
    throw new Error(error.message || 'Failed to verify checkout session');
  }

  return response.json();
}

/**
 * @deprecated Use verifyCheckoutSession instead
 */
export async function confirmPayment(
  identifier: string,
  data: ConfirmPaymentRequest
): Promise<OrderConfirmation> {
  const response = await fetch(`${PUBLIC_API_URL}/storefronts/${identifier}/checkout/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Payment confirmation failed' }));
    throw new Error(error.message || 'Failed to confirm payment');
  }

  return response.json();
}

/**
 * Get order status by order ID or payment intent ID (public, no auth required)
 */
export async function getOrderStatus(
  identifier: string,
  orderIdOrPaymentIntent: string
): Promise<OrderStatus> {
  const response = await fetch(
    `${PUBLIC_API_URL}/storefronts/${identifier}/checkout/status/${orderIdOrPaymentIntent}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Order not found' }));
    throw new Error(error.message || 'Failed to get order status');
  }

  return response.json();
}

/**
 * Cancel a pending checkout (public, no auth required)
 */
export async function cancelCheckout(
  identifier: string,
  paymentIntentId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${PUBLIC_API_URL}/storefronts/${identifier}/checkout/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Cancel failed' }));
    throw new Error(error.message || 'Failed to cancel checkout');
  }

  return response.json();
}
