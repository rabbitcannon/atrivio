import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/api';

interface StaffLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function StaffLayout({
  children,
  params,
}: StaffLayoutProps) {
  const { orgId: orgIdentifier } = await params;

  // Staff management requires owner, admin, manager, or hr roles
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'hr']);
  if (!auth) {
    notFound();
  }

  return <>{children}</>;
}
