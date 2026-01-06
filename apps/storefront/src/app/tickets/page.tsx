import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Ticket, Clock, Users, Star } from 'lucide-react';
import { getPublicStorefront } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Buy Tickets',
  description: 'Purchase tickets for your haunted attraction experience',
};

export default async function TicketsPage() {
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');

  if (!identifier) return null;

  const storefront = await getPublicStorefront(identifier);
  if (!storefront) return null;

  const { attraction } = storefront;

  // TODO: Integrate with ticketing API to fetch actual ticket types
  // For now, show a placeholder

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">Buy Tickets</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your experience and secure your spot at {attraction.name}
          </p>
        </div>

        {/* Ticket Types Placeholder */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {/* General Admission */}
          <div className="relative flex flex-col rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-heading font-bold mb-2">General Admission</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Standard entry to all attractions
              </p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">$30</span>
                <span className="text-muted-foreground">/person</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Ticket className="h-4 w-4 text-storefront-primary" />
                  Access to all attractions
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-storefront-primary" />
                  Valid for selected date
                </li>
              </ul>
            </div>
            <div className="mt-auto p-6 pt-0">
              <button
                type="button"
                className="w-full rounded-lg bg-storefront-primary px-4 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Select Tickets
              </button>
            </div>
          </div>

          {/* VIP */}
          <div className="relative flex flex-col rounded-xl border-2 border-storefront-primary bg-card overflow-hidden">
            <div className="absolute top-0 right-0 bg-storefront-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <div className="p-6">
              <h3 className="text-xl font-heading font-bold mb-2">VIP Fast Pass</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Skip the line and get priority entry
              </p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">$50</span>
                <span className="text-muted-foreground">/person</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-storefront-primary" />
                  Priority queue access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Ticket className="h-4 w-4 text-storefront-primary" />
                  Access to all attractions
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-storefront-primary" />
                  Valid for selected date
                </li>
              </ul>
            </div>
            <div className="mt-auto p-6 pt-0">
              <button
                type="button"
                className="w-full rounded-lg bg-storefront-primary px-4 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Select Tickets
              </button>
            </div>
          </div>

          {/* Group */}
          <div className="relative flex flex-col rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-heading font-bold mb-2">Group Package</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Perfect for groups of 6 or more
              </p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">$25</span>
                <span className="text-muted-foreground">/person</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-storefront-primary" />
                  Minimum 6 guests
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Ticket className="h-4 w-4 text-storefront-primary" />
                  Access to all attractions
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-storefront-primary" />
                  Valid for selected date
                </li>
              </ul>
            </div>
            <div className="mt-auto p-6 pt-0">
              <button
                type="button"
                className="w-full rounded-lg bg-storefront-primary px-4 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Select Tickets
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground mt-8 text-sm">
          Online ticket sales coming soon. Visit our box office for tickets.
        </p>
      </div>
    </div>
  );
}
