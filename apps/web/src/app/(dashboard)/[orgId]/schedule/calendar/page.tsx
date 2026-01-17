import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { CalendarContent } from './calendar-content';

export const metadata: Metadata = {
  title: 'Week View',
};

interface CalendarPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Only owner, admin, and manager can view the schedule calendar
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);

  return <CalendarContent orgIdentifier={orgIdentifier} />;
}
