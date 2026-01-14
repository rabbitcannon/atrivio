import { Calendar, HelpCircle, MapPin, Ticket } from 'lucide-react';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { getPublicFaqs, getPublicStorefront, getPublicTicketTypes } from '@/lib/api';

/**
 * Format cents to currency string
 */
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Build a URL that preserves the storefront query param for local development
 */
function buildUrl(path: string, storefrontParam: string | null): string {
  if (!storefrontParam) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}storefront=${storefrontParam}`;
}

interface HomePageProps {
  searchParams: Promise<{ storefront?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');
  const { storefront: storefrontParam } = await searchParams;

  if (!identifier) return null;

  const storefront = await getPublicStorefront(identifier);
  if (!storefront) return null;

  const { attraction, settings, contact } = storefront;

  // Fetch additional data in parallel
  const [{ faqs }, { ticketTypes }] = await Promise.all([
    getPublicFaqs(identifier),
    getPublicTicketTypes(identifier),
  ]);

  // Check if address is visible and has data
  const hasVisibleAddress = contact.showAddress && contact.address;

  // Check what sections to show (respect feature toggles)
  const showFaqCard = settings.features.showFaq && faqs.length > 0;
  const showTicketsCard = settings.features.showTickets !== false && ticketTypes.length > 0;
  const featuredFaqs = faqs.filter((f) => f.isFeatured).slice(0, 4);

  // Check if there's a background image set
  const hasBackgroundImage = !!settings.theme.backgroundImageUrl;

  // Calculate how many cards we have for grid layout
  const cardCount = [showTicketsCard, showFaqCard, hasVisibleAddress].filter(Boolean).length;
  const gridCols = cardCount === 1 ? 'md:grid-cols-1 max-w-md' : cardCount === 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-3';

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {settings.hero.imageUrl && (
          <Image
            src={settings.hero.imageUrl}
            alt={attraction.name}
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Only show gradient overlay if there's a hero image, not for page background */}
        {settings.hero.imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        )}

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-4">
            {settings.hero.title || attraction.name}
          </h1>
          {(settings.hero.subtitle || settings.tagline) && (
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {settings.hero.subtitle || settings.tagline}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={buildUrl('/tickets', storefrontParam ?? null)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-storefront-primary px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
            >
              <Ticket className="h-5 w-5" />
              Buy Tickets
            </Link>
            {settings.features.showCalendar && (
              <Link
                href={buildUrl('/calendar', storefrontParam ?? null)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-8 py-4 text-lg font-semibold transition-all hover:bg-accent"
              >
                <Calendar className="h-5 w-5" />
                View Calendar
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Description Section */}
      {settings.description && (
        <section className={`py-16 ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">{settings.description}</p>
          </div>
        </section>
      )}

      {/* Quick Links - Equal Height Cards */}
      {cardCount > 0 && (
        <section className="py-16">
          <div className={`container mx-auto px-4 ${gridCols === 'md:grid-cols-1 max-w-md' || gridCols === 'md:grid-cols-2 max-w-3xl' ? '' : ''}`}>
            <div className={`grid gap-6 ${gridCols} mx-auto`}>
              {/* Tickets Card */}
              {showTicketsCard && (
                <Link
                  href={buildUrl('/tickets', storefrontParam ?? null)}
                  className={`group flex flex-col rounded-xl border border-border hover:border-storefront-primary transition-colors overflow-hidden ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}
                >
                  {/* Header with icon */}
                  <div className="p-6 flex items-center gap-4 border-b border-border">
                    <div className="w-12 h-12 rounded-full bg-storefront-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-storefront-primary/20 transition-colors">
                      <Ticket className="h-6 w-6 text-storefront-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold">Get Tickets</h3>
                      <p className="text-sm text-muted-foreground">
                        {ticketTypes.length} ticket type{ticketTypes.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                  {/* Ticket types preview */}
                  <div className="p-4 flex-1">
                    <ul className="space-y-2">
                      {ticketTypes.slice(0, 3).map((ticket) => (
                        <li key={ticket.id} className="flex justify-between items-center text-sm">
                          <span className="truncate mr-2">{ticket.name}</span>
                          <span className="font-semibold text-storefront-primary whitespace-nowrap">
                            {formatPrice(ticket.price)}
                          </span>
                        </li>
                      ))}
                      {ticketTypes.length > 3 && (
                        <li className="text-sm text-muted-foreground">
                          +{ticketTypes.length - 3} more...
                        </li>
                      )}
                    </ul>
                  </div>
                </Link>
              )}

              {/* FAQ Card */}
              {showFaqCard && (
                <Link
                  href={buildUrl('/faq', storefrontParam ?? null)}
                  className={`group flex flex-col rounded-xl border border-border hover:border-storefront-primary transition-colors overflow-hidden ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}
                >
                  {/* Header with icon */}
                  <div className="p-6 flex items-center gap-4 border-b border-border">
                    <div className="w-12 h-12 rounded-full bg-storefront-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-storefront-primary/20 transition-colors">
                      <HelpCircle className="h-6 w-6 text-storefront-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold">FAQs</h3>
                      <p className="text-sm text-muted-foreground">
                        {faqs.length} question{faqs.length !== 1 ? 's' : ''} answered
                      </p>
                    </div>
                  </div>
                  {/* FAQ preview */}
                  <div className="p-4 flex-1">
                    <ul className="space-y-2">
                      {faqs.slice(0, 3).map((faq) => (
                        <li key={faq.id} className="text-sm truncate text-muted-foreground">
                          • {faq.question}
                        </li>
                      ))}
                      {faqs.length > 3 && (
                        <li className="text-sm text-muted-foreground">
                          +{faqs.length - 3} more...
                        </li>
                      )}
                    </ul>
                  </div>
                </Link>
              )}

              {/* Find Us Card with Map */}
              {hasVisibleAddress && contact.address && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${contact.address.line1}, ${contact.address.city}, ${contact.address.state} ${contact.address.postalCode}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col rounded-xl border border-border hover:border-storefront-primary transition-colors overflow-hidden ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}
                >
                  {/* Map embed */}
                  <div className="aspect-video w-full pointer-events-none">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        `${contact.address.line1}, ${contact.address.city}, ${contact.address.state} ${contact.address.postalCode}`
                      )}&t=m&z=14&output=embed&iwloc=near`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map showing location of ${attraction.name}`}
                    />
                  </div>
                  {/* Address info */}
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-storefront-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-storefront-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold truncate">Find Us</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {contact.address.line1}, {contact.address.city}
                      </p>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured FAQs Section */}
      {settings.features.showFaq && featuredFaqs.length > 0 && (
        <section className={`py-16 ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {featuredFaqs.map((faq) => (
                <details
                  key={faq.id}
                  className={`group border border-border rounded-lg overflow-hidden ${hasBackgroundImage ? 'bg-card/60' : ''}`}
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                    <span className="font-medium">{faq.question}</span>
                    <span className="text-2xl text-muted-foreground group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <div className="p-4 pt-0 text-muted-foreground">{faq.answer}</div>
                </details>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href={buildUrl('/faq', storefrontParam ?? null)} className="text-storefront-primary hover:underline font-medium">
                View all FAQs →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
