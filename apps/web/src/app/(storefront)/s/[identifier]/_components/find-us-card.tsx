'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import type { PublicStorefrontContact } from '@/lib/api/types';

interface FindUsCardProps {
  contact: PublicStorefrontContact;
  attractionName: string;
}

/**
 * Build full address string for Google Maps
 */
function buildAddressString(address: NonNullable<PublicStorefrontContact['address']>): string {
  const parts = [address.line1];
  if (address.line2) parts.push(address.line2);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  return parts.join(', ');
}

/**
 * Get Google Maps embed URL (free, no API key required)
 * Uses coordinates if available for more precise placement
 */
function getMapEmbedUrl(
  address: NonNullable<PublicStorefrontContact['address']>,
  coordinates?: PublicStorefrontContact['coordinates']
): string {
  // Use coordinates if available for precise placement
  if (coordinates) {
    return `https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&t=m&z=15&output=embed&iwloc=near`;
  }
  // Fall back to address string
  const addressString = buildAddressString(address);
  const encoded = encodeURIComponent(addressString);
  return `https://maps.google.com/maps?q=${encoded}&t=m&z=15&output=embed&iwloc=near`;
}

/**
 * Get Google Maps directions URL
 * Uses coordinates if available for more precise routing
 */
function getDirectionsUrl(
  address: NonNullable<PublicStorefrontContact['address']>,
  coordinates?: PublicStorefrontContact['coordinates']
): string {
  // Use coordinates if available for precise destination
  if (coordinates) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
  }
  // Fall back to address string
  const addressString = buildAddressString(address);
  const encoded = encodeURIComponent(addressString);
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
}

/**
 * Find Us Card - Displays location, phone, email with Google Maps embed
 */
export function FindUsCard({ contact, attractionName }: FindUsCardProps) {
  // Don't render if nothing to show
  const hasAddress = contact.showAddress && contact.address;
  const hasPhone = contact.showPhone && contact.phone;
  const hasEmail = contact.showEmail && contact.email;

  if (!hasAddress && !hasPhone && !hasEmail) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Find Us
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Maps Embed */}
        {hasAddress && (
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <iframe
              src={getMapEmbedUrl(contact.address!, contact.coordinates)}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map showing location of ${attractionName}`}
            />
          </div>
        )}

        {/* Address */}
        {hasAddress && (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{contact.address!.line1}</p>
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
        )}

        {/* Phone */}
        {hasPhone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <span>{contact.phone}</span>
          </a>
        )}

        {/* Email */}
        {hasEmail && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
          >
            <Mail className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <span>{contact.email}</span>
          </a>
        )}

        {/* Get Directions Button */}
        {hasAddress && (
          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <a
              href={getDirectionsUrl(contact.address!, contact.coordinates)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Get Directions
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
