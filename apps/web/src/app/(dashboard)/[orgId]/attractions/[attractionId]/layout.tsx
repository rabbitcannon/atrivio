import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/api';

interface AttractionDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string; attractionId: string }>;
}

export default async function AttractionDetailLayout({
  children,
  params,
}: AttractionDetailLayoutProps) {
  const { orgId: orgIdentifier } = await params;

  // Attraction management requires owner, admin, or manager roles
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);
  if (!auth) {
    notFound();
  }

  return <>{children}</>;
}
