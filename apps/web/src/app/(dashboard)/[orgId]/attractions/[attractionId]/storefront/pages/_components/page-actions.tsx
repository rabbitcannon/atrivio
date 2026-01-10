'use client';

import {
  Archive,
  Eye,
  EyeOff,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from 'lucide-react';
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
import type { PageStatus } from '@/lib/api/types';

interface PageActionsProps {
  pageId: string;
  pageTitle: string;
  currentStatus: PageStatus;
  onStatusChange: (pageId: string, status: PageStatus) => Promise<void>;
  onDelete: (pageId: string) => Promise<void>;
}

export function PageActions({
  pageId,
  pageTitle,
  currentStatus,
  onStatusChange,
  onDelete,
}: PageActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleStatusChange = async (status: PageStatus, action: string) => {
    setIsLoading(true);
    setLoadingAction(action);
    try {
      await onStatusChange(pageId, status);
      router.refresh();
    } catch (_error) {
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setLoadingAction('delete');
    try {
      await onDelete(pageId);
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (_error) {
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">Page actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Publish/Unpublish */}
          {currentStatus !== 'published' && currentStatus !== 'archived' && (
            <DropdownMenuItem
              onClick={() => handleStatusChange('published', 'publish')}
              disabled={isLoading}
            >
              {loadingAction === 'publish' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Publish
            </DropdownMenuItem>
          )}
          {currentStatus === 'published' && (
            <DropdownMenuItem
              onClick={() => handleStatusChange('draft', 'unpublish')}
              disabled={isLoading}
            >
              {loadingAction === 'unpublish' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <EyeOff className="mr-2 h-4 w-4" />
              )}
              Unpublish
            </DropdownMenuItem>
          )}
          {currentStatus === 'archived' && (
            <DropdownMenuItem
              onClick={() => handleStatusChange('draft', 'restore')}
              disabled={isLoading}
            >
              {loadingAction === 'restore' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Restore
            </DropdownMenuItem>
          )}

          {/* Archive */}
          {currentStatus !== 'archived' && (
            <DropdownMenuItem
              onClick={() => handleStatusChange('archived', 'archive')}
              disabled={isLoading}
            >
              {loadingAction === 'archive' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Archive className="mr-2 h-4 w-4" />
              )}
              Archive
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Delete */}
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{pageTitle}&quot;? This action cannot be undone.
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
