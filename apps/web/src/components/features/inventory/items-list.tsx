'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Package, Search, Filter, MoreHorizontal, Edit, Trash2, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getInventoryItems, deleteInventoryItem, type InventoryItem } from '@/lib/api/client';
import { ItemFormDialog } from './item-form-dialog';
import { AdjustQuantityDialog } from './adjust-quantity-dialog';

interface ItemsListProps {
  orgId: string;
}

export function ItemsList({ orgId }: ItemsListProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const { data } = await getInventoryItems(orgId, searchQuery ? { search: searchQuery } : undefined);
    if (data?.items) {
      setItems(data.items);
    }
    setLoading(false);
  }, [orgId, searchQuery]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormDialogOpen(true);
  };

  const handleAdjust = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    await deleteInventoryItem(orgId, selectedItem.id);
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    loadItems();
  };

  const handleFormSaved = () => {
    setFormDialogOpen(false);
    setSelectedItem(null);
    loadItems();
  };

  const handleAdjustSaved = () => {
    setAdjustDialogOpen(false);
    setSelectedItem(null);
    loadItems();
  };

  const isLowStock = (item: InventoryItem) => item.quantity <= item.min_quantity;

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items by name or SKU..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => { setSelectedItem(null); setFormDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Items
          </CardTitle>
          <CardDescription>
            Click on an item to view details, adjust quantity, or manage checkouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Package className="mb-4 h-12 w-12" />
              <p className="text-lg font-medium">No items found</p>
              <p className="mb-4 text-sm">
                {searchQuery ? 'Try a different search term.' : 'Add your first inventory item to get started.'}
              </p>
              {!searchQuery && (
                <Button onClick={() => { setSelectedItem(null); setFormDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.type?.name || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell>{item.category?.name || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLowStock(item) && (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                        <span className={isLowStock(item) ? 'text-destructive font-medium' : ''}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.location || '—'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAdjust(item)}>
                            <TrendingDown className="mr-2 h-4 w-4" />
                            Adjust Quantity
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => { setSelectedItem(item); setDeleteDialogOpen(true); }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Dialogs */}
      <ItemFormDialog
        orgId={orgId}
        item={selectedItem}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSaved={handleFormSaved}
      />

      <AdjustQuantityDialog
        orgId={orgId}
        item={selectedItem}
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        onSaved={handleAdjustSaved}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
