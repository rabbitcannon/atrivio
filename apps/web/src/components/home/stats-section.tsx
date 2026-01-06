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
  return (
    <section className="border-y border-[hsl(var(--landing-border-subtle))] bg-[hsl(var(--landing-bg-card))] px-5 py-12">
      <div className="mx-auto max-w-[var(--landing-container-max)]">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="text-4xl font-bold text-[hsl(var(--landing-accent-primary))] sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-lg font-semibold text-[hsl(var(--landing-text-primary))]">
                {stat.label}
              </div>
              <div className="text-sm text-[hsl(var(--landing-text-muted))]">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
