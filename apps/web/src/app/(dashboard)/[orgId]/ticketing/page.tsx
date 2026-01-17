import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { TicketingContent } from './ticketing-content';

export const metadata: Metadata = {
  title: 'Ticketing',
};

interface TicketingPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function TicketingPage({ params }: TicketingPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Ticketing requires owner, admin, manager, box_office, or finance roles
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'box_office', 'finance']);

  return <TicketingContent orgId={orgId} orgIdentifier={orgIdentifier} />;
}
