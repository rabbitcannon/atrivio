import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { TimeSlotsContent } from './slots-content';

export const metadata: Metadata = {
  title: 'Time Slots',
};

interface TimeSlotsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function TimeSlotsPage({ params }: TimeSlotsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Time slot configuration requires owner, admin, or manager roles
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);

  return <TimeSlotsContent />;
}
