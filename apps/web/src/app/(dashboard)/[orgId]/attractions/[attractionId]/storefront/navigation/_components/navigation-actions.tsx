'use client';

import { Edit, Loader2, Trash2 } from 'lucide-react';
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
import type { StorefrontNavItem, StorefrontPage } from '@/lib/api/types';
import type { NavItemFormData, NavPosition } from './nav-item-dialog';
import { NavItemDialog } from './nav-item-dialog';

interface NavigationActionsProps {
  item: StorefrontNavItem & { position: NavPosition };
  pages: StorefrontPage[];
  onEdit: (
    item: StorefrontNavItem & { position: NavPosition },
    data: NavItemFormData
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (
    itemId: string,
    position: NavPosition
  ) => Promise<{ success: boolean; error?: string }>;
}

export function NavigationActions({ item, pages, onEdit, onDelete }: NavigationActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async (
    data: NavItemFormData
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await onEdit(item, data);
    if (result.success) {
      router.refresh();
    }
    return result;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const result = await onDelete(item.id, item.position);
      if (result.success) {
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        setError(result.error || 'Failed to delete item');
      }
    } catch {
      setError('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {error && <p className="text-xs text-destructive mr-2">{error}</p>}

      <NavItemDialog
        pages={pages}
        existingItem={item}
        onSave={handleEdit}
        trigger={
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-3 w-3" />
          </Button>
        }
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDeleteDialogOpen(true)}
        disabled={isDeleting}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      </Button>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Navigation Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{item.label}&quot; from your navigation? This
              action cannot be undone.
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
