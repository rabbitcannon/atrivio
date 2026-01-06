'use client';

import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useStorefront } from '@/lib/storefront-context';
import { StorefrontLink } from './storefront-link';

export function Footer() {
  const { attraction, navigation, settings } = useStorefront();
  const footerLinks = navigation.footer || [];
  const { social } = settings;

  const socialLinks = [
    { name: 'Facebook', url: social.facebook, icon: Facebook },
    { name: 'Instagram', url: social.instagram, icon: Instagram },
    { name: 'Twitter', url: social.twitter, icon: Twitter },
    { name: 'YouTube', url: social.youtube, icon: Youtube },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-heading font-bold text-storefront-primary mb-2">
              {attraction.name}
            </h3>
            {settings.tagline && (
              <p className="text-sm text-muted-foreground">{settings.tagline}</p>
            )}
          </div>

          {/* Links */}
          {footerLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {footerLinks.map((link, index) => (
                  <li key={link.id || `footer-${index}`}>
                    <StorefrontLink
                      href={link.url}
                      target={link.openInNewTab ? '_blank' : undefined}
                      rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </StorefrontLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social */}
          {socialLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-storefront-primary transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {attraction.name}. All rights reserved.</p>
          <p className="mt-1 text-xs">
            Powered by{' '}
            <a
              href="https://hauntplatform.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Haunt Platform
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
