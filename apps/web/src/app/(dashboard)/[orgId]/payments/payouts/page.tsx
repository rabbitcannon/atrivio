import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock,
  CreditCard,
  Landmark,
  Truck,
  XCircle,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PayoutStatus } from '@/lib/api';
import { getPaymentStatus, getPayouts, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Payouts',
};

interface PayoutsPageProps {
  params: Promise<{ orgId: string }>;
}

function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusIcon(status: PayoutStatus) {
  switch (status) {
    case 'paid':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'in_transit':
      return <Truck className="h-4 w-4 text-blue-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'canceled':
      return <Ban className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusBadgeVariant(
  status: PayoutStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'paid':
      return 'default';
    case 'pending':
    case 'in_transit':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'canceled':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getDestinationIcon(type: string | null) {
  switch (type) {
    case 'bank_account':
      return <Landmark className="h-4 w-4 text-muted-foreground" />;
    case 'card':
      return <CreditCard className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Landmark className="h-4 w-4 text-muted-foreground" />;
  }
}

export default async function PayoutsPage({ params }: PayoutsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const [statusResult, payoutsResult] = await Promise.all([
    getPaymentStatus(orgId),
    getPayouts(orgId, { limit: 50 }),
  ]);

  if (statusResult.error || !statusResult.data?.is_connected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${orgIdentifier}/payments`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payments
            </Link>
          </Button>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Stripe not connected</AlertTitle>
          <AlertDescription>Connect your Stripe account to view payouts.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!statusResult.data?.payouts_enabled) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${orgIdentifier}/payments`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payments
            </Link>
          </Button>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payouts not enabled</AlertTitle>
          <AlertDescription>Complete your Stripe account setup to enable payouts.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (payoutsResult.error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${orgIdentifier}/payments`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payments
            </Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading payouts</AlertTitle>
          <AlertDescription>
            {payoutsResult.error?.message || 'Failed to load payouts.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const payouts = payoutsResult.data?.data ?? [];
  const total = payoutsResult.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${orgIdentifier}/payments`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Link>
        </Button>
      </div>

      <AnimatedPageHeader>
        <h1 className="text-3xl font-bold">Payouts</h1>
        <p className="text-muted-foreground">
          View payout history and upcoming transfers to your bank.
        </p>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>{total} total payouts</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No payouts yet. Payouts are automatically scheduled based on your Stripe settings.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Arrival Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payout.status)}
                        <Badge variant={getStatusBadgeVariant(payout.status)}>
                          {payout.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDestinationIcon(payout.destination_type)}
                        <span>
                          {payout.destination_type === 'bank_account' ? 'Bank' : 'Card'}
                          {payout.destination_last4 && ` ••••${payout.destination_last4}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{payout.method || 'Standard'}</TableCell>
                    <TableCell>{formatDate(payout.arrival_date)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payout.amount, payout.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(payout.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {payouts.some((p) => p.failure_message) && (
            <div className="mt-4 space-y-2">
              {payouts
                .filter((p) => p.failure_message)
                .map((payout) => (
                  <Alert key={payout.id} variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Payout Failed</AlertTitle>
                    <AlertDescription>
                      {payout.failure_message}
                      {payout.failure_code && ` (${payout.failure_code})`}
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          )}
        </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
