import type { ReactNode } from 'react';
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
      <div className="mx-auto max-w-[var(--landing-container-max)]">
        <h2 className="mb-12 text-center text-3xl font-bold text-[hsl(var(--landing-text-primary))] sm:text-4xl">
          {title}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.id}
              className="group rounded-xl border border-transparent bg-[hsl(var(--landing-bg-card))] p-6 transition-all duration-[var(--landing-transition-normal)] hover:-translate-y-1 hover:border-[hsl(var(--landing-accent-primary))] sm:p-8"
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
