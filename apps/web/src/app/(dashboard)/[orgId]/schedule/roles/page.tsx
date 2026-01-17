import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { RolesContent } from './roles-content';

export const metadata: Metadata = {
  title: 'Schedule Roles',
};

interface RolesPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function ScheduleRolesPage({ params }: RolesPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Only owner, admin, and manager can view schedule roles
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);

  return <RolesContent orgId={orgId} />;
}
