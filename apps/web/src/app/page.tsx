import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to avoid motion library hydration issues
const LandingContent = dynamic(
  () => import('@/components/home/landing-content').then((mod) => mod.LandingContent),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Atrivio | The Complete Attractions Management Platform',
  description:
    'All-in-one platform for haunted attractions, escape rooms, theme parks, and entertainment venues. Manage ticketing, staff scheduling, check-in, and payments from a single dashboard.',
  keywords: [
    'haunted attraction software',
    'escape room management',
    'theme park ticketing',
    'attraction management platform',
    'staff scheduling software',
    'event ticketing system',
    'venue management',
  ],
  openGraph: {
    title: 'Atrivio | The Complete Attractions Management Platform',
    description:
      'All-in-one platform for haunted attractions, escape rooms, theme parks, and entertainment venues.',
    type: 'website',
  },
};

export default function HomePage() {
  return <LandingContent />;
}
