'use client';

import { Menu, Ticket, X } from 'lucide-react';
import { useState } from 'react';
import { useStorefront } from '@/lib/storefront-context';
import { cn } from '@/lib/utils';
import { StorefrontLink } from './storefront-link';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { attraction, navigation, settings } = useStorefront();

  const headerLinks = navigation.header || [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <StorefrontLink href="/" className="flex items-center gap-2">
            <span className="text-xl font-heading font-bold text-storefront-primary">
              {attraction.name}
            </span>
          </StorefrontLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {headerLinks.map((link, index) => (
              <StorefrontLink
                key={link.id || `nav-${index}`}
                href={link.url}
                target={link.openInNewTab ? '_blank' : undefined}
                rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </StorefrontLink>
            ))}
            <StorefrontLink
              href="/tickets"
              className="inline-flex items-center gap-2 rounded-md bg-storefront-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              <Ticket className="h-4 w-4" />
              Buy Tickets
            </StorefrontLink>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            mobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
          )}
        >
          <nav className="flex flex-col gap-2">
            {headerLinks.map((link, index) => (
              <StorefrontLink
                key={link.id || `mobile-nav-${index}`}
                href={link.url}
                target={link.openInNewTab ? '_blank' : undefined}
                rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                className="px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </StorefrontLink>
            ))}
            <StorefrontLink
              href="/tickets"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-storefront-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Ticket className="h-4 w-4" />
              Buy Tickets
            </StorefrontLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
