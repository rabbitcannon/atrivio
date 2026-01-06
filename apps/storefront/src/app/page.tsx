import { headers } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Ticket, Calendar, HelpCircle, MapPin } from 'lucide-react';
import { getPublicStorefront, getPublicFaqs } from '@/lib/api';

export default async function HomePage() {
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');

  if (!identifier) return null;

  const storefront = await getPublicStorefront(identifier);
  if (!storefront) return null;

  const { attraction, settings } = storefront;

  // Fetch FAQs separately (API doesn't include them in main response)
  const { faqs } = await getPublicFaqs(identifier);
  const featuredFaqs = faqs.filter((f) => f.isFeatured).slice(0, 4);

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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

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
              href="/tickets"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-storefront-primary px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
            >
              <Ticket className="h-5 w-5" />
              Buy Tickets
            </Link>
            {settings.features.showCalendar && (
              <Link
                href="/calendar"
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
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {settings.description}
            </p>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/tickets"
              className="group flex flex-col items-center p-8 rounded-xl border border-border bg-card hover:border-storefront-primary transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-storefront-primary/10 flex items-center justify-center mb-4 group-hover:bg-storefront-primary/20 transition-colors">
                <Ticket className="h-8 w-8 text-storefront-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Get Tickets</h3>
              <p className="text-sm text-muted-foreground text-center">
                Purchase tickets online and skip the line
              </p>
            </Link>

            <Link
              href="/faqs"
              className="group flex flex-col items-center p-8 rounded-xl border border-border bg-card hover:border-storefront-primary transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-storefront-primary/10 flex items-center justify-center mb-4 group-hover:bg-storefront-primary/20 transition-colors">
                <HelpCircle className="h-8 w-8 text-storefront-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">FAQs</h3>
              <p className="text-sm text-muted-foreground text-center">
                Get answers to common questions
              </p>
            </Link>

            <Link
              href="/contact"
              className="group flex flex-col items-center p-8 rounded-xl border border-border bg-card hover:border-storefront-primary transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-storefront-primary/10 flex items-center justify-center mb-4 group-hover:bg-storefront-primary/20 transition-colors">
                <MapPin className="h-8 w-8 text-storefront-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Find Us</h3>
              <p className="text-sm text-muted-foreground text-center">
                Get directions and contact information
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured FAQs */}
      {featuredFaqs.length > 0 && (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {featuredFaqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group border border-border rounded-lg overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                    <span className="font-medium">{faq.question}</span>
                    <span className="text-2xl text-muted-foreground group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <div className="p-4 pt-0 text-muted-foreground">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/faqs"
                className="text-storefront-primary hover:underline font-medium"
              >
                View all FAQs →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
