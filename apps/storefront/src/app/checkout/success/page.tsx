'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Calendar, CheckCircle, Loader2, Mail, Ticket } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useStorefront } from '@/lib/storefront-context';
import { verifyCheckoutSession } from '@/lib/api';

interface VerifiedOrder {
  orderNumber: string;
  customerEmail: string;
  tickets: Array<{
    id: string;
    ticketNumber: string;
    barcode: string;
  }>;
}

export default function CheckoutSuccessPage() {
  const storefront = useStorefront();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const hasBackgroundImage = !!storefront.settings.theme.backgroundImageUrl;

  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedOrder, setVerifiedOrder] = useState<VerifiedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyOrder() {
      if (!sessionId) {
        // Try to get order info from sessionStorage
        const storedOrder = sessionStorage.getItem(`order-${storefront.attraction.slug}`);
        if (storedOrder) {
          try {
            const parsed = JSON.parse(storedOrder);
            // If we have a stored session ID, use that
            if (parsed.sessionId) {
              const result = await verifyCheckoutSession(storefront.attraction.slug, parsed.sessionId);
              if (result.success) {
                setVerifiedOrder({
                  orderNumber: result.order.orderNumber,
                  customerEmail: result.order.customerEmail,
                  tickets: result.order.tickets,
                });
              }
            }
          } catch {
            // Failed to verify from stored session
          }
        }
        setIsVerifying(false);
        return;
      }

      try {
        const result = await verifyCheckoutSession(storefront.attraction.slug, sessionId);
        if (result.success) {
          setVerifiedOrder({
            orderNumber: result.order.orderNumber,
            customerEmail: result.order.customerEmail,
            tickets: result.order.tickets,
          });
          // Clear the cart after successful purchase
          sessionStorage.removeItem(`cart-${storefront.attraction.slug}`);
          sessionStorage.removeItem(`order-${storefront.attraction.slug}`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to verify payment';
        setError(message);
      } finally {
        setIsVerifying(false);
      }
    }

    verifyOrder();
  }, [sessionId, storefront.attraction.slug]);

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-storefront-primary mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                <AlertCircle className="h-10 w-10 text-yellow-500" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Payment Processing</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                We&apos;re having trouble confirming your payment
              </p>
            </div>

            <div className={`rounded-xl border border-border p-6 mb-6 ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}>
              <p className="text-center text-muted-foreground">{error}</p>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                If your payment was successful, you should receive a confirmation email shortly. If
                you don&apos;t receive an email within a few minutes, please contact support.
              </p>
            </div>

            <div className="flex justify-center">
              <Link
                href="/tickets"
                className={`rounded-lg border border-border px-6 py-3 font-semibold hover:bg-muted transition-colors ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}
              >
                Return to Tickets
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          {/* Success Message */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-heading font-bold">Thank You!</h1>
            <p className="mt-2 text-lg text-muted-foreground">Your order has been confirmed</p>
          </div>

          {/* Order Info Card */}
          <div className={`rounded-xl border border-border p-6 mb-6 ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}>
            <h2 className="text-lg font-heading font-bold mb-1">Order Confirmation</h2>
            <p className="text-sm text-muted-foreground mb-4">{storefront.attraction.name}</p>

            <div className="space-y-4">
              {verifiedOrder?.orderNumber && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono text-2xl font-bold">{verifiedOrder.orderNumber}</p>
                </div>
              )}

              {verifiedOrder?.customerEmail && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Confirmation sent to</p>
                  <p className="font-medium">{verifiedOrder.customerEmail}</p>
                </div>
              )}

              {verifiedOrder?.tickets && verifiedOrder.tickets.length > 0 && (
                <div className="rounded-lg border border-border p-4">
                  <p className="mb-2 font-medium">Your Tickets ({verifiedOrder.tickets.length})</p>
                  <div className="space-y-2">
                    {verifiedOrder.tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-mono">{ticket.ticketNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Check Your Email</p>
                    <p className="text-sm text-muted-foreground">
                      Your tickets and order details have been sent to your email address
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <Ticket className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Digital Tickets</p>
                    <p className="text-sm text-muted-foreground">
                      Show the QR code from your email at the entrance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className={`rounded-xl border border-border p-6 mb-6 ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}>
            <h2 className="flex items-center gap-2 text-lg font-heading font-bold mb-4">
              <Calendar className="h-5 w-5" />
              What&apos;s Next?
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-storefront-primary text-xs font-bold text-white">
                  1
                </span>
                <span>Check your email for your tickets and order confirmation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-storefront-primary text-xs font-bold text-white">
                  2
                </span>
                <span>Save or print your tickets for entry</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-storefront-primary text-xs font-bold text-white">
                  3
                </span>
                <span>
                  Arrive at {storefront.attraction.name} and present your tickets at the entrance
                </span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <Link
              href="/tickets"
              className={`rounded-lg border border-border px-6 py-3 font-semibold hover:bg-muted transition-colors ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}
            >
              Buy More Tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
