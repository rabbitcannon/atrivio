'use client';

// Direct imports to avoid barrel export bundling issues
import { LandingHeader } from './landing-header';
import { HeroSection } from './hero-section';
import { FeatureGrid } from './feature-grid';
import { SplitSection } from './split-section';
import { LandingFooter } from './landing-footer';
import { StatsSection } from './stats-section';
import { PricingSection } from './pricing-section';
import { TestimonialsSection } from './testimonials-section';
import { CtaSection } from './cta-section';
import { FeaturesShowcase } from './features-showcase';
import { MobileCheckout } from './illustrations/mobile-checkout';
import { CheckInIllustration } from './illustrations/check-in-illustration';

const platformFeatures = [
  {
    id: 'multi-tenant',
    icon: <span aria-hidden="true">🏢</span>,
    title: 'Multi-Location Management',
    description:
      'Manage all your attractions from a single dashboard. Perfect for operators with multiple haunts, escape rooms, or venues.',
  },
  {
    id: 'role-based',
    icon: <span aria-hidden="true">🔐</span>,
    title: 'Role-Based Access',
    description:
      'Fine-grained permissions with owner, admin, manager, and specialized roles. Everyone sees exactly what they need.',
  },
  {
    id: 'real-time',
    icon: <span aria-hidden="true">⚡</span>,
    title: 'Real-Time Operations',
    description:
      'Live dashboards showing guest flow, staff status, capacity, and revenue. Make decisions with up-to-the-minute data.',
  },
];

const staffingFeatures = [
  {
    id: 'recruit',
    icon: <span aria-hidden="true">📢</span>,
    title: 'Recruit & Onboard',
    description:
      'Branded application forms with custom workflows. Review applicants, attach notes, assign roles, and manage certifications.',
  },
  {
    id: 'schedule',
    icon: <span aria-hidden="true">📅</span>,
    title: 'Smart Scheduling',
    description:
      'Drag-and-drop builder with shift templates, availability management, conflict detection, and shift swap requests.',
  },
  {
    id: 'time-tracking',
    icon: <span aria-hidden="true">⏱️</span>,
    title: 'Time Tracking',
    description:
      'QR code and PIN-based clock in/out. Track hours, breaks, and overtime automatically. Export for payroll integration.',
  },
];

const ticketingFeatures = [
  { id: 'timed-ticketing', text: 'Timed ticketing with slot-based entry for automatic capacity balancing.' },
  { id: 'ticket-types', text: 'Multiple ticket types: general admission, VIP, fast pass, group rates, and combos.' },
  { id: 'promo-codes', text: 'Flexible promo codes with usage limits, date ranges, and minimum purchase requirements.' },
  { id: 'fast-payouts', text: 'Stripe Connect integration with 1-2 business day payouts to your bank.' },
];

const checkInFeatures = [
  { id: 'barcode-scan', text: 'Lightning-fast barcode and QR code scanning from any device.' },
  { id: 'capacity-tracking', text: 'Real-time capacity tracking with automatic gate control.' },
  { id: 'waiver-collection', text: 'Digital waiver collection and signature capture at check-in.' },
  { id: 'queue-management', text: 'Virtual queue management to reduce wait times and improve guest experience.' },
];

export function LandingContent() {
  return (
    <div data-theme="landing" className="min-h-screen bg-[hsl(var(--landing-bg-darkest))] text-[hsl(var(--landing-text-primary))]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[hsl(var(--landing-accent-primary))] focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>

      <LandingHeader />

      <main id="main-content">
        <HeroSection />

        <StatsSection />

        <FeatureGrid
          id="platform"
          title="One Platform to Run Your Entire Operation"
          features={platformFeatures}
        />

        <FeaturesShowcase />

        <FeatureGrid
          id="staffing"
          title="Build and Manage Your Dream Team"
          features={staffingFeatures}
          variant="alt"
        />

        <SplitSection
          id="ticketing"
          title={
            <>
              Maximize Revenue with{' '}
              <span className="text-[hsl(var(--landing-accent-secondary))]">
                Smart Ticketing
              </span>
            </>
          }
          description="Sell tickets online with branded storefronts, or use our POS interface for walk-up sales. Integrated payment processing with Stripe Connect."
          features={ticketingFeatures}
          ctaText="Learn About Ticketing"
          ctaHref="#pricing"
          illustration={<MobileCheckout />}
        />

        <SplitSection
          id="checkin"
          title={
            <>
              Seamless{' '}
              <span className="text-[hsl(var(--landing-accent-primary))]">
                Check-In
              </span>{' '}
              Experience
            </>
          }
          description="Get guests through the door faster with our streamlined check-in system. Track capacity in real-time and collect digital waivers."
          features={checkInFeatures}
          ctaText="See Check-In in Action"
          ctaHref="#demo"
          illustration={<CheckInIllustration />}
          reverse
          variant="alt"
        />

        <PricingSection />

        <TestimonialsSection />

        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
