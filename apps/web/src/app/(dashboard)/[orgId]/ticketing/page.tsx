import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Ticket, Clock, Tag, ShoppingCart, DollarSign, TrendingUp, Package, Percent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Ticketing',
};

interface TicketingPageProps {
  params: Promise<{ orgId: string }>;
}

const NAV_ITEMS = [
  {
    title: 'Ticket Types',
    description: 'Configure ticket types, pricing, and availability',
    href: '/ticketing/types',
    icon: Ticket,
  },
  {
    title: 'Time Slots',
    description: 'Manage timed entry slots and capacity',
    href: '/ticketing/slots',
    icon: Clock,
  },
  {
    title: 'Orders',
    description: 'View and manage ticket orders',
    href: '/ticketing/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Promo Codes',
    description: 'Create and manage promotional codes',
    href: '/ticketing/promo-codes',
    icon: Percent,
  },
];

export default async function TicketingPage({ params }: TicketingPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ticketing</h1>
        <p className="text-muted-foreground">
          Manage ticket types, time slots, orders, and promotions.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Tickets sold today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$--</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Types</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Promos</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Promo codes</p>
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
