'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { syncTransactions } from '@/lib/api/payments';

interface SyncTransactionsButtonProps {
  orgId: string;
}

export function SyncTransactionsButton({ orgId }: SyncTransactionsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSync() {
    setIsLoading(true);
    try {
      const result = await syncTransactions(orgId);
      if (result.error) {
      } else {
        // Refresh the page to show updated data
        router.refresh();
      }
    } catch (_error) {
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleSync} disabled={isLoading}>
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Syncing...' : 'Sync from Stripe'}
    </Button>
  );
}
