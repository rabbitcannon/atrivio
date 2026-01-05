'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QueueManageActionsProps {
  orgId: string;
  attractionId: string;
  isActive: boolean;
  waitingCount: number;
  capacityPerBatch: number;
}

export function QueueManageActions({
  orgId,
  attractionId,
  isActive,
  waitingCount,
  capacityPerBatch,
}: QueueManageActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isCallingBatch, setIsCallingBatch] = useState(false);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleCallNextBatch = async () => {
    setIsCallingBatch(true);
    try {
      const response = await fetch(`/api/queue/${orgId}/${attractionId}/call-next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: capacityPerBatch }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to call next batch');
      }

      const result = await response.json();
      toast({
        title: 'Batch called',
        description: `${result.count || capacityPerBatch} guests have been notified.`,
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to call next batch',
        variant: 'destructive',
      });
    } finally {
      setIsCallingBatch(false);
    }
  };

  const isLoading = isPending || isCallingBatch;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        Refresh
      </Button>
      <Button
        size="sm"
        onClick={handleCallNextBatch}
        disabled={!isActive || waitingCount === 0 || isLoading}
      >
        {isCallingBatch ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Bell className="mr-2 h-4 w-4" />
        )}
        Call Next Batch
      </Button>
    </div>
  );
}
