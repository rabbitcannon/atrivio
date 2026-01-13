import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicStorefront, type StorefrontContact } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Find Us',
};

/**
 * Build full address string for Google Maps
 */
function buildAddressString(address: NonNullable<StorefrontContact['address']>): string {
  const parts = [address.line1];
  if (address.line2) parts.push(address.line2);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  return parts.join(', ');
}

/**
 * Get Google Maps embed URL (free, no API key required)
 */
function getMapEmbedUrl(
  address: NonNullable<StorefrontContact['address']>,
  coordinates?: StorefrontContact['coordinates']
): string {
  if (coordinates) {
    return `https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&t=m&z=15&output=embed&iwloc=near`;
  }
  const addressString = buildAddressString(address);
  const encoded = encodeURIComponent(addressString);
  return `https://maps.google.com/maps?q=${encoded}&t=m&z=15&output=embed&iwloc=near`;
}

/**
 * Get Google Maps directions URL
 */
function getDirectionsUrl(
  address: NonNullable<StorefrontContact['address']>,
  coordinates?: StorefrontContact['coordinates']
): string {
  if (coordinates) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
  }
  const addressString = buildAddressString(address);
  const encoded = encodeURIComponent(addressString);
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
}

export default async function ContactPage() {
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');

  if (!identifier) return notFound();

  const storefront = await getPublicStorefront(identifier);
  if (!storefront) return notFound();

  const { contact, attraction, settings } = storefront;

  const hasAddress = contact.showAddress && contact.address;
  const hasPhone = contact.showPhone && contact.phone;
  const hasEmail = contact.showEmail && contact.email;
  const hasBackgroundImage = !!settings.theme.backgroundImageUrl;

  // If no contact info at all, show a message
  if (!hasAddress && !hasPhone && !hasEmail) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-heading font-bold text-center mb-8">Find Us</h1>
        <div className={`max-w-2xl mx-auto text-center p-8 rounded-xl border border-border ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}>
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Contact information is not available at this time.
          </p>
          <Link
            href="/"
            className="inline-flex items-center mt-6 text-storefront-primary hover:underline font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-heading font-bold text-center mb-8">Find Us</h1>

      <div className="max-w-4xl mx-auto">
        {/* Map Section */}
        {hasAddress && (
          <div className={`rounded-xl overflow-hidden border border-border mb-8 ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}>
            <div className="aspect-video w-full">
              <iframe
                src={getMapEmbedUrl(contact.address!, contact.coordinates)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map showing location of ${attraction.name}`}
              />
            </div>
          </div>
        )}

        {/* Contact Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Address Card */}
          {hasAddress && (
            <div className={`p-6 rounded-xl border border-border ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-storefront-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-storefront-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold mb-2">Address</h3>
                  <p className="text-sm">{contact.address!.line1}</p>
                  {contact.address!.line2 && (
                    <p className="text-sm">{contact.address!.line2}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {contact.address!.city}
                    {contact.address!.state && `, ${contact.address!.state}`}
                    {contact.address!.postalCode && ` ${contact.address!.postalCode}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Phone Card */}
          {hasPhone && (
            <a
              href={`tel:${contact.phone}`}
              className={`p-6 rounded-xl border border-border hover:border-storefront-primary transition-colors ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-storefront-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-storefront-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold mb-2">Phone</h3>
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                </div>
              </div>
            </a>
          )}

          {/* Email Card */}
          {hasEmail && (
            <a
              href={`mailto:${contact.email}`}
              className={`p-6 rounded-xl border border-border hover:border-storefront-primary transition-colors ${hasBackgroundImage ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-storefront-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-storefront-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold mb-2">Email</h3>
                  <p className="text-sm text-muted-foreground break-all">{contact.email}</p>
                </div>
              </div>
            </a>
          )}
        </div>

        {/* Get Directions Button */}
        {hasAddress && (
          <div className="mt-8 text-center">
            <a
              href={getDirectionsUrl(contact.address!, contact.coordinates)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-storefront-primary px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
            >
              <ExternalLink className="h-5 w-5" />
              Get Directions
            </a>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
