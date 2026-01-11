'use client';

import {
  AlertTriangle,
  ArrowRightLeft,
  Box,
  ClipboardList,
  FolderTree,
  History,
  Package,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { Skeleton } from '@/components/ui/skeleton';
import { getInventorySummary, type InventorySummary } from '@/lib/api/client';

interface InventoryDashboardProps {
  orgId: string;
  orgIdentifier: string;
}

const NAV_ITEMS = [
  {
    title: 'Items',
    description: 'Manage costumes, props, equipment, and supplies',
    href: '/inventory/items',
    icon: Package,
  },
  {
    title: 'Categories',
    description: 'Organize items into hierarchical categories',
    href: '/inventory/categories',
    icon: FolderTree,
  },
  {
    title: 'Checkouts',
    description: 'Track items checked out to staff members',
    href: '/inventory/checkouts',
    icon: ArrowRightLeft,
  },
  {
    title: 'Transactions',
    description: 'View inventory transaction history',
    href: '/inventory/transactions',
    icon: History,
  },
];

export function InventoryDashboard({ orgId, orgIdentifier }: InventoryDashboardProps) {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    const { data } = await getInventorySummary(orgId);
    if (data) {
      setSummary(data);
    }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <div className="space-y-6">
      <AnimatedPageHeader>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Track costumes, props, equipment, and supplies across your attractions.
        </p>
      </AnimatedPageHeader>

      {/* Quick Stats */}
      <StaggerContainer className="grid gap-4 md:grid-cols-4" staggerDelay={0.05} delayChildren={0.1}>
        <StaggerItem>
          <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : (summary?.totalItems ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">Unique items tracked</p>
          </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : (summary?.activeCheckouts ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">Active checkouts</p>
          </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : (summary?.lowStockItems ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground">Items need reorder</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${(summary?.overdueCheckouts ?? 0) > 0 ? 'text-destructive' : ''}`}
              >
                {loading ? <Skeleton className="h-8 w-16" /> : (summary?.overdueCheckouts ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground">Past due checkouts</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Low Stock Alerts */}
      {summary?.lowStockAlerts && summary.lowStockAlerts.length > 0 && (
        <FadeIn delay={0.15}>
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <TrendingDown className="h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                These items are at or below their minimum quantity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.lowStockAlerts.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md bg-white/50 dark:bg-black/20 px-3 py-2"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{item.sku}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-destructive font-medium">{item.quantity}</span>
                      <span className="text-muted-foreground"> / {item.min_quantity} min</span>
                    </div>
                  </div>
                ))}
                {summary.lowStockAlerts.length > 5 && (
                  <Link
                    href={`/${orgIdentifier}/inventory/items?filter=low-stock`}
                    className="block text-sm text-orange-700 dark:text-orange-300 hover:underline"
                  >
                    View all {summary.lowStockAlerts.length} low stock items →
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Navigation Cards */}
      <FadeIn delay={0.2}>
        <div className="grid gap-4 md:grid-cols-2">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={`/${orgIdentifier}${item.href}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
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
      </FadeIn>
    </div>
  );
}
