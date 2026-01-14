'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, ShoppingCart, CreditCard, Lock, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { createCheckoutSession } from '@/lib/api/public';
import { formatCurrency } from '@atrivio/shared/utils/money';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

interface CartItem {
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  quantity: number;
}

interface CheckoutFormProps {
  identifier: string;
  attractionName: string;
}

export function CheckoutForm({ identifier, attractionName }: CheckoutFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Build URL helper that preserves storefront query param for local dev
  const buildUrl = (path: string) => {
    const storefrontParam = searchParams.get('storefront');
    if (storefrontParam) {
      return `${path}?storefront=${storefrontParam}`;
    }
    return path;
  };

  // Get the tickets URL (main storefront page)
  const ticketsUrl = buildUrl(`/s/${identifier}`);

  // Load cart from sessionStorage
  useEffect(() => {
    const cartData = sessionStorage.getItem(`cart-${identifier}`);
    if (cartData) {
      try {
        setCart(JSON.parse(cartData));
      } catch {
        // Invalid cart data, redirect back
        router.push(ticketsUrl);
      }
    } else {
      // No cart, redirect back
      router.push(ticketsUrl);
    }
  }, [identifier, router, ticketsUrl]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Get the current URL origin for redirect URLs
      const origin = window.location.origin;
      const storefrontParam = searchParams.get('storefront');
      const queryString = storefrontParam ? `?storefront=${storefrontParam}` : '';
      const successUrl = `${origin}/s/${identifier}/checkout/success${queryString}`;
      const cancelUrl = `${origin}/s/${identifier}/checkout${queryString}`;

      const session = await createCheckoutSession(identifier, {
        customerEmail: email,
        customerName: name || undefined,
        customerPhone: phone || undefined,
        items: cart.map((item) => ({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
        })),
        successUrl,
        cancelUrl,
      });

      // Store order info for the success page
      sessionStorage.setItem(
        `order-${identifier}`,
        JSON.stringify({
          orderNumber: session.orderNumber,
          sessionId: session.sessionId,
        })
      );

      // Redirect to Stripe Checkout
      window.location.href = session.checkoutUrl;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create checkout session';
      setError(message);
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const MotionDiv = shouldReduceMotion ? 'div' : motion.div;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Checkout Form */}
      <MotionDiv
        className="lg:col-span-2"
        {...(!shouldReduceMotion && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: EASE },
        })}
      >
        <Link
          href={ticketsUrl}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  Your tickets will be sent to this email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                />
                <label htmlFor="terms" className="text-sm leading-tight">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">
                    terms and conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    liability waiver
                  </a>
                </label>
              </div>

              {error && (
                <MotionDiv
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                  {...(!shouldReduceMotion && {
                    initial: { opacity: 0, scale: 0.95 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { duration: 0.2 },
                  })}
                >
                  {error}
                </MotionDiv>
              )}

              <Button
                type="submit"
                className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
                disabled={!acceptTerms || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting to payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Continue to Payment • {formatCurrency(cartTotal)}
                  </>
                )}
              </Button>

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Secure Checkout</span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Powered by <span className="font-medium">Stripe</span> • Your payment information is never stored on our servers
              </p>
            </form>
          </CardContent>
        </Card>
      </MotionDiv>

      {/* Order Summary - Sticky */}
      <div className="lg:col-span-1">
        <MotionDiv
          className="sticky top-4"
          {...(!shouldReduceMotion && {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.4, ease: EASE, delay: 0.1 },
          })}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {attractionName}
                </p>

                {cart.map((item, index) => (
                  <MotionDiv
                    key={item.ticketTypeId}
                    className="flex items-center justify-between text-sm"
                    {...(!shouldReduceMotion && {
                      initial: { opacity: 0, y: 10 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.3, delay: 0.2 + index * 0.05, ease: EASE },
                    })}
                  >
                    <div>
                      <p className="font-medium">{item.ticketTypeName}</p>
                      <p className="text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </MotionDiv>
                ))}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Total ({totalTickets} tickets)</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(cartTotal)}</p>
                  </div>
                </div>

                {/* Urgency indicator */}
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-700 dark:text-amber-500">
                    Tickets are reserved for 10 minutes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}
