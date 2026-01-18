import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/api';

interface CheckInLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function CheckInLayout({ children, params }: CheckInLayoutProps) {
  const { orgId: orgIdentifier } = await params;

  // Require check-in related roles (owner, admin, manager, box_office, scanner)
  // Box office staff may need to check in walk-up customers
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'box_office', 'scanner']);
  if (!auth) {
    notFound();
  }

  return <>{children}</>;
}
