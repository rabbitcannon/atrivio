import { getPublicStorefront, getPublicTicketTypes, type PublicTicketType } from '@/lib/api';
import { notFound } from 'next/navigation';
import { StorefrontTickets } from './_components/storefront-tickets';
import { FindUsCard } from './_components/find-us-card';

interface StorefrontPageProps {
  params: Promise<{ identifier: string }>;
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { identifier } = await params;

  const [storefrontResponse, ticketsResponse] = await Promise.all([
    getPublicStorefront(identifier),
    getPublicTicketTypes(identifier),
  ]);

  if (storefrontResponse.error || !storefrontResponse.data) {
    notFound();
  }

  if (ticketsResponse.error || !ticketsResponse.data) {
    notFound();
  }

  const storefront = storefrontResponse.data;
  const ticketTypes = ticketsResponse.data.ticketTypes;
  const availableTickets = ticketTypes.filter((t: PublicTicketType) => t.isAvailable);

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Buy Tickets</h2>
          <p className="mt-2 text-muted-foreground">
            Select your tickets below and proceed to checkout
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {availableTickets.length === 0 ? (
              <div className="rounded-lg border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  No tickets are currently available for purchase.
                </p>
              </div>
            ) : (
              <StorefrontTickets
                identifier={identifier}
                ticketTypes={availableTickets}
                attractionName={storefront.attraction.name}
              />
            )}
          </div>

          {/* Sidebar with Find Us card */}
          <div className="space-y-6">
            <FindUsCard
              contact={storefront.contact}
              attractionName={storefront.attraction.name}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {storefront.attraction.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
