'use client';

import Image from 'next/image';
import { useState } from 'react';
import atrivioLogo from '@/assets/images/atrivio-logo.png';
import { cn } from '@/lib/utils/cn';

const navLinks = [
  { href: '#platform', label: 'Platform' },
  { href: '#staffing', label: 'Staffing' },
  { href: '#ticketing', label: 'Ticketing' },
  { href: '#checkin', label: 'Check-In' },
  { href: '#pricing', label: 'Pricing' },
];

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--landing-border-subtle))] bg-[hsl(var(--landing-bg-darkest)/0.95)] backdrop-blur-md">
      <div className="mx-auto flex h-[70px] max-w-[var(--landing-container-max)] items-center justify-between px-5">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <Image
            src={atrivioLogo}
            alt="Atrivio"
            height={56}
            width={84}
            className="h-14 w-auto object-contain"
            priority
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden gap-6 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.95rem] font-medium text-[hsl(var(--landing-text-muted))] transition-colors duration-[var(--landing-transition-fast)] hover:text-[hsl(var(--landing-accent-primary))] focus:text-[hsl(var(--landing-accent-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--landing-accent-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--landing-bg-darkest))]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="/login"
            className="rounded-md border-2 border-[hsl(var(--landing-bg-card))] bg-transparent px-5 py-2.5 text-sm font-semibold text-[hsl(var(--landing-text-primary))] transition-all duration-[var(--landing-transition-normal)] hover:border-[hsl(var(--landing-accent-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--landing-accent-primary))]"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="rounded-md bg-[hsl(var(--landing-accent-primary))] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-[var(--landing-transition-normal)] hover:-translate-y-0.5 hover:bg-[hsl(var(--landing-accent-primary-hover))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--landing-accent-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--landing-bg-darkest))]"
          >
            Start Free Trial
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md text-[hsl(var(--landing-text-muted))] transition-colors hover:text-[hsl(var(--landing-text-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--landing-accent-primary))] lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={cn(
          'overflow-hidden border-t border-[hsl(var(--landing-border-subtle))] bg-[hsl(var(--landing-bg-darkest))] transition-all duration-300 lg:hidden',
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-4 py-3 text-[hsl(var(--landing-text-muted))] transition-colors hover:bg-[hsl(var(--landing-bg-card))] hover:text-[hsl(var(--landing-text-primary))]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-3 border-t border-[hsl(var(--landing-border-subtle))] pt-4">
            <a
              href="/login"
              className="rounded-md border-2 border-[hsl(var(--landing-bg-card))] px-4 py-3 text-center font-semibold text-[hsl(var(--landing-text-primary))]"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="rounded-md bg-[hsl(var(--landing-accent-primary))] px-4 py-3 text-center font-semibold text-white"
            >
              Start Free Trial
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
