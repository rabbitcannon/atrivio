'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  ArrowUpDown,
  Building2,
  Calendar,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getRevenueSummary,
  getRevenueByOrg,
  getRevenueTrend,
  syncAllTransactions,
  type RevenueSummary,
  type RevenueByOrg,
  type RevenueTrend,
  type SyncTransactionsResult,
} from '@/lib/api/admin';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatPercent(percent: number): string {
  return `${percent.toFixed(1)}%`;
}

// Simple bar chart component
function SimpleBarChart({ data }: { data: RevenueTrend['trend'] }) {
  if (data.length === 0) return null;

  const maxFees = Math.max(...data.map((d) => d.platform_fees), 1);

  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((day, i) => {
        const height = (day.platform_fees / maxFees) * 100;
        const isToday = i === data.length - 1;
        return (
          <div
            key={day.date}
            className="group relative flex-1"
            title={`${day.date}: ${formatCurrency(day.platform_fees)}`}
          >
            <div
              className={`w-full rounded-t transition-colors ${
                isToday ? 'bg-primary' : 'bg-primary/40 hover:bg-primary/60'
              }`}
              style={{ height: `${Math.max(height, 2)}%` }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
              <div className="rounded bg-popover px-2 py-1 text-xs shadow-lg whitespace-nowrap">
                <div className="font-medium">{formatCurrency(day.platform_fees)}</div>
                <div className="text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminRevenuePage() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [byOrg, setByOrg] = useState<RevenueByOrg | null>(null);
  const [trend, setTrend] = useState<RevenueTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncTransactionsResult | null>(null);

  async function fetchData() {
    try {
      const [summaryRes, byOrgRes, trendRes] = await Promise.all([
        getRevenueSummary(),
        getRevenueByOrg({ limit: 10 }),
        getRevenueTrend(30),
      ]);

      if (summaryRes.error) throw new Error(summaryRes.error.message);
      if (byOrgRes.error) throw new Error(byOrgRes.error.message);
      if (trendRes.error) throw new Error(trendRes.error.message);

      setSummary(summaryRes.data!);
      setByOrg(byOrgRes.data!);
      setTrend(trendRes.data!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue data');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSync() {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncAllTransactions();
      if (result.error) throw new Error(result.error.message);
      setSyncResult(result.data!);
      // Refresh data after sync
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync transactions');
    } finally {
      setIsSyncing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="mt-2 h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Revenue</h1>
          <p className="text-muted-foreground">View platform fee revenue across all organizations</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading revenue data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Platform Fees',
      value: formatCurrency(summary?.summary.total_platform_fees ?? 0),
      description: 'All-time platform revenue',
      icon: DollarSign,
      iconColor: 'text-green-500',
    },
    {
      title: 'This Month',
      value: formatCurrency(summary?.periods.this_month.fees ?? 0),
      description: 'Revenue this calendar month',
      icon: Calendar,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Last 7 Days',
      value: formatCurrency(summary?.periods.last_7_days.fees ?? 0),
      description: `${formatNumber(summary?.periods.last_7_days.transactions ?? 0)} transactions`,
      icon: TrendingUp,
      iconColor: 'text-purple-500',
    },
    {
      title: 'Total Gross Volume',
      value: formatCurrency(summary?.summary.total_gross_volume ?? 0),
      description: `${formatNumber(summary?.summary.total_transactions ?? 0)} total transactions`,
      icon: ArrowUpDown,
      iconColor: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Revenue</h1>
          <p className="text-muted-foreground">
            View platform fee revenue collected from all organizations
          </p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync from Stripe'}
        </Button>
      </div>

      {/* Sync Result Alert */}
      {syncResult && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Sync Complete</AlertTitle>
          <AlertDescription>
            {syncResult.message}. Found {syncResult.application_fees_found} platform fees
            from {syncResult.connected_accounts} connected accounts.
            {syncResult.errors && syncResult.errors.length > 0 && (
              <span className="text-destructive"> ({syncResult.errors.length} errors)</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Period Comparison
          </CardTitle>
          <CardDescription>Platform fees collected across different time periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Today</div>
              <div className="mt-1 text-2xl font-bold">
                {formatCurrency(summary?.periods.today.fees ?? 0)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatNumber(summary?.periods.today.transactions ?? 0)} transactions
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Last 7 Days</div>
              <div className="mt-1 text-2xl font-bold">
                {formatCurrency(summary?.periods.last_7_days.fees ?? 0)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatNumber(summary?.periods.last_7_days.transactions ?? 0)} transactions
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Last 30 Days</div>
              <div className="mt-1 text-2xl font-bold">
                {formatCurrency(summary?.periods.last_30_days.fees ?? 0)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatNumber(summary?.periods.last_30_days.transactions ?? 0)} transactions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Revenue Trend
          </CardTitle>
          <CardDescription>Platform fees collected over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {trend && trend.trend.length > 0 ? (
            <SimpleBarChart data={trend.trend} />
          ) : (
            <p className="text-sm text-muted-foreground">No transaction data available</p>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Revenue by Organization
          </CardTitle>
          <CardDescription>Top organizations by platform fees generated</CardDescription>
        </CardHeader>
        <CardContent>
          {byOrg && byOrg.organizations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead className="text-right">Platform Fees</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Gross Volume</TableHead>
                  <TableHead className="text-right">Fee Rate</TableHead>
                  <TableHead className="text-right">Avg Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byOrg.organizations.map((org) => (
                  <TableRow key={org.org_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/organizations/${org.org_id}`}
                          className="font-medium hover:underline"
                        >
                          {org.org_name}
                        </Link>
                        {org.stripe_account_id ? (
                          <Badge variant="secondary" className="text-xs">
                            Stripe
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            No Stripe
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{org.org_slug}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(org.total_platform_fees)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(org.total_transactions)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(org.total_gross_volume)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{formatPercent(org.platform_fee_percent)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {org.total_transactions > 0
                        ? formatCurrency(org.avg_transaction_amount)
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No organizations with transaction data yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
