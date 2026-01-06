'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils/cn';

interface Feature {
  id: string;
  title: string;
  description: string;
  details: string[];
  icon: string;
}

const features: Feature[] = [
  {
    id: 'ticketing',
    title: 'Ticketing & Sales',
    icon: '🎟️',
    description: 'Sell tickets online and at the door with our powerful ticketing system.',
    details: [
      'Timed-entry tickets with capacity management',
      'Multiple ticket types (GA, VIP, Fast Pass, Combos)',
      'Branded online storefronts',
      'Walk-up POS sales interface',
      'Promo codes with flexible rules',
      'Group booking and private events',
    ],
  },
  {
    id: 'scheduling',
    title: 'Staff Scheduling',
    icon: '📅',
    description: 'Build schedules in minutes with our intelligent scheduling tools.',
    details: [
      'Drag-and-drop shift builder',
      'Reusable shift templates',
      'Staff availability management',
      'Shift swap requests and approvals',
      'Conflict detection and warnings',
      'Multi-attraction shift support',
    ],
  },
  {
    id: 'time-tracking',
    title: 'Time Tracking',
    icon: '⏱️',
    description: 'Accurate time tracking with multiple clock-in methods.',
    details: [
      'QR code clock in/out',
      'PIN-based kiosk mode',
      'Break tracking and enforcement',
      'Overtime calculations',
      'GPS verification (optional)',
      'Payroll export integrations',
    ],
  },
  {
    id: 'checkin',
    title: 'Guest Check-In',
    icon: '📲',
    description: 'Fast, seamless check-in that gets guests into the experience.',
    details: [
      'Barcode and QR code scanning',
      'Real-time capacity tracking',
      'Digital waiver collection',
      'ID verification workflows',
      'Multiple check-in stations',
      'Offline mode support',
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Finance',
    icon: '💳',
    description: 'Secure payment processing with fast payouts.',
    details: [
      'Stripe Connect integration',
      '1-2 day payouts to your bank',
      'Refund and void management',
      'Revenue reporting and analytics',
      'Multi-currency support',
      'PCI compliant processing',
    ],
  },
  {
    id: 'analytics',
    title: 'Reports & Analytics',
    icon: '📊',
    description: 'Data-driven insights to grow your business.',
    details: [
      'Real-time sales dashboards',
      'Staff hours and labor costs',
      'Guest flow and capacity analytics',
      'Marketing attribution tracking',
      'Custom report builder',
      'Scheduled email reports',
    ],
  },
];

export function FeaturesShowcase() {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="bg-[hsl(var(--landing-bg-dark))] px-5 py-[var(--landing-section-spacing)]">
      <div ref={ref} className="mx-auto max-w-[var(--landing-container-max)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-[hsl(var(--landing-text-primary))] sm:text-4xl">
            Everything You Need, Nothing You Don&apos;t
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[hsl(var(--landing-text-muted))]">
            Purpose-built for attractions, our platform gives you the tools to run
            your operation efficiently — without the bloat of generic software.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Feature tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="space-y-2 lg:col-span-1"
          >
            {features.map((feature, index) => (
              <motion.button
                key={feature.id}
                type="button"
                onClick={() => setActiveFeature(feature)}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + index * 0.05,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full rounded-xl p-4 text-left transition-all duration-[var(--landing-transition-normal)]',
                  activeFeature.id === feature.id
                    ? 'bg-[hsl(var(--landing-accent-primary))] text-white shadow-lg shadow-[hsl(var(--landing-glow-primary))]'
                    : 'bg-[hsl(var(--landing-bg-card))] text-[hsl(var(--landing-text-muted))] hover:bg-[hsl(var(--landing-bg-card)/0.8)]'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{feature.icon}</span>
                  <span className="font-semibold">{feature.title}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Feature details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="rounded-2xl bg-[hsl(var(--landing-bg-card))] p-8 lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-5xl" aria-hidden="true">{activeFeature.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-[hsl(var(--landing-text-primary))]">
                      {activeFeature.title}
                    </h3>
                    <p className="text-[hsl(var(--landing-text-muted))]">
                      {activeFeature.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {activeFeature.details.map((detail, index) => (
                    <motion.div
                      key={detail}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      }}
                      className="flex items-start gap-3 rounded-lg bg-[hsl(var(--landing-bg-dark))] p-4"
                    >
                      <span className="mt-0.5 text-[hsl(var(--landing-accent-secondary))]" aria-hidden="true">
                        ✓
                      </span>
                      <span className="text-[hsl(var(--landing-text-muted))]">{detail}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
