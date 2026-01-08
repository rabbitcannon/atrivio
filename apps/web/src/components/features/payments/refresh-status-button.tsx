'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { syncStripeAccount } from '@/lib/api/payments';

interface RefreshStatusButtonProps {
  orgId: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function RefreshStatusButton({
  orgId,
  variant = 'outline',
  size = 'sm',
}: RefreshStatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await syncStripeAccount(orgId);

      if (result.error) {
        setError(result.error.message || 'Failed to sync with Stripe');
        return;
      }

      // Refresh the page to show updated status
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant={variant}
        size={size}
        title="Refresh status from Stripe"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span className="ml-2">Refresh Status</span>
      </Button>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
