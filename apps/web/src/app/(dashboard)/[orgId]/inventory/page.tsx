import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InventoryDashboard } from '@/components/features/inventory';
import { requireRole, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Inventory',
};

interface InventoryPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function InventoryPage({ params }: InventoryPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Owners, admins, managers, and actors can access inventory (actors for checkouts)
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'actor']);

  return <InventoryDashboard orgId={orgId} orgIdentifier={orgIdentifier} />;
}
