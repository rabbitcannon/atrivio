import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getPublicStorefront, getPublicTicketTypes } from '@/lib/api';
import { TicketSelector } from '@/components/tickets/ticket-selector';

export const metadata: Metadata = {
  title: 'Buy Tickets',
  description: 'Purchase tickets for your haunted attraction experience',
};

export default async function TicketsPage() {
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');

  if (!identifier) return null;

  const [storefront, ticketData] = await Promise.all([
    getPublicStorefront(identifier),
    getPublicTicketTypes(identifier),
  ]);

  if (!storefront) return null;

  const { attraction } = storefront;
  const { ticketTypes } = ticketData;

  // If no ticket types, show a message
  if (ticketTypes.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">Buy Tickets</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Tickets for {attraction.name} will be available soon.
            </p>
            <p className="text-muted-foreground text-sm">
              Please check back later or visit our box office for more information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">Buy Tickets</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your experience and secure your spot at {attraction.name}
          </p>
        </div>

        <TicketSelector ticketTypes={ticketTypes} />
      </div>
    </div>
  );
}
