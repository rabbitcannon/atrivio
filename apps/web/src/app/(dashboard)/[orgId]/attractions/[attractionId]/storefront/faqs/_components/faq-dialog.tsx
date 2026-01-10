'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { createStorefrontFaqClient, updateStorefrontFaqClient } from '@/lib/api/client';
import type { StorefrontFaq } from '@/lib/api/types';

interface FaqDialogProps {
  orgId: string;
  attractionId: string;
  existingFaq?: StorefrontFaq | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FaqDialog({
  orgId,
  attractionId,
  existingFaq,
  open,
  onOpenChange,
}: FaqDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const isEditing = !!existingFaq;

  // Reset form when dialog opens/closes or when editing different FAQ
  useEffect(() => {
    if (open) {
      if (existingFaq) {
        setQuestion(existingFaq.question);
        setAnswer(existingFaq.answer);
        setCategory(existingFaq.category ?? '');
        setIsPublished(existingFaq.isPublished);
      } else {
        setQuestion('');
        setAnswer('');
        setCategory('');
        setIsPublished(true);
      }
      setError(null);
    }
  }, [open, existingFaq]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!answer.trim()) {
      setError('Please enter an answer');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && existingFaq) {
        const result = await updateStorefrontFaqClient(orgId, attractionId, existingFaq.id, {
          question: question.trim(),
          answer: answer.trim(),
          category: category.trim() || undefined,
          isActive: isPublished,
        });

        if (result.error) {
          setError(result.error.message || 'Failed to update FAQ');
          return;
        }
      } else {
        const result = await createStorefrontFaqClient(orgId, attractionId, {
          question: question.trim(),
          answer: answer.trim(),
          category: category.trim() || undefined,
        });

        if (result.error) {
          setError(result.error.message || 'Failed to create FAQ');
          return;
        }
      }

      onOpenChange(false);
      router.refresh();
    } catch {
      setError('Failed to save FAQ. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update this frequently asked question.'
                : 'Add a new frequently asked question to your storefront.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What are your hours of operation?"
                maxLength={500}
                disabled={isLoading}
              />
            </div>

            {/* Answer */}
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter the answer to this question..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Tickets, Safety, General"
                maxLength={100}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Group related FAQs together by category.
              </p>
            </div>

            {/* Published toggle (only show when editing) */}
            {isEditing && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Unpublished FAQs won&apos;t appear on your storefront
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                  disabled={isLoading}
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Adding...'}
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add FAQ'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
