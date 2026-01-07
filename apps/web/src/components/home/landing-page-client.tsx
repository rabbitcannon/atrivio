'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to avoid motion library hydration issues
// This must be in a Client Component for Next.js 15 compatibility
const LandingContent = dynamic(
  () => import('@/components/home/landing-content').then((mod) => mod.LandingContent),
  { ssr: false }
);

export function LandingPageClient() {
  return <LandingContent />;
}
