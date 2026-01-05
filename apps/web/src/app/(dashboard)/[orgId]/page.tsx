import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ghost, Users, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { getOrganization, getStaff, resolveOrgId, getCurrentUserRole } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TimeClockWidget } from '@/components/features/time-clock';
import { MyScheduleWidget, MyCheckoutsWidget, MyHoursWidget } from '@/components/features/dashboard';

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

  // For management users, also fetch staff data
  let staffResult = null;
  let hasError = !!orgResult.error;
  let errorMessage = orgResult.error?.message || null;

  if (isManagement) {
    staffResult = await getStaff(orgId, { status: 'active' });
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

    const stats = [
      {
        title: 'Attractions',
        value: attractionCount.toString(),
        description: 'Total attractions',
        icon: Ghost,
      },
      {
        title: 'Members',
        value: memberCount.toString(),
        description: 'Organization members',
        icon: Users,
      },
      {
        title: 'Staff',
        value: staffCount.toString(),
        description: 'Active staff',
        icon: Users,
      },
      {
        title: 'Revenue',
        value: '$0',
        description: 'This month',
        icon: DollarSign,
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to {orgName}! Here is your organization overview.
          </p>
        </div>

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity and Time Clock */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity to display.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <a
                href={`/${orgSlug}/attractions/new`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <Ghost className="h-4 w-4" />
                Add New Attraction
              </a>
              <a
                href={`/${orgSlug}/staff/new`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <Users className="h-4 w-4" />
                Add Staff Member
              </a>
              <a
                href={`/${orgSlug}/invitations`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <Calendar className="h-4 w-4" />
                Send Invitation
              </a>
            </CardContent>
          </Card>

          {/* Time Clock Widget */}
          <TimeClockWidget orgId={orgId} orgSlug={orgSlug} />
        </div>
      </div>
    );
  }

  // Staff/Actor Dashboard (actors, scanner, and other non-management roles)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to {orgName}!</p>
      </div>

      {/* Staff Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Time Clock Widget - most important for staff */}
        <TimeClockWidget orgId={orgId} orgSlug={orgSlug} />

        {/* My Hours Widget - shows hours worked and estimated pay */}
        <MyHoursWidget orgId={orgId} orgSlug={orgSlug} />

        {/* My Schedule Widget */}
        <MyScheduleWidget orgId={orgId} orgSlug={orgSlug} />

        {/* My Checkouts Widget */}
        <MyCheckoutsWidget orgId={orgId} orgSlug={orgSlug} />
      </div>

      {/* Quick Links for Staff */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          <a
            href={`/${orgSlug}/time/schedule`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <Calendar className="h-4 w-4" />
            View Full Schedule
          </a>
          <a
            href={`/${orgSlug}/time/availability`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <Calendar className="h-4 w-4" />
            Set Availability
          </a>
          <a
            href={`/${orgSlug}/time/swaps`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <Users className="h-4 w-4" />
            Shift Swaps
          </a>
          <a
            href={`/${orgSlug}/time`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <Ghost className="h-4 w-4" />
            Time Clock
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
