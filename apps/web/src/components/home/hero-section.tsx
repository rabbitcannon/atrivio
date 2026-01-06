'use client';

import { motion } from 'motion/react';
import { DashboardViz } from './illustrations/dashboard-viz';

export function HeroSection() {
  return (
    <section
      className="px-5 pb-20 pt-16 sm:pb-24 sm:pt-20"
      style={{
        background:
          'radial-gradient(ellipse at top, hsl(var(--landing-bg-dark)) 0%, hsl(var(--landing-bg-darkest)) 70%)',
      }}
    >
      <div className="mx-auto max-w-[var(--landing-container-max)] text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--landing-accent-primary)/0.3)] bg-[hsl(var(--landing-accent-primary)/0.1)] px-4 py-2 text-sm font-medium text-[hsl(var(--landing-accent-primary))]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--landing-accent-secondary))] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--landing-accent-secondary))]" />
          </span>
          Now with Virtual Queue Management
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-5 text-4xl font-bold leading-tight tracking-tight text-[hsl(var(--landing-text-primary))] sm:text-5xl lg:text-6xl"
        >
          The All-in-One Platform for
          <br />
          <span className="text-[hsl(var(--landing-accent-primary))]">
            Attractions & Entertainment
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-[hsl(var(--landing-text-muted))] sm:text-xl"
        >
          Ticketing, staff scheduling, check-in, and payments — everything you need
          to run haunted attractions, escape rooms, theme parks, and entertainment
          venues. All in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--landing-accent-primary))] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[hsl(var(--landing-glow-primary))] transition-all duration-[var(--landing-transition-normal)] hover:-translate-y-1 hover:bg-[hsl(var(--landing-accent-primary-hover))] hover:shadow-xl hover:shadow-[hsl(var(--landing-glow-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--landing-accent-primary))] focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(var(--landing-bg-darkest))]"
          >
            Start Free Trial
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-[hsl(var(--landing-border-subtle))] bg-transparent px-8 py-4 text-lg font-semibold text-[hsl(var(--landing-text-primary))] transition-all duration-[var(--landing-transition-normal)] hover:border-[hsl(var(--landing-accent-primary))] hover:text-[hsl(var(--landing-accent-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--landing-accent-primary))] focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(var(--landing-bg-darkest))]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
            Watch Demo
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-sm text-[hsl(var(--landing-text-muted))]"
        >
          No credit card required. 14-day free trial on all plans.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-16 sm:mt-20"
        >
          <DashboardViz />
        </motion.div>
      </div>
    </section>
  );
}
