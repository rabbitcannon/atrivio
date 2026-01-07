import { FloorPlan } from './illustrations/floor-plan';

interface OperationFeature {
  id: string;
  title: string;
  description: string;
}

const features: OperationFeature[] = [
  {
    id: 'scene-mapping',
    title: 'Scene Mapping',
    description:
      'Define scenes and which actor roles appear in them to preview nightly staffing distribution.',
  },
  {
    id: 'costume-inventory',
    title: 'Costume Inventory',
    description: 'Database to list all costumes and track assignments to staff on specific nights.',
  },
  {
    id: 'safety-planning',
    title: 'Safety Planning',
    description:
      'Track exits, lights, cameras, and evacuation routes directly on your digital floor plan.',
  },
];

export function OperationsSection() {
  return (
    <section
      id="operations"
      className="bg-[hsl(var(--landing-bg-dark))] px-5 py-[var(--landing-section-spacing)]"
    >
      <div className="mx-auto max-w-[var(--landing-container-max)] text-center">
        <h2 className="mb-5 text-3xl font-bold text-[hsl(var(--landing-text-primary))] sm:text-4xl">
          Design Your Haunt Digitally Before Opening Night
        </h2>

        <p className="mx-auto mb-12 max-w-2xl text-lg text-[hsl(var(--landing-text-muted))]">
          Use the Attraction Studio to build digital floor plans, place actor positions, and map
          scenes to preview nightly distributions and safety routes.
        </p>

        <div className="mb-12">
          <FloorPlan />
        </div>

        <div className="grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.id}
              className="rounded-xl bg-[hsl(var(--landing-bg-card))] p-6 transition-all duration-[var(--landing-transition-normal)] hover:-translate-y-1 sm:p-8"
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
