import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { AnalyticsContent } from './analytics-content';

export const metadata: Metadata = {
  title: 'Analytics',
};

interface AnalyticsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Analytics requires owner, admin, manager, or finance roles
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'finance']);

  return <AnalyticsContent orgId={orgId} />;
}
