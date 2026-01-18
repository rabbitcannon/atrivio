import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/api';

interface NotificationsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function NotificationsLayout({
  children,
  params,
}: NotificationsLayoutProps) {
  const { orgId: orgIdentifier } = await params;

  // Notifications requires owner, admin, manager, or finance roles
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'finance']);
  if (!auth) {
    notFound();
  }

  return <>{children}</>;
}
