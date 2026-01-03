import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  Users,
  Activity,
  Gauge,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MonitorSmartphone,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Check-In',
};

interface CheckInPageProps {
  params: Promise<{ orgId: string }>;
}

const NAV_ITEMS = [
  {
    title: 'Scan Tickets',
    description: 'Scan barcodes or QR codes to check in guests',
    href: '/check-in/scan',
    icon: QrCode,
  },
  {
    title: 'Stations',
    description: 'Manage check-in stations and devices',
    href: '/check-in/stations',
    icon: MonitorSmartphone,
  },
  {
    title: 'Queue',
    description: 'View pending arrivals and late guests',
    href: '/check-in/queue',
    icon: Clock,
  },
  {
    title: 'Reports',
    description: 'Check-in statistics and analytics',
    href: '/check-in/reports',
    icon: Activity,
  },
];

export default async function CheckInPage({ params }: CheckInPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Check-In</h1>
        <p className="text-muted-foreground">
          Manage guest check-ins, stations, and monitor capacity.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checked In Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Guests admitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Capacity</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--%</div>
            <p className="text-xs text-muted-foreground">Of max capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Arrivals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Expected today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Past their slot</p>
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
