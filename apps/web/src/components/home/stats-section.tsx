'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const stats = [
  {
    id: 'tickets',
    value: '2M+',
    label: 'Tickets Sold',
    description: 'Processed annually',
  },
  {
    id: 'venues',
    value: '500+',
    label: 'Venues',
    description: 'Trust Atrivio',
  },
  {
    id: 'staff',
    value: '25K+',
    label: 'Staff Managed',
    description: 'Scheduled & tracked',
  },
  {
    id: 'uptime',
    value: '99.9%',
    label: 'Uptime',
    description: 'When it matters most',
  },
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="border-y border-[hsl(var(--landing-border-subtle))] bg-[hsl(var(--landing-bg-card))] px-5 py-12">
      <div ref={ref} className="mx-auto max-w-[var(--landing-container-max)]">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[hsl(var(--landing-accent-primary))] sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-lg font-semibold text-[hsl(var(--landing-text-primary))]">
                {stat.label}
              </div>
              <div className="text-sm text-[hsl(var(--landing-text-muted))]">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
