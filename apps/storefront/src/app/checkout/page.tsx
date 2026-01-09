'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Loader2, ShoppingCart } from 'lucide-react';
import { useStorefront } from '@/lib/storefront-context';
import { createCheckoutSession } from '@/lib/api';
import { formatCurrency } from '@atrivio/shared/utils/money';

interface CartItem {
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const storefront = useStorefront();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Load cart from sessionStorage
  useEffect(() => {
    const cartData = sessionStorage.getItem(`cart-${storefront.attraction.slug}`);
    if (cartData) {
      try {
        setCart(JSON.parse(cartData));
      } catch {
        // Invalid cart data, redirect back
        router.push('/tickets');
      }
    } else {
      // No cart, redirect back
      router.push('/tickets');
    }
  }, [storefront.attraction.slug, router]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Get the current URL origin for redirect URLs
      const origin = window.location.origin;
      const successUrl = `${origin}/checkout/success`;
      const cancelUrl = `${origin}/checkout`;

      const checkoutData = {
        customerEmail: email,
        items: cart.map((item) => ({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
        })),
        successUrl,
        cancelUrl,
        ...(name && { customerName: name }),
        ...(phone && { customerPhone: phone }),
      };

      const session = await createCheckoutSession(storefront.attraction.slug, checkoutData);

      // Store order info for the success page
      sessionStorage.setItem(
        `order-${storefront.attraction.slug}`,
        JSON.stringify({
          orderNumber: session.orderNumber,
          sessionId: session.sessionId,
        })
      );

      // Redirect to Stripe Checkout
      window.location.href = session.checkoutUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session';
      setError(message);
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Link
              href="/tickets"
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to tickets
            </Link>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl font-heading font-bold mb-6">Your Information</h2>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your tickets will be sent to this email
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex items-start gap-3 pt-4">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-input accent-storefront-primary"
                  />
                  <label htmlFor="terms" className="text-sm leading-tight">
                    I agree to the{' '}
                    <Link href="/terms" className="text-storefront-primary hover:underline">
                      terms and conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/waiver" className="text-storefront-primary hover:underline">
                      liability waiver
                    </Link>
                  </label>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!acceptTerms || isLoading}
                  className="w-full rounded-lg bg-storefront-primary px-4 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting to payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Continue to Payment
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  You will be securely redirected to Stripe to complete your payment
                </p>
              </form>
            </div>
          </div>

          {/* Order Summary - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 text-lg font-heading font-bold mb-4">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </h3>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {storefront.attraction.name}
                  </p>

                  {cart.map((item) => (
                    <div
                      key={item.ticketTypeId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.ticketTypeName}</p>
                        <p className="text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Total ({totalTickets} tickets)</p>
                      <p className="text-xl font-bold">{formatCurrency(cartTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
