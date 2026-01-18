import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/api';

interface PaymentsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function PaymentsLayout({
  children,
  params,
}: PaymentsLayoutProps) {
  const { orgId: orgIdentifier } = await params;

  // Payments requires owner, admin, or finance roles
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'finance']);
  if (!auth) {
    notFound();
  }

  return <>{children}</>;
}
