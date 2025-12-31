import type { Metadata } from 'next';
import {
  LandingHeader,
  HeroSection,
  FeatureGrid,
  SplitSection,
  OperationsSection,
  ScaleSection,
  LandingFooter,
} from '@/components/home';
import { MobileCheckout } from '@/components/home/illustrations/mobile-checkout';

export const metadata: Metadata = {
  title: 'Ultimate Haunt Platform | The Unified Operator System',
  description:
    'The operator-centric solution for managing multiple locations, staffing, ticketing, and financials under a single master account.',
};

const staffingFeatures = [
  {
    id: 'recruit',
    icon: <span aria-hidden="true">📢</span>,
    title: 'Recruit',
    description:
      'Use branded application forms with custom workflows to review applicants, attach notes, and assign roles.',
  },
  {
    id: 'schedule',
    icon: <span aria-hidden="true">📅</span>,
    title: 'Schedule',
    description:
      'Drag-and-drop builder supporting shift templates, conflict detection, and multiple roles per night across haunts.',
  },
  {
    id: 'operate',
    icon: <span aria-hidden="true">📱</span>,
    title: 'Operate',
    description:
      'Self-service portal for staff to view shifts, plus on-site kiosk tools with QR/Pin for secure time tracking.',
  },
];

const ticketingFeatures = [
  { id: 'timed-ticketing', text: 'Timed Ticketing with slot-based entry for auto capacity balancing.' },
  { id: 'dynamic-pricing', text: 'Dynamic Pricing to adjust costs based on demand or inventory.' },
  { id: 'multi-pass', text: 'Multi-Haunt and Multi-Attraction passes supported.' },
  { id: 'fast-payouts', text: 'Fast payouts with 1–2 business day deposits.' },
];

export default function HomePage() {
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

        <FeatureGrid
          id="staffing"
          title="Build and Manage Your Dream Scream Team"
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
              </span>{' '}
              & Integrated Finance
            </>
          }
          description="Sell digital tickets via fully branded online pages alongside POS-style interfaces for on-site box office sales."
          features={ticketingFeatures}
          ctaText="Explore Finance Features"
          ctaHref="#"
          illustration={<MobileCheckout />}
        />

        <OperationsSection />

        <ScaleSection />
      </main>

      <LandingFooter />
    </div>
  );
}
