import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { TicketTypesContent } from './types-content';

export const metadata: Metadata = {
  title: 'Ticket Types',
};

interface TicketTypesPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function TicketTypesPage({ params }: TicketTypesPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Ticket type configuration requires owner, admin, or manager roles
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);

  return <TicketTypesContent />;
}
