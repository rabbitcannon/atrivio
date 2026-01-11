import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RefreshCw,
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
import type { TransactionStatus, TransactionType } from '@/lib/api';
import { getPaymentStatus, getTransactions, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Transactions',
};

interface TransactionsPageProps {
  params: Promise<{ orgId: string }>;
}

function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTypeIcon(type: TransactionType) {
  switch (type) {
    case 'charge':
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    case 'refund':
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    case 'transfer':
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusIcon(status: TransactionStatus) {
  switch (status) {
    case 'succeeded':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'refunded':
    case 'partially_refunded':
      return <RefreshCw className="h-4 w-4 text-orange-500" />;
    case 'disputed':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusBadgeVariant(
  status: TransactionStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'succeeded':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
    case 'disputed':
      return 'destructive';
    case 'refunded':
    case 'partially_refunded':
      return 'outline';
    default:
      return 'secondary';
  }
}

export default async function TransactionsPage({ params }: TransactionsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const [statusResult, transactionsResult] = await Promise.all([
    getPaymentStatus(orgId),
    getTransactions(orgId, { limit: 50 }),
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
          <AlertDescription>Connect your Stripe account to view transactions.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (transactionsResult.error) {
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
          <AlertTitle>Error loading transactions</AlertTitle>
          <AlertDescription>
            {transactionsResult.error?.message || 'Failed to load transactions.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const transactions = transactionsResult.data?.data ?? [];
  const total = transactionsResult.data?.total ?? 0;

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
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">
          View all payment transactions, charges, and refunds.
        </p>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>{total} total transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No transactions yet. Transactions will appear here once customers make payments.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.description || '-'}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {transaction.customer_email || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <Badge variant={getStatusBadgeVariant(transaction.status)}>
                          {transaction.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={transaction.net_amount < 0 ? 'text-red-500' : ''}>
                        {formatCurrency(transaction.net_amount, transaction.currency)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
