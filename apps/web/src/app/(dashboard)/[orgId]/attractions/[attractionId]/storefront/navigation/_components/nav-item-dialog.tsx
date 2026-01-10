'use client';

import { ExternalLink, FileText, HelpCircle, Home, Loader2, Plus, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from '@/components/ui/switch';
import type { StorefrontNavItem, StorefrontPage } from '@/lib/api/types';

export type NavItemType = 'home' | 'page' | 'tickets' | 'faq' | 'external';
export type NavPosition = 'header' | 'footer';

export interface NavItemFormData {
  label: string;
  linkType: NavItemType;
  pageId?: string;
  externalUrl?: string;
  openInNewTab: boolean;
  position: NavPosition;
}

interface NavItemDialogProps {
  pages: StorefrontPage[];
  existingItem?: StorefrontNavItem & { position: NavPosition };
  onSave: (data: NavItemFormData) => Promise<{ success: boolean; error?: string }>;
  trigger?: React.ReactNode;
  /** Controlled mode: open state */
  open?: boolean;
  /** Controlled mode: open state change handler */
  onOpenChange?: (open: boolean) => void;
}

const LINK_TYPES: { value: NavItemType; label: string; icon: typeof Home }[] = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'page', label: 'Page', icon: FileText },
  { value: 'tickets', label: 'Tickets', icon: Ticket },
  { value: 'faq', label: 'FAQs', icon: HelpCircle },
  { value: 'external', label: 'External Link', icon: ExternalLink },
];

export function NavItemDialog({
  pages,
  existingItem,
  onSave,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: NavItemDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [label, setLabel] = useState(existingItem?.label ?? '');
  const [linkType, setLinkType] = useState<NavItemType>(
    (existingItem?.linkType as NavItemType) ?? 'page'
  );
  const [pageId, setPageId] = useState(existingItem?.pageId ?? '');
  const [externalUrl, setExternalUrl] = useState(existingItem?.externalUrl ?? '');
  const [openInNewTab, setOpenInNewTab] = useState(existingItem?.openInNewTab ?? false);
  const [position, setPosition] = useState<NavPosition>(existingItem?.position ?? 'header');

  const isEditing = !!existingItem;
  const publishedPages = pages.filter((p) => p.status === 'published');

  const resetForm = () => {
    if (existingItem) {
      setLabel(existingItem.label);
      setLinkType((existingItem.linkType as NavItemType) ?? 'page');
      setPageId(existingItem.pageId ?? '');
      setExternalUrl(existingItem.externalUrl ?? '');
      setOpenInNewTab(existingItem.openInNewTab ?? false);
      setPosition(existingItem.position);
    } else {
      setLabel('');
      setLinkType('page');
      setPageId('');
      setExternalUrl('');
      setOpenInNewTab(false);
      setPosition('header');
    }
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      resetForm();
    }
  };

  const handleLinkTypeChange = (value: NavItemType) => {
    setLinkType(value);
    // Auto-set label for special types
    if (value === 'home' && !label) {
      setLabel('Home');
    } else if (value === 'tickets' && !label) {
      setLabel('Tickets');
    } else if (value === 'faq' && !label) {
      setLabel('FAQs');
    }
    // External links should open in new tab by default
    if (value === 'external') {
      setOpenInNewTab(true);
    }
  };

  const handlePageChange = (value: string) => {
    setPageId(value);
    // Auto-set label from page title if empty
    if (!label) {
      const page = publishedPages.find((p) => p.id === value);
      if (page) {
        setLabel(page.title);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!label.trim()) {
      setError('Please enter a label');
      return;
    }

    if (linkType === 'page' && !pageId) {
      setError('Please select a page');
      return;
    }

    if (linkType === 'external' && !externalUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Validate URL format for external links
    if (linkType === 'external') {
      try {
        new URL(externalUrl);
      } catch {
        setError('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await onSave({
        label: label.trim(),
        linkType,
        pageId: linkType === 'page' ? pageId : undefined,
        externalUrl: linkType === 'external' ? externalUrl.trim() : undefined,
        openInNewTab,
        position,
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error || 'Failed to save navigation item');
      }
    } catch {
      setError('Failed to save navigation item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Nav Item
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Navigation Item' : 'Add Navigation Item'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update this navigation link.'
                : 'Add a new link to your storefront navigation.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {/* Position */}
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as NavPosition)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header (Main Navigation)</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Link Type */}
            <div className="space-y-2">
              <Label>Link Type</Label>
              <Select value={linkType} onValueChange={handleLinkTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LINK_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter menu label"
                maxLength={50}
                disabled={isLoading}
              />
            </div>

            {/* Page selector (for page type) */}
            {linkType === 'page' && (
              <div className="space-y-2">
                <Label>Page</Label>
                <Select value={pageId} onValueChange={handlePageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page" />
                  </SelectTrigger>
                  <SelectContent>
                    {publishedPages.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No published pages available
                      </div>
                    ) : (
                      publishedPages.map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {page.title}
                            <span className="text-muted-foreground">/{page.slug}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {publishedPages.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Create and publish a page first to link to it.
                  </p>
                )}
              </div>
            )}

            {/* URL input (for external type) */}
            {linkType === 'external' && (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Open in new tab toggle */}
            {(linkType === 'external' || linkType === 'page') && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Open in new tab</Label>
                  <p className="text-xs text-muted-foreground">Opens link in a new browser tab</p>
                </div>
                <Switch
                  checked={openInNewTab}
                  onCheckedChange={setOpenInNewTab}
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
              onClick={() => setOpen(false)}
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
                'Add Item'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
