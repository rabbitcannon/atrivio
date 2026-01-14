import { AlertCircle, Calendar, DollarSign, Ghost, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  AnimatedCardGrid,
  AnimatedContainer,
  AnimatedDashboardHeader,
  AnimatedQuickLink,
  AnimatedStatsGrid,
  DashboardTourPrompt,
  MyCheckoutsWidget,
  MyHoursWidget,
  MyScheduleWidget,
  RecentActivityWidget,
} from '@/components/features/dashboard';
import { TimeClockWidget } from '@/components/features/time-clock';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalyticsDashboard, getCurrentUserRole, getOrganization, getStaff, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Dashboard',
};

interface OrgDashboardPageProps {
  params: Promise<{ orgId: string }>;
}

// Roles that see the management/admin dashboard
const MANAGEMENT_ROLES = ['owner', 'admin', 'manager', 'hr', 'box_office', 'finance'];

export default async function OrgDashboardPage({ params }: OrgDashboardPageProps) {
  const { orgId: orgIdentifier } = await params;

  // Resolve the org identifier (could be slug or UUID) to an actual UUID
  const orgId = await resolveOrgId(orgIdentifier);

  if (!orgId) {
    notFound();
  }

  // Fetch organization data and user role in parallel
  const [orgResult, userRole] = await Promise.all([
    getOrganization(orgId),
    getCurrentUserRole(orgId),
  ]);

  // Check if user has management role
  const isManagement = userRole && MANAGEMENT_ROLES.includes(userRole);

  // For management users, also fetch staff data and analytics
  let staffResult = null;
  let analyticsResult = null;
  let hasError = !!orgResult.error;
  let errorMessage = orgResult.error?.message || null;

  if (isManagement) {
    [staffResult, analyticsResult] = await Promise.all([
      getStaff(orgId, { status: 'active' }),
      getAnalyticsDashboard(orgId, { period: 'month' }).catch(() => null),
    ]);
    if (staffResult.error) {
      hasError = true;
      errorMessage = staffResult.error.message || errorMessage;
    }
  }

  const orgSlug = orgResult.data?.slug || orgIdentifier;
  const orgName = orgResult.data?.name || 'your organization';

  // Management/Admin Dashboard
  if (isManagement) {
    const attractionCount = orgResult.data?.stats?.attraction_count ?? 0;
    const memberCount = orgResult.data?.stats?.member_count ?? 0;
    const staffCount = staffResult?.data?.meta?.total ?? 0;
    const monthlyRevenue = analyticsResult?.data?.summary?.grossRevenue ?? 0;

    const stats = [
      {
        title: 'Attractions',
        value: attractionCount.toString(),
        numericValue: attractionCount,
        description: 'Total attractions',
        icon: <Ghost className="h-4 w-4" />,
      },
      {
        title: 'Members',
        value: memberCount.toString(),
        numericValue: memberCount,
        description: 'Organization members',
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: 'Staff',
        value: staffCount.toString(),
        numericValue: staffCount,
        description: 'Active staff',
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: 'Revenue',
        value: `$${(monthlyRevenue / 100).toLocaleString()}`,
        numericValue: monthlyRevenue,
        formatType: 'currency' as const,
        description: 'This month',
        icon: <DollarSign className="h-4 w-4" />,
      },
    ];

    return (
      <AnimatedContainer>
        <AnimatedDashboardHeader
          title="Dashboard"
          subtitle={`Welcome back to ${orgName}! Here is your organization overview.`}
        />

        {/* Tour Prompt for first-time users */}
        <DashboardTourPrompt />

        {hasError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading data</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Failed to load dashboard data. Please try refreshing the page.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div id="dashboard-stats">
          <AnimatedStatsGrid stats={stats} />
        </div>

        {/* Recent Activity and Time Clock */}
        <AnimatedCardGrid className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" baseDelay={0.5}>
          <div id="dashboard-activity">
            <RecentActivityWidget orgId={orgId} />
          </div>

          <Card id="dashboard-quick-actions">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <AnimatedQuickLink
                href={`/${orgSlug}/attractions/new`}
                icon={<Ghost className="h-4 w-4" />}
              >
                Add New Attraction
              </AnimatedQuickLink>
              <AnimatedQuickLink
                href={`/${orgSlug}/staff/new`}
                icon={<Users className="h-4 w-4" />}
              >
                Add Staff Member
              </AnimatedQuickLink>
              <AnimatedQuickLink
                href={`/${orgSlug}/invitations`}
                icon={<Calendar className="h-4 w-4" />}
              >
                Send Invitation
              </AnimatedQuickLink>
            </CardContent>
          </Card>

          {/* Time Clock Widget */}
          <div id="dashboard-time-clock">
            <TimeClockWidget orgId={orgId} orgSlug={orgSlug} />
          </div>
        </AnimatedCardGrid>
      </AnimatedContainer>
    );
  }

  // Staff/Actor Dashboard (actors, scanner, and other non-management roles)
  return (
    <AnimatedContainer>
      <AnimatedDashboardHeader title="Dashboard" subtitle={`Welcome back to ${orgName}!`} />

      {/* Staff Widgets Grid */}
      <AnimatedCardGrid className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" baseDelay={0.1}>
        {/* Time Clock Widget - most important for staff */}
        <TimeClockWidget orgId={orgId} orgSlug={orgSlug} />

        {/* My Hours Widget - shows hours worked and estimated pay */}
        <MyHoursWidget orgId={orgId} orgSlug={orgSlug} />

        {/* My Schedule Widget */}
        <MyScheduleWidget orgId={orgId} orgSlug={orgSlug} />

        {/* My Checkouts Widget */}
        <MyCheckoutsWidget orgId={orgId} orgSlug={orgSlug} />
      </AnimatedCardGrid>

      {/* Quick Links for Staff */}
      <AnimatedCardGrid className="grid gap-4" baseDelay={0.5}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            <AnimatedQuickLink
              href={`/${orgSlug}/time/schedule`}
              icon={<Calendar className="h-4 w-4" />}
            >
              View Full Schedule
            </AnimatedQuickLink>
            <AnimatedQuickLink
              href={`/${orgSlug}/time/availability`}
              icon={<Calendar className="h-4 w-4" />}
            >
              Set Availability
            </AnimatedQuickLink>
            <AnimatedQuickLink href={`/${orgSlug}/time/swaps`} icon={<Users className="h-4 w-4" />}>
              Shift Swaps
            </AnimatedQuickLink>
            <AnimatedQuickLink href={`/${orgSlug}/time`} icon={<Ghost className="h-4 w-4" />}>
              Time Clock
            </AnimatedQuickLink>
          </CardContent>
        </Card>
      </AnimatedCardGrid>
    </AnimatedContainer>
  );
}
