'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  History,
  Package,
  ArrowRightLeft,
  Plus,
  Minus,
  AlertTriangle,
  Trash2,
  Filter,
  Download,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getInventoryTransactions,
  type InventoryTransaction,
} from '@/lib/api/client';
import { formatDistanceToNow, parseISO, format } from 'date-fns';

interface TransactionsListProps {
  orgId: string;
}

type TransactionType = 'purchase' | 'adjustment' | 'checkout' | 'return' | 'transfer' | 'damaged' | 'lost' | 'disposed';

const TRANSACTION_TYPES: { value: TransactionType; label: string; icon: typeof History }[] = [
  { value: 'purchase', label: 'Purchase', icon: Plus },
  { value: 'adjustment', label: 'Adjustment', icon: ArrowRightLeft },
  { value: 'checkout', label: 'Checkout', icon: Package },
  { value: 'return', label: 'Return', icon: Package },
  { value: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
  { value: 'damaged', label: 'Damaged', icon: AlertTriangle },
  { value: 'lost', label: 'Lost', icon: AlertTriangle },
  { value: 'disposed', label: 'Disposed', icon: Trash2 },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'purchase':
      return <Plus className="h-4 w-4 text-green-500" />;
    case 'adjustment':
      return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
    case 'checkout':
      return <Package className="h-4 w-4 text-orange-500" />;
    case 'return':
      return <Package className="h-4 w-4 text-green-500" />;
    case 'transfer':
      return <ArrowRightLeft className="h-4 w-4 text-purple-500" />;
    case 'damaged':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'lost':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'disposed':
      return <Trash2 className="h-4 w-4 text-muted-foreground" />;
    default:
      return <History className="h-4 w-4" />;
  }
}

function getQuantityDisplay(tx: InventoryTransaction) {
  const diff = (tx.new_qty ?? 0) - (tx.previous_qty ?? 0);
  if (diff > 0) {
    return <span className="text-green-600">+{diff}</span>;
  } else if (diff < 0) {
    return <span className="text-red-600">{diff}</span>;
  }
  return <span className="text-muted-foreground">0</span>;
}

export function TransactionsList({ orgId }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTransactions = useCallback(async () => {
    setLoading(true);

    const filters: Parameters<typeof getInventoryTransactions>[1] = {
      page,
      limit: 25,
    };

    if (typeFilter !== 'all') {
      filters.type = typeFilter;
    }

    const res = await getInventoryTransactions(orgId, filters);

    if (res.data) {
      setTransactions(res.data.transactions || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
    }

    setLoading(false);
  }, [orgId, page, typeFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter]);

  // Filter by search query (client-side for now)
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const itemName = tx.item?.name?.toLowerCase() || '';
    const itemSku = tx.item?.sku?.toLowerCase() || '';
    const reason = tx.reason?.toLowerCase() || '';
    return itemName.includes(query) || itemSku.includes(query) || reason.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by item, SKU, or reason..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType | 'all')}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TRANSACTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            All Transactions
            {!loading && (
              <Badge variant="secondary" className="ml-2">
                {total}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Purchases, adjustments, checkouts, returns, and other inventory movements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <History className="mb-4 h-12 w-12" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm">
                Transaction history will appear here as inventory changes are made.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-[100px]">Change</TableHead>
                    <TableHead className="w-[100px]">Qty After</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead className="w-[150px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <Badge variant="outline" className="capitalize">
                            {tx.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{tx.item?.name || 'Unknown Item'}</div>
                        <div className="text-xs text-muted-foreground">{tx.item?.sku}</div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {getQuantityDisplay(tx)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {tx.new_qty ?? '—'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {tx.reason || '—'}
                      </TableCell>
                      <TableCell>
                        {tx.performed_by_user
                          ? `${tx.performed_by_user.first_name} ${tx.performed_by_user.last_name}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(parseISO(tx.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(tx.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
