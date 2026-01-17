import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { ShiftsContent } from './shifts-content';

export const metadata: Metadata = {
  title: 'All Shifts',
};

interface ShiftsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function ShiftsPage({ params }: ShiftsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Only owner, admin, and manager can view all shifts
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);

  return <ShiftsContent orgIdentifier={orgIdentifier} />;
}
