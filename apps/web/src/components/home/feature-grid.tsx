'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/utils/cn';

interface Feature {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

interface FeatureGridProps {
  title: string;
  features: Feature[];
  variant?: 'default' | 'alt';
  id?: string;
}

export function FeatureGrid({
  title,
  features,
  variant = 'default',
  id,
}: FeatureGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id={id}
      className={cn(
        'px-5 py-[var(--landing-section-spacing)]',
        variant === 'alt'
          ? 'bg-[hsl(var(--landing-bg-dark))]'
          : 'bg-[hsl(var(--landing-bg-darkest))]'
      )}
    >
      <div ref={ref} className="mx-auto max-w-[var(--landing-container-max)]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-12 text-center text-3xl font-bold text-[hsl(var(--landing-text-primary))] sm:text-4xl"
        >
          {title}
        </motion.h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group rounded-xl border border-transparent bg-[hsl(var(--landing-bg-card))] p-6 transition-colors duration-[var(--landing-transition-normal)] hover:border-[hsl(var(--landing-accent-primary))] sm:p-8"
            >
              <div className="mb-5 text-4xl text-[hsl(var(--landing-accent-primary))]">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-[hsl(var(--landing-text-primary))]">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-[hsl(var(--landing-text-muted))]">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
