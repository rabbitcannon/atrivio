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

  // Notifications requires owner, admin, manager, hr, or finance roles
  // HR can send notifications to staff
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'hr', 'finance']);
  if (!auth) {
    notFound();
  }

  return <>{children}</>;
}
