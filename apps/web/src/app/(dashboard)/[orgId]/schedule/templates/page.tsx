import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole, resolveOrgId } from '@/lib/api';
import { TemplatesContent } from './templates-content';

export const metadata: Metadata = {
  title: 'Shift Templates',
};

interface TemplatesPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function TemplatesPage({ params }: TemplatesPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Only owner, admin, and manager can manage shift templates
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);

  return <TemplatesContent orgIdentifier={orgIdentifier} />;
}
