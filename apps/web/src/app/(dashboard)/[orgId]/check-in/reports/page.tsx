import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { ReportsContent } from './reports-content';

export const metadata: Metadata = {
  title: 'Check-In Reports',
};

interface ReportsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Only owner, admin, and manager can view reports (not scanners)
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);

  return <ReportsContent orgId={orgId} />;
}
