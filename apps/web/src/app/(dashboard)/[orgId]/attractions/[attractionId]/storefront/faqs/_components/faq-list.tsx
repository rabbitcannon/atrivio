'use client';

import { GripVertical, HelpCircle, Plus, Star, Tag } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { reorderStorefrontFaqsClient } from '@/lib/api/client';
import type { StorefrontFaq } from '@/lib/api/types';
import { FaqActions } from './faq-actions';
import { FaqDialog } from './faq-dialog';

interface FaqListProps {
  orgId: string;
  attractionId: string;
  faqs: StorefrontFaq[];
}

export function FaqList({ orgId, attractionId, faqs: initialFaqs }: FaqListProps) {
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<StorefrontFaq | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddFaq = () => {
    setEditingFaq(null);
    setDialogOpen(true);
  };

  const handleEditFaq = (faq: StorefrontFaq) => {
    setEditingFaq(faq);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingFaq(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        return;
      }

      // Reorder locally first for immediate feedback
      const newFaqs = [...faqs];
      const [draggedItem] = newFaqs.splice(draggedIndex, 1);
      newFaqs.splice(dropIndex, 0, draggedItem);
      setFaqs(newFaqs);
      setDraggedIndex(null);

      // Send reorder request to API
      const order = newFaqs.map((faq, index) => ({
        id: faq.id,
        sortOrder: index,
      }));

      try {
        await reorderStorefrontFaqsClient(orgId, attractionId, order);
        router.refresh();
      } catch {
        // Revert on error
        setFaqs(initialFaqs);
      }
    },
    [draggedIndex, faqs, orgId, attractionId, initialFaqs, router]
  );

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            All FAQs
          </CardTitle>
          <CardDescription>Drag to reorder. Featured FAQs appear on the homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No FAQs yet</h3>
              <p className="text-muted-foreground mb-4">
                Add frequently asked questions to help your visitors.
              </p>
              <Button onClick={handleAddFaq}>
                <Plus className="mr-2 h-4 w-4" />
                Add First FAQ
              </Button>
            </div>
          ) : (
            <div role="list" className="space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  role="listitem"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                    !faq.isPublished ? 'opacity-50' : ''
                  } ${draggedIndex === index ? 'opacity-50 border-dashed' : ''}`}
                >
                  <div className="cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{faq.question}</h4>
                      {faq.isFeatured && (
                        <Badge variant="outline" className="text-amber-600">
                          <Star className="mr-1 h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      {!faq.isPublished && <Badge variant="secondary">Unpublished</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                    {faq.category && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          {faq.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <FaqActions
                    orgId={orgId}
                    attractionId={attractionId}
                    faq={faq}
                    onEdit={handleEditFaq}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FaqDialog
        orgId={orgId}
        attractionId={attractionId}
        existingFaq={editingFaq}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
    </>
  );
}
