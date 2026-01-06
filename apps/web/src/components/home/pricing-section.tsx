import { cn } from '@/lib/utils/cn';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  ctaHref: string;
}

const tiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for single-location operators getting started.',
    price: '$99',
    period: '/month',
    features: [
      'Up to 1 attraction',
      'Unlimited tickets sold',
      'Basic ticketing & check-in',
      'Time tracking',
      'Standard support',
      '2.9% + 30¢ per transaction',
    ],
    ctaText: 'Start Free Trial',
    ctaHref: '#demo',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing operations that need advanced features.',
    price: '$249',
    period: '/month',
    highlighted: true,
    features: [
      'Up to 5 attractions',
      'Unlimited tickets sold',
      'Staff scheduling & availability',
      'Promo codes & discounts',
      'Advanced analytics',
      'Priority support',
      '2.5% + 30¢ per transaction',
    ],
    ctaText: 'Start Free Trial',
    ctaHref: '#demo',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For multi-location operators with complex needs.',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited attractions',
      'Virtual queue management',
      'Custom integrations & API',
      'White-label storefronts',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom transaction rates',
    ],
    ctaText: 'Contact Sales',
    ctaHref: '#demo',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-[hsl(var(--landing-bg-dark))] px-5 py-[var(--landing-section-spacing)]">
      <div className="mx-auto max-w-[var(--landing-container-max)]">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[hsl(var(--landing-text-primary))] sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[hsl(var(--landing-text-muted))]">
            No hidden fees. No long-term contracts. Scale your plan as your
            operation grows.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'relative rounded-2xl p-8',
                tier.highlighted
                  ? 'border-2 border-[hsl(var(--landing-accent-primary))] bg-[hsl(var(--landing-bg-card))] shadow-xl shadow-[hsl(var(--landing-glow-primary))]'
                  : 'border border-[hsl(var(--landing-border-subtle))] bg-[hsl(var(--landing-bg-card))]'
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--landing-accent-primary))] px-4 py-1 text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[hsl(var(--landing-text-primary))]">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-[hsl(var(--landing-text-muted))]">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-[hsl(var(--landing-text-primary))]">
                  {tier.price}
                </span>
                <span className="text-[hsl(var(--landing-text-muted))]">{tier.period}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[hsl(var(--landing-text-muted))]"
                  >
                    <span className="mt-0.5 text-[hsl(var(--landing-accent-secondary))]" aria-hidden="true">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.ctaHref}
                className={cn(
                  'block w-full rounded-lg py-3 text-center font-semibold transition-all duration-[var(--landing-transition-normal)]',
                  tier.highlighted
                    ? 'bg-[hsl(var(--landing-accent-primary))] text-white hover:bg-[hsl(var(--landing-accent-primary-hover))]'
                    : 'border-2 border-[hsl(var(--landing-border-subtle))] text-[hsl(var(--landing-text-primary))] hover:border-[hsl(var(--landing-accent-primary))] hover:text-[hsl(var(--landing-accent-primary))]'
                )}
              >
                {tier.ctaText}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[hsl(var(--landing-text-muted))]">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
