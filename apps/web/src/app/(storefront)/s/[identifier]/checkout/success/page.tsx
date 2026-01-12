import { getPublicStorefront, verifyCheckoutSession } from '@/lib/api';
import { notFound } from 'next/navigation';
import { CheckCircle, Ticket, Mail, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface SuccessPageProps {
  params: Promise<{ identifier: string }>;
  searchParams: Promise<{ order?: string; session_id?: string; storefront?: string }>;
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { identifier } = await params;
  const { order: orderNumber, session_id: sessionId, storefront: storefrontParam } = await searchParams;

  // Build URL helper that preserves storefront query param for local dev
  const buildUrl = (path: string) => {
    if (storefrontParam) {
      return `${path}?storefront=${storefrontParam}`;
    }
    return path;
  };

  const ticketsUrl = buildUrl(`/s/${identifier}`);

  const storefrontResponse = await getPublicStorefront(identifier);
  if (storefrontResponse.error || !storefrontResponse.data) {
    notFound();
  }

  const storefront = storefrontResponse.data;

  // If we have a session_id, verify the checkout and complete the order
  let verificationError: string | null = null;
  let verifiedOrder: {
    orderNumber: string;
    customerEmail: string;
    tickets: Array<{ id: string; ticketNumber: string; barcode: string }>;
  } | null = null;

  if (sessionId) {
    try {
      const verification = await verifyCheckoutSession(identifier, sessionId);
      if (verification.success) {
        verifiedOrder = {
          orderNumber: verification.order.orderNumber,
          customerEmail: verification.order.customerEmail,
          tickets: verification.order.tickets,
        };
      }
    } catch (err) {
      verificationError = err instanceof Error ? err.message : 'Failed to verify payment';
    }
  }

  const displayOrderNumber = verifiedOrder?.orderNumber || orderNumber;

  // Show error state if verification failed
  if (verificationError) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              {storefront.attraction.logoUrl && (
                <img
                  src={storefront.attraction.logoUrl}
                  alt={storefront.attraction.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              <h1 className="text-xl font-bold">{storefront.attraction.name}</h1>
            </div>
          </div>
        </header>

        {/* Error Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <AlertCircle className="h-10 w-10 text-yellow-600" />
              </div>
              <h2 className="text-3xl font-bold">Payment Processing</h2>
              <p className="mt-2 text-lg text-muted-foreground">
                We&apos;re having trouble confirming your payment
              </p>
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {verificationError}
                </p>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  If your payment was successful, you should receive a confirmation email shortly.
                  If you don&apos;t receive an email within a few minutes, please contact support.
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="outline">
                <Link href={`${ticketsUrl}`}>Return to Tickets</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {storefront.attraction.logoUrl && (
              <img
                src={storefront.attraction.logoUrl}
                alt={storefront.attraction.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            )}
            <h1 className="text-xl font-bold">{storefront.attraction.name}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Success Message */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold">Thank You!</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Your order has been confirmed
            </p>
          </div>

          {/* Order Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Confirmation</CardTitle>
              <CardDescription>
                {storefront.attraction.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayOrderNumber && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono text-2xl font-bold">{displayOrderNumber}</p>
                </div>
              )}

              {verifiedOrder && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Confirmation sent to</p>
                  <p className="font-medium">{verifiedOrder.customerEmail}</p>
                </div>
              )}

              {verifiedOrder && verifiedOrder.tickets.length > 0 && (
                <div className="rounded-lg border p-4">
                  <p className="mb-2 font-medium">Your Tickets ({verifiedOrder.tickets.length})</p>
                  <div className="space-y-2">
                    {verifiedOrder.tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between text-sm">
                        <span className="font-mono">{ticket.ticketNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Check Your Email</p>
                    <p className="text-sm text-muted-foreground">
                      Your tickets and order details have been sent to your email address
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Ticket className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Digital Tickets</p>
                    <p className="text-sm text-muted-foreground">
                      Show the QR code from your email at the entrance
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                What&apos;s Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    1
                  </span>
                  <span>Check your email for your tickets and order confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    2
                  </span>
                  <span>Save or print your tickets for entry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    3
                  </span>
                  <span>Arrive at {storefront.attraction.name} and present your tickets at the entrance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link href={`${ticketsUrl}`}>Buy More Tickets</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Questions about your order? Contact{' '}
            <a href="#" className="text-primary hover:underline">
              {storefront.attraction.name} support
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
