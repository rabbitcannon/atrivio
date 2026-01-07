'use client';

import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { AlertTriangle, ArrowRightLeft, CheckCircle2, Clock, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getInventoryCheckouts,
  getOverdueCheckouts,
  type InventoryCheckout,
} from '@/lib/api/client';
import { CheckoutFormDialog } from './checkout-form-dialog';
import { ReturnDialog } from './return-dialog';

interface CheckoutsListProps {
  orgId: string;
}

interface CheckoutStats {
  active: number;
  overdue: number;
  returnedToday: number;
}

export function CheckoutsList({ orgId }: CheckoutsListProps) {
  const [activeCheckouts, setActiveCheckouts] = useState<InventoryCheckout[]>([]);
  const [overdueCheckouts, setOverdueCheckouts] = useState<InventoryCheckout[]>([]);
  const [returnedCheckouts, setReturnedCheckouts] = useState<InventoryCheckout[]>([]);
  const [stats, setStats] = useState<CheckoutStats>({ active: 0, overdue: 0, returnedToday: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  // Dialog states
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<InventoryCheckout | null>(null);

  const loadCheckouts = useCallback(async () => {
    setLoading(true);

    const [activeRes, overdueRes, returnedRes] = await Promise.all([
      getInventoryCheckouts(orgId, { activeOnly: true }),
      getOverdueCheckouts(orgId),
      getInventoryCheckouts(orgId, { activeOnly: false }),
    ]);

    if (activeRes.data?.checkouts) setActiveCheckouts(activeRes.data.checkouts);
    if (overdueRes.data?.checkouts) setOverdueCheckouts(overdueRes.data.checkouts);

    // Filter for returned items (those with returned_at set)
    const allCheckouts = returnedRes.data?.checkouts || [];
    const returned = allCheckouts.filter((c) => c.returned_at);
    setReturnedCheckouts(returned);

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const returnedToday =
      returned.filter((c) => c.returned_at?.startsWith(today || '')).length || 0;

    setStats({
      active: activeRes.data?.checkouts?.length || 0,
      overdue: overdueRes.data?.checkouts?.length || 0,
      returnedToday,
    });

    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    loadCheckouts();
  }, [loadCheckouts]);

  const handleReturn = (checkout: InventoryCheckout) => {
    setSelectedCheckout(checkout);
    setReturnDialogOpen(true);
  };

  const handleCheckoutSaved = () => {
    setCheckoutDialogOpen(false);
    loadCheckouts();
  };

  const handleReturnSaved = () => {
    setReturnDialogOpen(false);
    setSelectedCheckout(null);
    loadCheckouts();
  };

  const isOverdue = (checkout: InventoryCheckout) => {
    if (!checkout.due_date) return false;
    return isPast(parseISO(checkout.due_date)) && !checkout.returned_at;
  };

  const renderCheckoutTable = (checkouts: InventoryCheckout[], showReturnButton: boolean) => {
    if (checkouts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <ArrowRightLeft className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No checkouts found</p>
          <p className="text-sm">
            {showReturnButton
              ? 'Check out items to staff members.'
              : 'Returned items will appear here.'}
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Checked Out</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Condition</TableHead>
            {showReturnButton && <TableHead className="w-[100px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {checkouts.map((checkout) => (
            <TableRow key={checkout.id}>
              <TableCell className="font-medium">
                {checkout.item?.name || 'Unknown Item'}
                <div className="text-xs text-muted-foreground">{checkout.item?.sku}</div>
              </TableCell>
              <TableCell>
                {checkout.checked_out_by_user
                  ? `${checkout.checked_out_by_user.first_name} ${checkout.checked_out_by_user.last_name}`
                  : 'Unknown'}
              </TableCell>
              <TableCell>{checkout.quantity}</TableCell>
              <TableCell>
                {formatDistanceToNow(parseISO(checkout.checked_out_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                {checkout.due_date ? (
                  <div className="flex items-center gap-2">
                    {isOverdue(checkout) && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    <span className={isOverdue(checkout) ? 'text-destructive' : ''}>
                      {new Date(checkout.due_date).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {checkout.condition_out || 'Unknown'}
                </Badge>
              </TableCell>
              {showReturnButton && (
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleReturn(checkout)}>
                    <RotateCcw className="mr-2 h-3 w-3" />
                    Return
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently checked out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {loading ? '—' : stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Returned Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : stats.returnedToday}</div>
            <p className="text-xs text-muted-foreground">Items returned</p>
          </CardContent>
        </Card>
      </div>

      {/* New Checkout Button */}
      <div className="flex justify-end">
        <Button onClick={() => setCheckoutDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Checkout
        </Button>
      </div>

      {/* Checkouts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active
            {stats.active > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.active}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            {stats.overdue > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.overdue}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="returned">Returned</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Active Checkouts
              </CardTitle>
              <CardDescription>Items currently checked out to staff members.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                renderCheckoutTable(activeCheckouts, true)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Overdue Checkouts
              </CardTitle>
              <CardDescription>Items that are past their due date for return.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                renderCheckoutTable(overdueCheckouts, true)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returned">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Returned Items
              </CardTitle>
              <CardDescription>History of returned checkouts.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                renderCheckoutTable(returnedCheckouts, false)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CheckoutFormDialog
        orgId={orgId}
        open={checkoutDialogOpen}
        onOpenChange={setCheckoutDialogOpen}
        onSaved={handleCheckoutSaved}
      />

      <ReturnDialog
        orgId={orgId}
        checkout={selectedCheckout}
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        onSaved={handleReturnSaved}
      />
    </div>
  );
}
