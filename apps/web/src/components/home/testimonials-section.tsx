interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    quote:
      "Atrivio transformed how we run our haunted attraction. Scheduling that used to take hours now takes minutes, and our guests love the seamless check-in experience.",
    author: 'Sarah Mitchell',
    role: 'Owner',
    company: 'Nightmare Manor',
    avatar: 'SM',
  },
  {
    id: '2',
    quote:
      "We switched from three different systems to Atrivio. Having ticketing, staffing, and payments in one place has been a game-changer for our escape room business.",
    author: 'Marcus Chen',
    role: 'Operations Director',
    company: 'Escape Factory',
    avatar: 'MC',
  },
  {
    id: '3',
    quote:
      "The real-time capacity tracking has helped us optimize guest flow and reduce wait times by 40%. Our customers are happier and we're selling more tickets.",
    author: 'Emily Rodriguez',
    role: 'General Manager',
    company: 'Thrill Zone Entertainment',
    avatar: 'ER',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-[hsl(var(--landing-bg-darkest))] px-5 py-[var(--landing-section-spacing)]">
      <div className="mx-auto max-w-[var(--landing-container-max)]">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[hsl(var(--landing-text-primary))] sm:text-4xl">
            Trusted by Leading Attractions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[hsl(var(--landing-text-muted))]">
            See what operators like you are saying about Atrivio.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="rounded-2xl bg-[hsl(var(--landing-bg-card))] p-8"
            >
              <div className="mb-6">
                <svg
                  className="h-8 w-8 text-[hsl(var(--landing-accent-primary)/0.5)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              <blockquote className="mb-6 text-lg leading-relaxed text-[hsl(var(--landing-text-muted))]">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <footer className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--landing-accent-primary))] font-semibold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[hsl(var(--landing-text-primary))]">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-[hsl(var(--landing-text-muted))]">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
