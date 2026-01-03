'use client';

import { useEffect, useState } from 'react';
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
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  createInventoryItem,
  updateInventoryItem,
  getInventoryTypes,
  getInventoryCategories,
  getAttractions,
  type InventoryItem,
  type InventoryType,
  type InventoryCategory,
} from '@/lib/api/client';

interface ItemFormDialogProps {
  orgId: string;
  item?: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ItemFormDialog({
  orgId,
  item,
  open,
  onOpenChange,
  onSaved,
}: ItemFormDialogProps) {
  const [types, setTypes] = useState<InventoryType[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [attractions, setAttractions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    typeId: '',
    categoryId: '',
    attractionId: '',
    quantity: 0,
    minQuantity: 0,
    maxQuantity: '',
    unit: 'each',
    costCents: '',
    location: '',
    notes: '',
  });

  // Load reference data when dialog opens
  useEffect(() => {
    if (!open) return;

    async function loadData() {
      setLoadingData(true);
      const [typesRes, categoriesRes, attractionsRes] = await Promise.all([
        getInventoryTypes(orgId),
        getInventoryCategories(orgId),
        getAttractions(orgId),
      ]);

      if (typesRes.data?.types) setTypes(typesRes.data.types);
      if (categoriesRes.data?.categories) setCategories(categoriesRes.data.categories);
      if (attractionsRes.data?.data) setAttractions(attractionsRes.data.data.map((a) => ({ id: a.id, name: a.name })));
      setLoadingData(false);
    }

    loadData();
  }, [open, orgId]);

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        name: item.name,
        description: item.description || '',
        typeId: item.type_id,
        categoryId: item.category_id || '__none__',
        attractionId: item.attraction_id || '__none__',
        quantity: item.quantity,
        minQuantity: item.min_quantity,
        maxQuantity: item.max_quantity?.toString() || '',
        unit: item.unit,
        costCents: item.cost_cents?.toString() || '',
        location: item.location || '',
        notes: item.notes || '',
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        typeId: types.length > 0 ? types[0]!.id : '',
        categoryId: '__none__',
        attractionId: '__none__',
        quantity: 0,
        minQuantity: 0,
        maxQuantity: '',
        unit: 'each',
        costCents: '',
        location: '',
        notes: '',
      });
    }
    setError(null);
  }, [item, types]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const categoryId = formData.categoryId && formData.categoryId !== '__none__' ? formData.categoryId : undefined;
    const attractionId = formData.attractionId && formData.attractionId !== '__none__' ? formData.attractionId : undefined;

    const payload = {
      sku: formData.sku,
      name: formData.name,
      typeId: formData.typeId,
      quantity: formData.quantity,
      minQuantity: formData.minQuantity,
      unit: formData.unit,
      ...(formData.description && { description: formData.description }),
      ...(categoryId && { categoryId }),
      ...(attractionId && { attractionId }),
      ...(formData.maxQuantity && { maxQuantity: parseInt(formData.maxQuantity, 10) }),
      ...(formData.costCents && { costCents: parseInt(formData.costCents, 10) }),
      ...(formData.location && { location: formData.location }),
      ...(formData.notes && { notes: formData.notes }),
    };

    if (item) {
      const { error: apiError } = await updateInventoryItem(orgId, item.id, payload);
      if (apiError) {
        setError(apiError.message || 'Failed to update item');
        setLoading(false);
        return;
      }
    } else {
      const { error: apiError } = await createInventoryItem(orgId, payload);
      if (apiError) {
        setError(apiError.message || 'Failed to create item');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{item ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogDescription>
              {item
                ? 'Update the inventory item details.'
                : 'Add a new item to your inventory.'}
            </DialogDescription>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g., MASK-001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Zombie Mask"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Item description..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeId">Type *</Label>
                    <Select
                      value={formData.typeId}
                      onValueChange={(value) => setFormData({ ...formData, typeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={0}
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Min Quantity</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      min={0}
                      value={formData.minQuantity}
                      onChange={(e) =>
                        setFormData({ ...formData, minQuantity: parseInt(e.target.value, 10) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="each">Each</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="pair">Pair</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                        <SelectItem value="gallon">Gallon</SelectItem>
                        <SelectItem value="bottle">Bottle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attractionId">Attraction</Label>
                    <Select
                      value={formData.attractionId}
                      onValueChange={(value) => setFormData({ ...formData, attractionId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All attractions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">All attractions</SelectItem>
                        {attractions.map((attr) => (
                          <SelectItem key={attr.id} value={attr.id}>
                            {attr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Storage Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Warehouse A, Shelf 3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costCents">Cost (cents)</Label>
                    <Input
                      id="costCents"
                      type="number"
                      min={0}
                      value={formData.costCents}
                      onChange={(e) => setFormData({ ...formData, costCents: e.target.value })}
                      placeholder="e.g., 1500 = $15.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxQuantity">Max Quantity</Label>
                    <Input
                      id="maxQuantity"
                      type="number"
                      min={0}
                      value={formData.maxQuantity}
                      onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                      placeholder="Optional max stock"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes..."
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
            <Button type="submit" disabled={loading || loadingData || !formData.typeId || !formData.name || !formData.sku}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {item ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
