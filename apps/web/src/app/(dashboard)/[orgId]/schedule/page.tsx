import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, List, Copy, Users, Clock, ArrowLeftRight, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Schedule',
};

interface SchedulePageProps {
  params: Promise<{ orgId: string }>;
}

const NAV_ITEMS = [
  {
    title: 'All Shifts',
    description: 'View and manage all scheduled shifts',
    href: '/schedule/shifts',
    icon: List,
  },
  {
    title: 'Week View',
    description: 'Visual calendar view of the schedule',
    href: '/schedule/calendar',
    icon: Calendar,
  },
  {
    title: 'Templates',
    description: 'Create reusable shift templates',
    href: '/schedule/templates',
    icon: Copy,
  },
  {
    title: 'Staff Availability',
    description: 'View team availability and time-off',
    href: '/schedule/availability',
    icon: Users,
  },
  {
    title: 'Swap Requests',
    description: 'Review and approve shift swap requests',
    href: '/schedule/swaps',
    icon: ArrowLeftRight,
  },
  {
    title: 'Roles',
    description: 'View schedule roles and color coding',
    href: '/schedule/roles',
    icon: Tag,
  },
];

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedule</h1>
        <p className="text-muted-foreground">
          Manage staff schedules, shifts, and availability.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Scheduled shifts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Shifts need coverage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Scheduled this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={`/${orgIdentifier}${item.href}`}>
            <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
