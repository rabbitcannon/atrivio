'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  createInventoryCheckout,
  getInventoryItems,
  getStaff,
  type InventoryItem,
  type StaffListItem,
} from '@/lib/api/client';

interface CheckoutFormDialogProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export function CheckoutFormDialog({
  orgId,
  open,
  onOpenChange,
  onSaved,
}: CheckoutFormDialogProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [staff, setStaff] = useState<StaffListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    itemId: '',
    staffId: '',
    quantity: 1,
    conditionOut: 'good' as string,
    dueDate: '',
    notes: '',
  });

  // Load reference data when dialog opens
  useEffect(() => {
    if (!open) return;

    async function loadData() {
      setLoadingData(true);
      const [itemsRes, staffRes] = await Promise.all([getInventoryItems(orgId), getStaff(orgId)]);

      if (itemsRes.data?.items) {
        // Only show items that require checkout and have available quantity
        const checkoutItems = itemsRes.data.items.filter(
          (item) => item.type?.requires_checkout && item.quantity > 0
        );
        setItems(checkoutItems);
      }
      if (staffRes.data?.data) {
        setStaff(staffRes.data.data.filter((s) => s.status === 'active'));
      }
      setLoadingData(false);
    }

    loadData();
  }, [open, orgId]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        itemId: '',
        staffId: '',
        quantity: 1,
        conditionOut: 'good',
        dueDate: '',
        notes: '',
      });
      setError(null);
    }
  }, [open]);

  const selectedItem = items.find((i) => i.id === formData.itemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: apiError } = await createInventoryCheckout(orgId, {
      itemId: formData.itemId,
      staffId: formData.staffId,
      quantity: formData.quantity,
      conditionOut: formData.conditionOut as 'excellent' | 'good' | 'fair' | 'poor',
      ...(formData.dueDate && { dueDate: formData.dueDate }),
      ...(formData.notes && { notes: formData.notes }),
    });

    if (apiError) {
      setError(apiError.message || 'Failed to create checkout');
      setLoading(false);
      return;
    }

    setLoading(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Checkout</DialogTitle>
            <DialogDescription>Check out an item to a staff member.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="itemId">Item *</Label>
                  <Select
                    value={formData.itemId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, itemId: value, quantity: 1 })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No items available for checkout
                        </div>
                      ) : (
                        items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              <span className="text-muted-foreground">
                                ({item.quantity} available)
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffId">Staff Member *</Label>
                  <Select
                    value={formData.staffId}
                    onValueChange={(value) => setFormData({ ...formData, staffId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.user.first_name} {s.user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={selectedItem?.quantity || 1}
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })
                      }
                      required
                    />
                    {selectedItem && (
                      <p className="text-xs text-muted-foreground">
                        Max: {selectedItem.quantity} {selectedItem.unit}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conditionOut">Condition</Label>
                    <Select
                      value={formData.conditionOut}
                      onValueChange={(value) => setFormData({ ...formData, conditionOut: value })}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. Leave blank for no due date.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any notes about this checkout..."
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingData || !formData.itemId || !formData.staffId}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check Out
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
