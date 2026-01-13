import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { TimeManager } from '@/components/features/staff/time-manager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/motion';
import { getStaffMember, resolveOrgId } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Time Tracking',
};

// Roles that can approve time entries
const APPROVAL_ROLES = ['owner', 'admin', 'manager', 'hr'];

interface TimePageProps {
  params: Promise<{ orgId: string; staffId: string }>;
}

export default async function TimePage({ params }: TimePageProps) {
  const { orgId: orgIdentifier, staffId } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Fetch staff member to get time summary
  const { data: staffData, error: staffError } = await getStaffMember(orgId, staffId);

  // If staff member not found, show error
  if (staffError || !staffData) {
    return (
      <div className="space-y-6">
        <AnimatedPageHeader className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href={`/${orgIdentifier}/staff`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to staff</span>
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Time Tracking</h1>
          </div>
        </AnimatedPageHeader>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Staff Member Not Found</AlertTitle>
          <AlertDescription>
            {staffError?.message || 'The staff member could not be found. They may have been removed or you may not have permission to view their time entries.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const timeSummary = staffData.time_summary;

  // Get current user's role to determine if they can approve
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let canApprove = false;
  if (user) {
    const { data: membership } = await supabase
      .from('org_memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', orgId)
      .eq('status', 'active')
      .single();

    canApprove = membership ? APPROVAL_ROLES.includes(membership.role) : false;
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href={`/${orgIdentifier}/staff/${staffId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to staff profile</span>
          </a>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-muted-foreground">View and manage time entries.</p>
        </div>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <TimeManager
          orgId={orgId}
          staffId={staffId}
          timeSummary={timeSummary}
          canApprove={canApprove}
        />
      </FadeIn>
    </div>
  );
}
