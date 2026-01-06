'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="bg-[hsl(var(--landing-bg-darkest))] px-5 py-[var(--landing-section-spacing)]">
      <div ref={ref} className="mx-auto max-w-[var(--landing-container-max)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-[hsl(var(--landing-text-primary))] sm:text-4xl">
            Trusted by Leading Attractions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[hsl(var(--landing-text-muted))]">
            See what operators like you are saying about Atrivio.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + index * 0.15,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-[hsl(var(--landing-bg-card))] p-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + index * 0.15,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="mb-6"
              >
                <svg
                  className="h-8 w-8 text-[hsl(var(--landing-accent-primary)/0.5)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </motion.div>

              <blockquote className="mb-6 text-lg leading-relaxed text-[hsl(var(--landing-text-muted))]">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <footer className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + index * 0.15,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--landing-accent-primary))] font-semibold text-white"
                >
                  {testimonial.avatar}
                </motion.div>
                <div>
                  <div className="font-semibold text-[hsl(var(--landing-text-primary))]">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-[hsl(var(--landing-text-muted))]">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </footer>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
