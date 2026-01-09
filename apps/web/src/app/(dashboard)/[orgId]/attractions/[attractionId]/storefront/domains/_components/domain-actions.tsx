'use client';

import { Loader2, RefreshCw, Star, Trash2 } from 'lucide-react';
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
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
      setIsVerifying(false);
    }
  };

  const handleSetPrimary = async () => {
    setIsSettingPrimary(true);
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
      setIsSettingPrimary(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
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
      setIsDeleting(false);
    }
  };

  // Can't do anything with subdomains
  if (domainType === 'subdomain') {
    return null;
  }

  const canVerify = status === 'pending' || status === 'failed';
  const canSetPrimary = status === 'active' && !isPrimary;
  const canDelete = !isPrimary;

  return (
    <div className="flex items-center gap-2">
      {error && <p className="text-xs text-destructive mr-2">{error}</p>}

      {canVerify && (
        <Button variant="outline" size="sm" onClick={handleVerify} disabled={isVerifying}>
          {isVerifying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Verify DNS
        </Button>
      )}

      {canSetPrimary && (
        <Button variant="ghost" size="sm" onClick={handleSetPrimary} disabled={isSettingPrimary}>
          {isSettingPrimary ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Star className="mr-2 h-4 w-4" />
          )}
          Set Primary
        </Button>
      )}

      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={isDeleting}
          className="text-muted-foreground hover:text-destructive"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}

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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
