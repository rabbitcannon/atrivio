import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { BillingContent } from './billing-content';

export const metadata: Metadata = {
  title: 'Billing & Subscription',
};

interface BillingPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function BillingPage({ params }: BillingPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Billing requires owner or admin roles only
  await requireRole(orgIdentifier, ['owner', 'admin']);

  return <BillingContent />;
}
