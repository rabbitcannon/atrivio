interface ScaleFeature {
  title: string;
  description: string;
  accentColor: 'primary' | 'secondary';
}

const features: ScaleFeature[] = [
  {
    title: 'Marketing Growth',
    accentColor: 'secondary',
    description:
      'Includes branded landing pages for each haunt, email marketing integrations, and social media pixel tracking (Facebook, TikTok, GA4).',
  },
  {
    title: 'Enterprise Control',
    accentColor: 'primary',
    description:
      'Manage via Role-Based Access Control (RBAC) for fine-grained permissions and comprehensive audit logging to track changes.',
  },
  {
    title: 'Data Insights',
    accentColor: 'secondary',
    description:
      'Reporting on customer demographics, returning vs new guests, ticket type popularity, and staffing efficiency.',
  },
];

export function ScaleSection() {
  return (
    <section className="bg-[hsl(var(--landing-bg-darkest))] px-5 py-[var(--landing-section-spacing)]">
      <div className="mx-auto max-w-[var(--landing-container-max)]">
        <h2 className="mb-12 text-center text-3xl font-bold text-[hsl(var(--landing-text-primary))] sm:text-4xl">
          Built for Scale, Security, and Growth
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={index}
              className="rounded-xl bg-[hsl(var(--landing-bg-card))] p-6 transition-all duration-[var(--landing-transition-normal)] hover:-translate-y-1 sm:p-8"
              style={{
                borderTop: `3px solid hsl(var(--landing-accent-${feature.accentColor}))`,
              }}
            >
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
