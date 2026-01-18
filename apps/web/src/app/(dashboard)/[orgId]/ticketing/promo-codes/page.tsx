import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { PromoCodesContent } from './promo-codes-content';

export const metadata: Metadata = {
  title: 'Promo Codes',
};

interface PromoCodesPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function PromoCodesPage({ params }: PromoCodesPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Promo codes: owner/admin/manager can manage, box_office/finance have read-only access
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'box_office', 'finance']);

  return <PromoCodesContent orgId={orgId} />;
}
