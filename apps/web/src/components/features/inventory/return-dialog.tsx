'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { returnInventoryCheckout, type InventoryCheckout } from '@/lib/api/client';

interface ReturnDialogProps {
  orgId: string;
  checkout: InventoryCheckout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' },
];

export function ReturnDialog({
  orgId,
  checkout,
  open,
  onOpenChange,
  onSaved,
}: ReturnDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    conditionIn: 'good' as string,
    notes: '',
  });

  // Reset form when checkout changes
  useEffect(() => {
    if (checkout) {
      setFormData({
        conditionIn: checkout.condition_out || 'good',
        notes: '',
      });
    }
    setError(null);
  }, [checkout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkout) return;

    setLoading(true);
    setError(null);

    const { error: apiError } = await returnInventoryCheckout(orgId, checkout.id, {
      conditionIn: formData.conditionIn as 'excellent' | 'good' | 'fair' | 'poor' | 'damaged',
      ...(formData.notes && { notes: formData.notes }),
    });

    if (apiError) {
      setError(apiError.message || 'Failed to return item');
      setLoading(false);
      return;
    }

    setLoading(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Return Item</DialogTitle>
            <DialogDescription>
              {checkout
                ? `Return "${checkout.item?.name}" (${checkout.quantity} ${checkout.item?.sku})`
                : 'Return the checked out item'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {checkout && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{checkout.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Condition Out:</span>
                  <span className="font-medium capitalize">{checkout.condition_out || 'Unknown'}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="conditionIn">Condition on Return</Label>
              <Select
                value={formData.conditionIn}
                onValueChange={(value) => setFormData({ ...formData, conditionIn: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any notes about the condition or return..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Return
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
