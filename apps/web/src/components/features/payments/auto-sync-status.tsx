'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { syncStripeAccount } from '@/lib/api/payments';

interface AutoSyncStatusProps {
  orgId: string;
  currentStatus: string | null;
}

/**
 * Auto-syncs Stripe account status when returning from onboarding.
 * Triggers sync if status is not 'active'.
 */
export function AutoSyncStatus({ orgId, currentStatus }: AutoSyncStatusProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Only auto-sync if status is not active and not already syncing
    if (currentStatus === null || currentStatus === 'active') {
      return;
    }

    // Check sessionStorage to avoid infinite sync loops
    const syncKey = `stripe-sync-${orgId}`;
    const lastSync = sessionStorage.getItem(syncKey);
    const now = Date.now();

    // Don't sync if we synced in the last 5 seconds
    if (lastSync && now - parseInt(lastSync, 10) < 5000) {
      return;
    }

    setIsSyncing(true);
    sessionStorage.setItem(syncKey, now.toString());

    syncStripeAccount(orgId)
      .then((result) => {
        if (!result.error && result.data?.status !== currentStatus) {
          // Status changed, refresh the page
          router.refresh();
        }
      })
      .catch(() => {
        // Silently fail - user can use manual refresh button
      })
      .finally(() => {
        setIsSyncing(false);
      });
  }, [orgId, currentStatus, router]);

  // Show a subtle syncing indicator
  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Syncing with Stripe...</span>
      </div>
    );
  }

  return null;
}
