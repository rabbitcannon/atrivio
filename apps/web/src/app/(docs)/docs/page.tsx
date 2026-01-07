import Link from 'next/link';
import {
  BookOpen,
  Rocket,
  Users,
  Ticket,
  Settings,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Rocket,
    title: 'Getting Started',
    description: 'Learn the basics and get your first attraction set up in minutes.',
    href: '/docs/getting-started/quick-start',
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Manage your team, schedules, and time tracking all in one place.',
    href: '/docs/user-guides/staff/adding-staff',
  },
  {
    icon: Ticket,
    title: 'Ticketing & Check-In',
    description: 'Sell tickets online and scan them at the door with ease.',
    href: '/docs/user-guides/ticketing/ticket-types',
  },
  {
    icon: Settings,
    title: 'Admin Guides',
    description: 'Configure payments, storefront, and organization settings.',
    href: '/docs/admin-guides/organization/settings',
  },
];

export default function DocsHomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <BookOpen className="h-4 w-4" />
          Documentation
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to Atrivio Docs
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to manage your haunted attraction, escape room, or entertainment venue.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="group relative rounded-lg border bg-card p-6 hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick start section */}
      <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-8">
        <h2 className="text-2xl font-semibold mb-4">New to Atrivio?</h2>
        <p className="text-muted-foreground mb-6">
          Follow our quick start guide to get your organization set up and ready to go in under 10 minutes.
        </p>
        <Link
          href="/docs/getting-started/quick-start"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Start the Quick Start Guide
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Popular topics */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Popular Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Setting up Stripe payments', href: '/docs/admin-guides/payments/stripe-setup' },
            { title: 'Creating shift schedules', href: '/docs/user-guides/scheduling/creating-shifts' },
            { title: 'Scanning tickets at check-in', href: '/docs/user-guides/check-in/scanning-tickets' },
            { title: 'Managing staff roles', href: '/docs/user-guides/staff/roles-permissions' },
            { title: 'Creating promo codes', href: '/docs/user-guides/ticketing/promo-codes' },
            { title: 'Customizing your storefront', href: '/docs/admin-guides/storefront/setup' },
          ].map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="rounded-md border px-4 py-3 text-sm hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              {topic.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
