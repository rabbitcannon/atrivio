'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaqDialog } from './faq-dialog';

interface FaqHeaderActionsProps {
  orgId: string;
  attractionId: string;
}

export function FaqHeaderActions({ orgId, attractionId }: FaqHeaderActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add FAQ
      </Button>

      <FaqDialog
        orgId={orgId}
        attractionId={attractionId}
        existingFaq={null}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
