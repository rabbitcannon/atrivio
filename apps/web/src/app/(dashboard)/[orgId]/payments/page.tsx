import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  DollarSign,
  TrendingUp,
  ArrowUpDown,
  Wallet,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { resolveOrgId, getPaymentStatus, getTransactionSummary } from '@/lib/api';
import { StripeConnectButton } from '@/components/features/payments/stripe-connect-button';
import { RefreshStatusButton } from '@/components/features/payments/refresh-status-button';
import { AutoSyncStatus } from '@/components/features/payments/auto-sync-status';

export const metadata: Metadata = {
  title: 'Payments',
};

interface PaymentsPageProps {
  params: Promise<{ orgId: string }>;
}

function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function getStatusIcon(status: string | null) {
  switch (status) {
    case 'active':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'onboarding':
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'restricted':
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    case 'disabled':
      return <Ban className="h-5 w-5 text-red-500" />;
    default:
      return <CreditCard className="h-5 w-5 text-muted-foreground" />;
  }
}

function getStatusBadgeVariant(status: string | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'onboarding':
    case 'pending':
      return 'secondary';
    case 'restricted':
      return 'outline';
    case 'disabled':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default async function PaymentsPage({ params }: PaymentsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const [statusResult, summaryResult] = await Promise.all([
    getPaymentStatus(orgId),
    getTransactionSummary(orgId),
  ]);

  if (statusResult.error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading payment status</AlertTitle>
          <AlertDescription>
            {statusResult.error?.message || 'Failed to load payment information. Please try refreshing the page.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const accountStatus = statusResult.data;
  const summary = summaryResult.data;
  const isConnected = accountStatus?.is_connected ?? false;
  const isActive = accountStatus?.status === 'active';

  return (
    <div className="space-y-6">
      {/* Auto-sync status when returning from Stripe onboarding */}
      {isConnected && (
        <AutoSyncStatus orgId={orgId} currentStatus={accountStatus?.status ?? null} />
      )}

      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          Manage your Stripe Connect account and view financial data.
        </p>
      </div>

      {/* Stripe Account Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(accountStatus?.status ?? null)}
              <div>
                <CardTitle>Stripe Account</CardTitle>
                <CardDescription>
                  {isConnected
                    ? accountStatus?.business_name || 'Connected account'
                    : 'Connect your Stripe account to accept payments'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {accountStatus?.status && (
                <Badge variant={getStatusBadgeVariant(accountStatus.status)}>
                  {accountStatus.status.charAt(0).toUpperCase() + accountStatus.status.slice(1)}
                </Badge>
              )}
              {isConnected && (
                <RefreshStatusButton orgId={orgId} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your organization to Stripe to start accepting payments from customers.
                Stripe handles all payment processing, security, and compliance.
              </p>
              <StripeConnectButton orgId={orgId} mode="connect" />
            </div>
          ) : accountStatus?.needs_onboarding ? (
            <div className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Complete your setup</AlertTitle>
                <AlertDescription>
                  Your Stripe account setup is incomplete. Complete the onboarding process to start
                  accepting payments.
                </AlertDescription>
              </Alert>
              <StripeConnectButton orgId={orgId} mode="onboarding" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {accountStatus?.charges_enabled ? 'Accepting payments' : 'Payments disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {accountStatus?.payouts_enabled ? 'Payouts enabled' : 'Payouts disabled'}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <StripeConnectButton orgId={orgId} mode="dashboard" variant="outline" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Summary - Only show if connected and active */}
      {isActive && summary && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.total_charges)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gross charges collected
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.net_revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  After fees & refunds
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.total_refunds)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Refunded to customers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.transaction_count}</div>
                <p className="text-xs text-muted-foreground">
                  Total processed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Transactions
                </CardTitle>
                <CardDescription>
                  View all payment transactions, charges, and refunds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/${orgIdentifier}/payments/transactions`}>
                    View Transactions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Payouts
                </CardTitle>
                <CardDescription>
                  View payout history and upcoming transfers to your bank
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/${orgIdentifier}/payments/payouts`}>
                    View Payouts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
