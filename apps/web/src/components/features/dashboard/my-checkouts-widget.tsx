'use client';

import { AlertCircle, AlertTriangle, CheckCircle2, ExternalLink, Package } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getMyTimeStatus, getStaffCheckouts, type InventoryCheckout } from '@/lib/api/client';

interface MyCheckoutsWidgetProps {
  orgId: string;
  orgSlug: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date().toISOString().split('T')[0]!;
  return dueDate < today;
}

function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  const due = new Date(`${dueDate}T00:00:00`);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
}

export function MyCheckoutsWidget({ orgId, orgSlug }: MyCheckoutsWidgetProps) {
  const [checkouts, setCheckouts] = useState<InventoryCheckout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCheckouts() {
      try {
        setIsLoading(true);
        setError(null);

        // First get the staff ID from time status
        const statusResponse = await getMyTimeStatus(orgId);
        if (statusResponse.error || !statusResponse.data) {
          // User might not be a staff member, just show empty state
          setCheckouts([]);
          setIsLoading(false);
          return;
        }

        const staffId = statusResponse.data.staff_id;

        // Then get the checkouts
        const checkoutResponse = await getStaffCheckouts(orgId, staffId);
        if (checkoutResponse.error) {
          // Check if it's a feature flag error (inventory not enabled)
          if (
            checkoutResponse.error.message?.includes('feature') ||
            checkoutResponse.error.statusCode === 403
          ) {
            // Inventory feature not enabled, don't show error
            setCheckouts([]);
            setIsLoading(false);
            return;
          }
          setError(checkoutResponse.error.message || 'Failed to load checkouts');
          return;
        }

        // Only show active checkouts (not returned)
        const activeCheckouts = (checkoutResponse.data?.checkouts || [])
          .filter((c) => !c.returned_at)
          .slice(0, 5);
        setCheckouts(activeCheckouts);
      } catch {
        setError('Failed to load checkouts');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCheckouts();
  }, [orgId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            My Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Count overdue items
  const overdueCount = checkouts.filter((c) => isOverdue(c.due_date)).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            My Items
            {checkouts.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {checkouts.length}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${orgSlug}/inventory/checkouts`}>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {!error && checkouts.length === 0 && (
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No items checked out</p>
          </div>
        )}

        {overdueCount > 0 && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              {overdueCount} {overdueCount === 1 ? 'item' : 'items'} overdue
            </AlertDescription>
          </Alert>
        )}

        {checkouts.map((checkout) => {
          const overdue = isOverdue(checkout.due_date);
          const dueSoon = isDueSoon(checkout.due_date);

          return (
            <div
              key={checkout.id}
              className={`rounded-lg border p-3 ${
                overdue
                  ? 'border-destructive bg-destructive/5'
                  : dueSoon
                    ? 'border-yellow-500 bg-yellow-500/5'
                    : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {checkout.item?.name || 'Unknown Item'}
                  </p>
                  {checkout.item?.sku && (
                    <p className="text-xs text-muted-foreground">SKU: {checkout.item.sku}</p>
                  )}
                  {checkout.quantity > 1 && (
                    <p className="text-xs text-muted-foreground">Qty: {checkout.quantity}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {checkout.due_date && (
                    <Badge
                      variant={overdue ? 'destructive' : dueSoon ? 'outline' : 'secondary'}
                      className="text-xs"
                    >
                      {overdue ? 'Overdue' : `Due ${formatDate(checkout.due_date)}`}
                    </Badge>
                  )}
                  {checkout.condition_out && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {checkout.condition_out}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {checkouts.length > 0 && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/${orgSlug}/inventory/checkouts`}>View All Items</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
