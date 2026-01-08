import { Check, Ticket } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getPublicStorefront, getPublicTicketTypes, type StorefrontTicketType } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Buy Tickets',
  description: 'Purchase tickets for your haunted attraction experience',
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function TicketCard({ ticket, isPopular }: { ticket: StorefrontTicketType; isPopular?: boolean }) {
  return (
    <div
      className={`relative flex flex-col rounded-xl border ${isPopular ? 'border-2 border-storefront-primary' : 'border-border'} bg-card overflow-hidden`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-storefront-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          POPULAR
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-heading font-bold mb-2">{ticket.name}</h3>
        {ticket.description && (
          <p className="text-muted-foreground text-sm mb-4">{ticket.description}</p>
        )}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold">{formatPrice(ticket.price)}</span>
          {ticket.comparePrice && ticket.comparePrice > ticket.price && (
            <span className="text-muted-foreground line-through text-lg">
              {formatPrice(ticket.comparePrice)}
            </span>
          )}
          <span className="text-muted-foreground">/person</span>
        </div>
        {ticket.includes && ticket.includes.length > 0 && (
          <ul className="space-y-2 mb-6">
            {ticket.includes.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-storefront-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
        {ticket.category && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Ticket className="h-3 w-3" />
            {ticket.category}
          </div>
        )}
      </div>
      <div className="mt-auto p-6 pt-0">
        <button
          type="button"
          disabled={!ticket.isAvailable}
          className={`w-full rounded-lg px-4 py-3 font-semibold transition-opacity ${
            ticket.isAvailable
              ? 'bg-storefront-primary text-white hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {ticket.isAvailable ? 'Select Tickets' : 'Sold Out'}
        </button>
      </div>
    </div>
  );
}

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

  // Mark the second ticket as "popular" if there are multiple
  const popularIndex = ticketTypes.length > 1 ? 1 : -1;

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">Buy Tickets</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your experience and secure your spot at {attraction.name}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {ticketTypes.map((ticket, index) => (
            <TicketCard key={ticket.id} ticket={ticket} isPopular={index === popularIndex} />
          ))}
        </div>
      </div>
    </div>
  );
}
