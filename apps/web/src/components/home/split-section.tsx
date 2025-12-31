import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface Feature {
  id: string;
  text: string;
}

interface SplitSectionProps {
  id?: string;
  title: ReactNode;
  description: string;
  features: Feature[];
  ctaText: string;
  ctaHref: string;
  illustration: ReactNode;
  reverse?: boolean;
  variant?: 'default' | 'alt';
}

export function SplitSection({
  id,
  title,
  description,
  features,
  ctaText,
  ctaHref,
  illustration,
  reverse = false,
  variant = 'default',
}: SplitSectionProps) {
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
      <div
        className={cn(
          'mx-auto flex max-w-[var(--landing-container-max)] flex-col items-center gap-12 lg:flex-row lg:gap-16',
          reverse && 'lg:flex-row-reverse'
        )}
      >
        {/* Text content */}
        <div className="flex-1">
          <h2 className="mb-5 text-3xl font-bold text-[hsl(var(--landing-text-primary))] sm:text-4xl">
            {title}
          </h2>

          <p className="mb-6 text-lg leading-relaxed text-[hsl(var(--landing-text-muted))]">
            {description}
          </p>

          <ul className="mb-8 space-y-4">
            {features.map((feature) => (
              <li
                key={feature.id}
                className="flex items-start gap-3 text-[hsl(var(--landing-text-muted))]"
              >
                <span
                  className="mt-0.5 font-bold text-[hsl(var(--landing-accent-secondary))]"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>

          <a
            href={ctaHref}
            className="inline-block rounded-lg bg-[hsl(var(--landing-accent-primary))] px-6 py-3 font-semibold text-white transition-all duration-[var(--landing-transition-normal)] hover:-translate-y-0.5 hover:bg-[hsl(var(--landing-accent-primary-hover))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--landing-accent-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--landing-bg-darkest))]"
          >
            {ctaText}
          </a>
        </div>

        {/* Illustration */}
        <div className="w-full flex-1 lg:w-auto">{illustration}</div>
      </div>
    </section>
  );
}
