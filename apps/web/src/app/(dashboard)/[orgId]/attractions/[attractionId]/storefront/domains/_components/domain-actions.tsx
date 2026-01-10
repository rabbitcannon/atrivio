'use client';

import { Loader2, MoreHorizontal, RefreshCw, Star, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DomainStatus } from '@/lib/api/types';

interface DomainActionsProps {
  domainId: string;
  domain: string;
  domainType: 'subdomain' | 'custom';
  status: DomainStatus;
  isPrimary: boolean;
  onVerify: (domainId: string) => Promise<{ success: boolean; error?: string }>;
  onSetPrimary: (domainId: string) => Promise<{ success: boolean; error?: string }>;
  onDelete: (domainId: string) => Promise<{ success: boolean; error?: string }>;
}

export function DomainActions({
  domainId,
  domain,
  domainType,
  status,
  isPrimary,
  onVerify,
  onSetPrimary,
  onDelete,
}: DomainActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsLoading(true);
    setLoadingAction('verify');
    setError(null);
    try {
      const result = await onVerify(domainId);
      if (!result.success) {
        setError(result.error || 'Verification failed');
      }
      router.refresh();
    } catch {
      setError('Failed to verify domain');
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleSetPrimary = async () => {
    setIsLoading(true);
    setLoadingAction('primary');
    setError(null);
    try {
      const result = await onSetPrimary(domainId);
      if (!result.success) {
        setError(result.error || 'Failed to set as primary');
      }
      router.refresh();
    } catch {
      setError('Failed to set as primary');
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setLoadingAction('delete');
    setError(null);
    try {
      const result = await onDelete(domainId);
      if (result.success) {
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        setError(result.error || 'Failed to delete domain');
      }
    } catch {
      setError('Failed to delete domain');
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // Can't do anything with subdomains
  if (domainType === 'subdomain') {
    return null;
  }

  const canVerify = status === 'pending' || status === 'failed';
  const canSetPrimary = status === 'active' && !isPrimary;
  const canDelete = !isPrimary;

  // If no actions available, don't render anything
  if (!canVerify && !canSetPrimary && !canDelete) {
    return null;
  }

  return (
    <>
      {error && <p className="text-xs text-destructive mr-2">{error}</p>}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">Domain actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canVerify && (
            <DropdownMenuItem onClick={handleVerify} disabled={isLoading}>
              {loadingAction === 'verify' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Verify
            </DropdownMenuItem>
          )}

          {canSetPrimary && (
            <DropdownMenuItem onClick={handleSetPrimary} disabled={isLoading}>
              {loadingAction === 'primary' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Star className="mr-2 h-4 w-4" />
              )}
              Set Primary
            </DropdownMenuItem>
          )}

          {canDelete && (canVerify || canSetPrimary) && <DropdownMenuSeparator />}

          {canDelete && (
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Domain</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{domain}</strong>? This will remove the domain
              from your storefront. You can add it again later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingAction === 'delete' ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
