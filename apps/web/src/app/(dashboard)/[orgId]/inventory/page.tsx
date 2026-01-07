import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InventoryDashboard } from '@/components/features/inventory';
import { resolveOrgId } from '@/lib/api';

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

  return <InventoryDashboard orgId={orgId} orgIdentifier={orgIdentifier} />;
}
