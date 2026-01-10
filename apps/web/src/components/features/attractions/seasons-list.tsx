'use client';

import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteSeason } from '@/lib/api/client';
import { SeasonForm } from './season-form';

interface Season {
  id: string;
  name: string;
  year: number;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

interface SeasonsListProps {
  orgId: string;
  attractionId: string;
  seasons: Season[];
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'active':
      return 'default';
    case 'upcoming':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function SeasonsList({ orgId, attractionId, seasons }: SeasonsListProps) {
  const router = useRouter();
  const [editingSeason, setEditingSeason] = React.useState<Season | null>(null);
  const [deletingSeason, setDeletingSeason] = React.useState<Season | null>(null);
  const [pendingEditSeason, setPendingEditSeason] = React.useState<Season | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleEditClick = (season: Season) => {
    if (season.status === 'completed') {
      // Show warning for completed seasons
      setPendingEditSeason(season);
    } else {
      setEditingSeason(season);
    }
  };

  const handleConfirmCompletedEdit = () => {
    if (pendingEditSeason) {
      setEditingSeason(pendingEditSeason);
      setPendingEditSeason(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingSeason) return;

    setIsDeleting(true);
    const result = await deleteSeason(orgId, attractionId, deletingSeason.id);

    if (result.error) {
      // Could add toast notification here
      console.error('Failed to delete season:', result.error);
    }

    setIsDeleting(false);
    setDeletingSeason(null);
    router.refresh();
  };

  const handleEditSuccess = () => {
    setEditingSeason(null);
    router.refresh();
  };

  if (seasons.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No seasons yet. Create your first season.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {seasons.map((season) => (
          <Card key={season.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{season.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(season.status)}>{season.status}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(season)}
                  >
                    <Edit className="mr-1.5 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletingSeason(season)}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
              <CardDescription>
                {new Date(season.start_date).toLocaleDateString()} -{' '}
                {new Date(season.end_date).toLocaleDateString()}
                <span className="ml-2 text-muted-foreground">({season.year})</span>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSeason} onOpenChange={(open) => !open && setEditingSeason(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Season</DialogTitle>
            <DialogDescription>Update the season details below.</DialogDescription>
          </DialogHeader>
          {editingSeason && (
            <SeasonForm
              orgId={orgId}
              attractionId={attractionId}
              season={editingSeason}
              onSuccess={handleEditSuccess}
              bare
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSeason} onOpenChange={(open) => !open && setDeletingSeason(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Season</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingSeason?.name}&quot;? This action cannot
              be undone. Any ticket types or operating hours associated with this season may be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Warning for editing completed seasons */}
      <AlertDialog
        open={!!pendingEditSeason}
        onOpenChange={(open) => !open && setPendingEditSeason(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Completed Season</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{pendingEditSeason?.name}&quot; is a completed season. Editing historical data
              may affect reports and analytics. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCompletedEdit}>
              Continue Editing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
