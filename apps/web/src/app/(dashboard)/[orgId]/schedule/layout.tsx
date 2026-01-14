import { notFound } from 'next/navigation';
import { UpgradePrompt } from '@/components/features/upgrade-prompt';
import { isFeatureEnabled, requireRole } from '@/lib/api';

interface ScheduleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function ScheduleLayout({ children, params }: ScheduleLayoutProps) {
  const { orgId: orgIdentifier } = await params;

  // Require owner, admin, or manager role
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);
  if (!auth) {
    notFound();
  }

  const { orgId } = auth;

  // Check if scheduling feature is enabled (Pro tier)
  const hasScheduling = await isFeatureEnabled(orgId, 'scheduling');

  // Show upgrade prompt if feature not enabled
  if (!hasScheduling) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">Manage staff shifts and availability.</p>
        </div>
        <UpgradePrompt
          feature="Staff Scheduling"
          description="Create and manage staff shifts, track availability, handle swap requests, and use shift templates."
          requiredTier="pro"
        />
      </div>
    );
  }

  return <>{children}</>;
}
