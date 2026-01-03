'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, FolderTree, Folder, MoreHorizontal, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { getInventoryCategories, deleteInventoryCategory, type InventoryCategory } from '@/lib/api/client';
import { CategoryFormDialog } from './category-form-dialog';

interface CategoriesListProps {
  orgId: string;
}

interface CategoryNodeProps {
  category: InventoryCategory;
  level: number;
  onEdit: (category: InventoryCategory) => void;
  onDelete: (category: InventoryCategory) => void;
  onAddChild: (parent: InventoryCategory) => void;
}

function CategoryNode({ category, level, onEdit, onDelete, onAddChild }: CategoryNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/50"
        style={{ paddingLeft: `${level * 24 + 8}px` }}
      >
        <button
          type="button"
          className="p-1 hover:bg-muted rounded"
          onClick={() => setExpanded(!expanded)}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>
        <Folder
          className="h-4 w-4"
          style={{ color: category.color || '#6b7280' }}
        />
        <span className="flex-1 font-medium">{category.name}</span>
        {category.item_count !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {category.item_count} items
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddChild(category)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Sub-category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {expanded && hasChildren && (
        <div>
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoriesList({ orgId }: CategoriesListProps) {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [flatCategories, setFlatCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | null>(null);
  const [parentCategory, setParentCategory] = useState<InventoryCategory | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await getInventoryCategories(orgId);
    if (data?.categories) {
      const categoryData = data.categories;
      setFlatCategories(categoryData);
      // Build tree structure
      const categoryMap = new Map<string, InventoryCategory>();
      const roots: InventoryCategory[] = [];

      // First pass: create map
      categoryData.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // Second pass: build tree
      categoryData.forEach((cat) => {
        const node = categoryMap.get(cat.id)!;
        if (cat.parent_id && categoryMap.has(cat.parent_id)) {
          const parent = categoryMap.get(cat.parent_id)!;
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      });

      // Sort by sort_order
      const sortCategories = (cats: InventoryCategory[]) => {
        cats.sort((a, b) => a.sort_order - b.sort_order);
        cats.forEach((cat) => {
          if (cat.children) sortCategories(cat.children);
        });
      };
      sortCategories(roots);

      setCategories(roots);
    }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleEdit = (category: InventoryCategory) => {
    setSelectedCategory(category);
    setParentCategory(null);
    setFormDialogOpen(true);
  };

  const handleAddChild = (parent: InventoryCategory) => {
    setSelectedCategory(null);
    setParentCategory(parent);
    setFormDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    await deleteInventoryCategory(orgId, selectedCategory.id);
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
    loadCategories();
  };

  const handleFormSaved = () => {
    setFormDialogOpen(false);
    setSelectedCategory(null);
    setParentCategory(null);
    loadCategories();
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => { setSelectedCategory(null); setParentCategory(null); setFormDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Category Structure
          </CardTitle>
          <CardDescription>
            Create categories and sub-categories to organize your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Folder className="mb-4 h-12 w-12" />
              <p className="text-lg font-medium">No categories found</p>
              <p className="mb-4 text-sm">
                Create categories to organize your inventory items.
              </p>
              <Button onClick={() => { setSelectedCategory(null); setParentCategory(null); setFormDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((category) => (
                <CategoryNode
                  key={category.id}
                  category={category}
                  level={0}
                  onEdit={handleEdit}
                  onDelete={(cat) => { setSelectedCategory(cat); setDeleteDialogOpen(true); }}
                  onAddChild={handleAddChild}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CategoryFormDialog
        orgId={orgId}
        category={selectedCategory}
        categories={flatCategories}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSaved={handleFormSaved}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"?
              {selectedCategory?.children && selectedCategory.children.length > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This will also affect sub-categories.
                </span>
              )}
              This action cannot be undone.
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
