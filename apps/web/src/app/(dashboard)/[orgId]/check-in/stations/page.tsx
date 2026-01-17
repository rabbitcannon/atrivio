import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { StationsContent } from './stations-content';

export const metadata: Metadata = {
  title: 'Check-In Stations',
};

interface StationsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function StationsPage({ params }: StationsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Only owner, admin, and manager can manage stations (not scanners)
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);

  return <StationsContent orgId={orgId} />;
}
