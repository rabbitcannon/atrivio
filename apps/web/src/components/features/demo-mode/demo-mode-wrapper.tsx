'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { DemoModeBadge } from './demo-mode-banner';

// Demo organization slugs that should show the demo indicator
const DEMO_ORG_SLUGS = [
  'spooky-hollow',
  'nightmare-manor',
  'terror-collective',
];

/**
 * Wrapper component that shows demo mode indicator when appropriate.
 * Shows the badge when:
 * - URL has ?demo=true parameter
 * - Current org is a known demo organization
 */
export function DemoModeWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();

  const orgId = params['orgId'] as string | undefined;
  const isDemoParam = searchParams.get('demo') === 'true';
  const isDemoOrg = orgId ? DEMO_ORG_SLUGS.includes(orgId.toLowerCase()) : false;

  // Show demo badge if explicitly enabled or if viewing a demo org
  if (!isDemoParam && !isDemoOrg) {
    return null;
  }

  return <DemoModeBadge />;
}
