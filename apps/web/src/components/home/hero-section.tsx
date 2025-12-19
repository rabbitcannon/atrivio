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
        <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-[hsl(var(--landing-text-primary))] sm:text-5xl lg:text-6xl">
          Command Your Entire Haunt Empire
          <br />
          from{' '}
          <span className="text-[hsl(var(--landing-accent-primary))]">
            One Platform.
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-[hsl(var(--landing-text-muted))] sm:text-xl">
          The operator-centric solution for managing multiple locations,
          staffing, ticketing, and financials under a single master account.
        </p>

        <a
          href="#demo"
          className="inline-block rounded-lg bg-[hsl(var(--landing-accent-primary))] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[hsl(var(--landing-glow-primary))] transition-all duration-[var(--landing-transition-normal)] hover:-translate-y-1 hover:bg-[hsl(var(--landing-accent-primary-hover))] hover:shadow-xl hover:shadow-[hsl(var(--landing-glow-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--landing-accent-primary))] focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(var(--landing-bg-darkest))]"
        >
          See the Platform in Action
        </a>

        <div className="mt-16 sm:mt-20">
          <DashboardViz />
        </div>
      </div>
    </section>
  );
}
