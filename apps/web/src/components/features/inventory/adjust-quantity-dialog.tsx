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
import { Input } from '@/components/ui/input';
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
import { AlertCircle, Loader2, Plus, Minus } from 'lucide-react';
import { adjustInventoryQuantity, type InventoryItem } from '@/lib/api/client';

interface AdjustQuantityDialogProps {
  orgId: string;
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const ADJUSTMENT_TYPES = [
  { value: 'purchase', label: 'Purchase', direction: 'add' },
  { value: 'adjustment', label: 'Adjustment', direction: 'both' },
  { value: 'damaged', label: 'Damaged', direction: 'subtract' },
  { value: 'lost', label: 'Lost', direction: 'subtract' },
  { value: 'disposed', label: 'Disposed', direction: 'subtract' },
] as const;

export function AdjustQuantityDialog({
  orgId,
  item,
  open,
  onOpenChange,
  onSaved,
}: AdjustQuantityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'adjustment' as string,
    quantity: 0,
    isAdding: true,
    notes: '',
  });

  // Reset form when item changes
  useEffect(() => {
    setFormData({
      type: 'adjustment',
      quantity: 0,
      isAdding: true,
      notes: '',
    });
    setError(null);
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);
    setError(null);

    const quantityChange = formData.isAdding ? formData.quantity : -formData.quantity;

    const { error: apiError } = await adjustInventoryQuantity(orgId, item.id, {
      reason: formData.type as 'purchase' | 'adjustment' | 'damaged' | 'lost' | 'disposed',
      quantityChange,
      ...(formData.notes && { notes: formData.notes }),
    });

    if (apiError) {
      setError(apiError.message || 'Failed to adjust quantity');
      setLoading(false);
      return;
    }

    setLoading(false);
    onSaved();
  };

  const selectedType = ADJUSTMENT_TYPES.find((t) => t.value === formData.type);
  const newQuantity = item
    ? item.quantity + (formData.isAdding ? formData.quantity : -formData.quantity)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adjust Quantity</DialogTitle>
            <DialogDescription>
              {item ? `Adjust the quantity of "${item.name}"` : 'Adjust item quantity'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {item && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Quantity:</span>
                  <span className="font-medium">{item.quantity} {item.unit}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="type">Adjustment Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  const type = ADJUSTMENT_TYPES.find((t) => t.value === value);
                  setFormData({
                    ...formData,
                    type: value,
                    isAdding: type?.direction === 'add' || (type?.direction === 'both' && formData.isAdding),
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex gap-2">
                {selectedType?.direction === 'both' && (
                  <div className="flex rounded-md border">
                    <Button
                      type="button"
                      variant={formData.isAdding ? 'default' : 'ghost'}
                      size="icon"
                      className="rounded-r-none"
                      onClick={() => setFormData({ ...formData, isAdding: true })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.isAdding ? 'default' : 'ghost'}
                      size="icon"
                      className="rounded-l-none"
                      onClick={() => setFormData({ ...formData, isAdding: false })}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                  className="flex-1"
                  required
                />
              </div>
            </div>

            {item && formData.quantity > 0 && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New Quantity:</span>
                  <span className={`font-medium ${newQuantity < 0 ? 'text-destructive' : ''}`}>
                    {newQuantity} {item.unit}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Reason for adjustment..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.quantity === 0 || newQuantity < 0}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adjust Quantity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
