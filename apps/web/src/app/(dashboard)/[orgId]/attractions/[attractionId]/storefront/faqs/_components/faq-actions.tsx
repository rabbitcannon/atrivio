'use client';

import {
  Eye,
  EyeOff,
  Loader2,
  MoreHorizontal,
  Pencil,
  Star,
  StarOff,
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
import { deleteStorefrontFaqClient, updateStorefrontFaqClient } from '@/lib/api/client';
import type { StorefrontFaq } from '@/lib/api/types';

interface FaqActionsProps {
  orgId: string;
  attractionId: string;
  faq: StorefrontFaq;
  onEdit: (faq: StorefrontFaq) => void;
}

export function FaqActions({ orgId, attractionId, faq, onEdit }: FaqActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleTogglePublished = async () => {
    const action = faq.isPublished ? 'unpublish' : 'publish';
    setIsLoading(true);
    setLoadingAction(action);
    try {
      await updateStorefrontFaqClient(orgId, attractionId, faq.id, {
        isActive: !faq.isPublished,
      });
      router.refresh();
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleToggleFeatured = async () => {
    const action = faq.isFeatured ? 'unfeature' : 'feature';
    setIsLoading(true);
    setLoadingAction(action);
    try {
      await updateStorefrontFaqClient(orgId, attractionId, faq.id, {
        isFeatured: !faq.isFeatured,
      });
      router.refresh();
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setLoadingAction('delete');
    try {
      await deleteStorefrontFaqClient(orgId, attractionId, faq.id);
      setDeleteDialogOpen(false);
      router.refresh();
    } catch {
      // Error handling
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
            <span className="sr-only">FAQ actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Edit */}
          <DropdownMenuItem onClick={() => onEdit(faq)} disabled={isLoading}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Toggle Featured */}
          <DropdownMenuItem onClick={handleToggleFeatured} disabled={isLoading}>
            {loadingAction === 'feature' || loadingAction === 'unfeature' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : faq.isFeatured ? (
              <StarOff className="mr-2 h-4 w-4" />
            ) : (
              <Star className="mr-2 h-4 w-4" />
            )}
            {faq.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
          </DropdownMenuItem>

          {/* Toggle Published */}
          <DropdownMenuItem onClick={handleTogglePublished} disabled={isLoading}>
            {loadingAction === 'publish' || loadingAction === 'unpublish' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : faq.isPublished ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {faq.isPublished ? 'Unpublish' : 'Publish'}
          </DropdownMenuItem>

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
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
