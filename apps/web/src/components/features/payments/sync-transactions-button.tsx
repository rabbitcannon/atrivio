'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncTransactions } from '@/lib/api/payments';
import { useRouter } from 'next/navigation';

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
        console.error('Sync failed:', result.error);
      } else {
        // Refresh the page to show updated data
        router.refresh();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSync}
      disabled={isLoading}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Syncing...' : 'Sync from Stripe'}
    </Button>
  );
}
