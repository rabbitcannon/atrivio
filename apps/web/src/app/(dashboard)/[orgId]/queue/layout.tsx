import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/api';

interface QueueLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function QueueLayout({
  children,
  params,
}: QueueLayoutProps) {
  const { orgId: orgIdentifier } = await params;

  // Queue management requires owner, admin, or manager roles
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);
  if (!auth) {
    notFound();
  }

  return <>{children}</>;
}
