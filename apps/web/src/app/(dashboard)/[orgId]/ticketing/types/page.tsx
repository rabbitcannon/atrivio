'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Pencil, Trash2, MoreHorizontal, Package, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClientDirect as apiClient, resolveOrgId } from '@/lib/api/client';

interface TicketCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  category: TicketCategory | null;
  attraction: { id: string; name: string } | null;
  max_per_order: number | null;
  min_per_order: number | null;
  capacity: number | null;
  sold_count: number;
  is_active: boolean;
  includes: string[] | null;
}

interface Attraction {
  id: string;
  name: string;
}

export default function TicketTypesPage() {
  const params = useParams();
  const orgIdentifier = params['orgId'] as string;
  const { toast } = useToast();

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<TicketType | null>(null);
  const [resolvedOrgId, setResolvedOrgId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    attractionId: '',
    categoryId: '',
    price: '',
    comparePrice: '',
    minPerOrder: '',
    maxPerOrder: '',
    capacity: '',
    includes: '',
  });

  useEffect(() => {
    async function init() {
      const orgId = await resolveOrgId(orgIdentifier);
      if (orgId) {
        setResolvedOrgId(orgId);
        await Promise.all([
          loadTicketTypes(orgId),
          loadCategories(orgId),
          loadAttractions(orgId),
        ]);
      }
      setIsLoading(false);
    }
    init();
  }, [orgIdentifier]);

  async function loadTicketTypes(orgId: string) {
    try {
      const response = await apiClient.get<{ data: TicketType[] }>(
        `/organizations/${orgId}/ticket-types?includeInactive=true`
      );
      setTicketTypes(response?.data || []);
    } catch (error) {
      console.error('Failed to load ticket types:', error);
    }
  }

  async function loadCategories(orgId: string) {
    try {
      const response = await apiClient.get<{ data: TicketCategory[] }>(
        `/organizations/${orgId}/ticket-categories`
      );
      setCategories(response?.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  async function loadAttractions(orgId: string) {
    try {
      const response = await apiClient.get<{ data: Attraction[] }>(
        `/organizations/${orgId}/attractions`
      );
      setAttractions(response?.data || []);
    } catch (error) {
      console.error('Failed to load attractions:', error);
    }
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function openCreateDialog() {
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      attractionId: attractions[0]?.id || '',
      categoryId: '',
      price: '',
      comparePrice: '',
      minPerOrder: '',
      maxPerOrder: '',
      capacity: '',
      includes: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(type: TicketType) {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      attractionId: type.attraction?.id || '',
      categoryId: type.category?.id || '',
      price: String(type.price / 100),
      comparePrice: type.compare_price ? String(type.compare_price / 100) : '',
      minPerOrder: type.min_per_order ? String(type.min_per_order) : '',
      maxPerOrder: type.max_per_order ? String(type.max_per_order) : '',
      capacity: type.capacity ? String(type.capacity) : '',
      includes: type.includes?.join('\n') || '',
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit() {
    if (!resolvedOrgId || !formData.attractionId) return;

    setIsSaving(true);
    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      attractionId: formData.attractionId,
      categoryId: formData.categoryId || undefined,
      price: Math.round(parseFloat(formData.price) * 100),
      comparePrice: formData.comparePrice
        ? Math.round(parseFloat(formData.comparePrice) * 100)
        : undefined,
      minPerOrder: formData.minPerOrder ? parseInt(formData.minPerOrder) : undefined,
      maxPerOrder: formData.maxPerOrder ? parseInt(formData.maxPerOrder) : undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      includes: formData.includes
        ? formData.includes.split('\n').filter((s) => s.trim())
        : undefined,
    };

    try {
      if (editingType) {
        await apiClient.patch(
          `/organizations/${resolvedOrgId}/ticket-types/${editingType.id}`,
          payload
        );
        toast({ title: 'Ticket type updated' });
      } else {
        await apiClient.post(
          `/organizations/${resolvedOrgId}/ticket-types`,
          payload
        );
        toast({ title: 'Ticket type created' });
      }
      setIsDialogOpen(false);
      await loadTicketTypes(resolvedOrgId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save ticket type',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive(type: TicketType) {
    if (!resolvedOrgId) return;

    try {
      await apiClient.patch(
        `/organizations/${resolvedOrgId}/ticket-types/${type.id}`,
        { isActive: !type.is_active }
      );
      toast({
        title: type.is_active ? 'Ticket type deactivated' : 'Ticket type activated',
      });
      await loadTicketTypes(resolvedOrgId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ticket type',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(type: TicketType) {
    if (!resolvedOrgId) return;
    if (!confirm(`Delete "${type.name}"? This cannot be undone.`)) return;

    try {
      await apiClient.delete(
        `/organizations/${resolvedOrgId}/ticket-types/${type.id}`
      );
      toast({ title: 'Ticket type deleted' });
      await loadTicketTypes(resolvedOrgId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Cannot delete ticket type that has been purchased',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ticket Types</h1>
          <p className="text-muted-foreground">
            Configure ticket types, pricing, and availability limits.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Ticket Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Ticket Types</CardTitle>
          <CardDescription>
            {ticketTypes.length} ticket type{ticketTypes.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ticketTypes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No ticket types configured yet.</p>
              <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                Create Your First Ticket Type
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Attraction</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div className="font-medium">{type.name}</div>
                      {type.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {type.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {type.category ? (
                        <Badge variant="outline">{type.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{type.attraction?.name || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{formatPrice(type.price)}</div>
                      {type.compare_price && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(type.compare_price)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {type.capacity ? (
                        <span>
                          {type.sold_count} / {type.capacity}
                        </span>
                      ) : (
                        type.sold_count
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.is_active ? 'default' : 'secondary'}>
                        {type.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(type)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(type)}>
                            {type.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(type)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Edit Ticket Type' : 'Create Ticket Type'}
            </DialogTitle>
            <DialogDescription>
              Configure the ticket type details and pricing.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="General Admission"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Standard entry ticket..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="attraction">Attraction</Label>
                <Select
                  value={formData.attractionId}
                  onValueChange={(v) => setFormData({ ...formData, attractionId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attraction" />
                  </SelectTrigger>
                  <SelectContent>
                    {attractions.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="29.99"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="comparePrice">Compare Price ($)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.comparePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, comparePrice: e.target.value })
                  }
                  placeholder="39.99"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minPerOrder">Min Per Order</Label>
                <Input
                  id="minPerOrder"
                  type="number"
                  min="1"
                  value={formData.minPerOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, minPerOrder: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxPerOrder">Max Per Order</Label>
                <Input
                  id="maxPerOrder"
                  type="number"
                  min="1"
                  value={formData.maxPerOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, maxPerOrder: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="capacity">Total Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="includes">Includes (one per line)</Label>
              <Textarea
                id="includes"
                value={formData.includes}
                onChange={(e) =>
                  setFormData({ ...formData, includes: e.target.value })
                }
                placeholder="Access to all attractions&#10;Photo package&#10;Souvenir"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.price}
              isLoading={isSaving}
              loadingText={editingType ? 'Saving...' : 'Creating...'}
            >
              {editingType ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
