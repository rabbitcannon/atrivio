import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { OrdersContent } from './orders-content';

export const metadata: Metadata = {
  title: 'Orders',
};

interface OrdersPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Orders requires owner, admin, manager, box_office, or finance roles
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'box_office', 'finance']);

  return <OrdersContent orgId={orgId} />;
}
