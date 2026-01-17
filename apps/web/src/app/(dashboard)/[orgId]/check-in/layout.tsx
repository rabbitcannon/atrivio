import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/api';

interface CheckInLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function CheckInLayout({ children, params }: CheckInLayoutProps) {
  const { orgId: orgIdentifier } = await params;

  // Require check-in related roles (owner, admin, manager, scanner)
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'scanner']);
  if (!auth) {
    notFound();
  }

  return <>{children}</>;
}
