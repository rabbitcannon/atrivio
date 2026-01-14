'use client';

import { motion, useInView } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { getPricingTiers, type PricingTier as ApiPricingTier } from '@/lib/api/pricing';

interface PricingTierDisplay {
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

// Default tiers as fallback if API fails
const defaultTiers: PricingTierDisplay[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with essential features for free.',
    price: '$0',
    period: '/month',
    features: [
      '1 attraction',
      'Up to 10 staff members',
      'Unlimited ticket sales',
      'Ticketing & orders',
      'Check-in & barcode scanning',
      'Time tracking',
      'Email notifications',
      'Free subdomain (yourname.atrivio.io)',
      'Link external images (no storage)',
      '3.9% + 30¢ per transaction',
    ],
    ctaText: 'Get Started Free',
    ctaHref: '/signup',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing operations that need advanced features.',
    price: '$149',
    period: '/month',
    highlighted: true,
    features: [
      'Everything in Free, plus:',
      'Up to 5 attractions',
      'Up to 50 staff members',
      'Staff scheduling & availability',
      'Shift swap requests',
      'Inventory management',
      'Public storefronts',
      '5 custom domains',
      '500 MB media storage',
      'Advanced analytics',
      'Priority support',
      '2.9% + 30¢ per transaction',
    ],
    ctaText: 'Start Free Trial',
    ctaHref: '/signup?plan=pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For multi-location operators with complex needs.',
    price: '$499',
    period: '/month',
    features: [
      'Everything in Pro, plus:',
      'Unlimited attractions',
      'Unlimited staff members',
      'Virtual queue management',
      'SMS notifications',
      '10 custom domains',
      '5 GB media storage',
      'Full API access',
      'Dedicated account manager',
      'Custom integrations',
      '2.5% + 30¢ per transaction',
    ],
    ctaText: 'Contact Sales',
    ctaHref: '/contact?plan=enterprise',
  },
];

/**
 * Transform API pricing tier to display format with feature descriptions
 */
function transformApiTierToDisplay(apiTier: ApiPricingTier): PricingTierDisplay {
  const tierConfig: Record<string, { ctaText: string; ctaHref: string; highlighted?: boolean }> = {
    free: { ctaText: 'Get Started Free', ctaHref: '/signup' },
    pro: { ctaText: 'Start Free Trial', ctaHref: '/signup?plan=pro', highlighted: true },
    enterprise: { ctaText: 'Contact Sales', ctaHref: '/contact?plan=enterprise' },
  };

  const config = tierConfig[apiTier.tier] || tierConfig.free;

  // Build feature list from API data and include the transaction fee
  const features = [...apiTier.features, apiTier.transactionFee + ' per transaction'];

  return {
    id: apiTier.tier,
    name: apiTier.name,
    description: apiTier.description,
    price: apiTier.monthlyPrice,
    period: '/month',
    features,
    highlighted: config.highlighted,
    ctaText: config.ctaText,
    ctaHref: config.ctaHref,
  };
}

export function PricingSection() {
  const [tiers, setTiers] = useState<PricingTierDisplay[]>(defaultTiers);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Fetch pricing from API on mount
  useEffect(() => {
    async function fetchPricing() {
      try {
        const apiTiers = await getPricingTiers();
        if (apiTiers.length > 0) {
          // Sort by tier order: free, pro, enterprise
          const tierOrder = ['free', 'pro', 'enterprise'];
          const sortedTiers = apiTiers
            .filter((t) => t.isActive)
            .sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier))
            .map(transformApiTierToDisplay);
          if (sortedTiers.length > 0) {
            setTiers(sortedTiers);
          }
        }
      } catch (error) {
        // Keep default tiers on error
        console.error('Failed to fetch pricing:', error);
      }
    }
    fetchPricing();
  }, []);

  return (
    <section
      id="pricing"
      className="bg-[hsl(var(--landing-bg-dark))] px-5 py-[var(--landing-section-spacing)]"
    >
      <div ref={ref} className="mx-auto max-w-[var(--landing-container-max)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-[hsl(var(--landing-text-primary))] sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[hsl(var(--landing-text-muted))]">
            No hidden fees. No long-term contracts. Scale your plan as your operation grows.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={cn(
                'relative rounded-2xl p-8',
                tier.highlighted
                  ? 'border-2 border-[hsl(var(--landing-accent-primary))] bg-[hsl(var(--landing-bg-card))] shadow-xl shadow-[hsl(var(--landing-glow-primary))]'
                  : 'border border-[hsl(var(--landing-border-subtle))] bg-[hsl(var(--landing-bg-card))]'
              )}
            >
              {tier.highlighted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--landing-accent-primary))] px-4 py-1 text-sm font-semibold text-white"
                >
                  Most Popular
                </motion.div>
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
                {tier.features.map((feature, featureIndex) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.3 + index * 0.1 + featureIndex * 0.03,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    className="flex items-start gap-3 text-sm text-[hsl(var(--landing-text-muted))]"
                  >
                    <span
                      className="mt-0.5 text-[hsl(var(--landing-accent-secondary))]"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={tier.ctaHref}
                className={cn(
                  'block w-full rounded-lg py-3 text-center font-semibold transition-all duration-[var(--landing-transition-normal)]',
                  tier.highlighted
                    ? 'bg-[hsl(var(--landing-accent-primary))] text-white hover:bg-[hsl(var(--landing-accent-primary-hover))]'
                    : 'border-2 border-[hsl(var(--landing-border-subtle))] text-[hsl(var(--landing-text-primary))] hover:border-[hsl(var(--landing-accent-primary))] hover:text-[hsl(var(--landing-accent-primary))]'
                )}
              >
                {tier.ctaText}
              </motion.a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-center text-sm text-[hsl(var(--landing-text-muted))]"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
