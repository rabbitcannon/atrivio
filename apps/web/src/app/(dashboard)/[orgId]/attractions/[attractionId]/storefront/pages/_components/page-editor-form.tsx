'use client';

import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageContentEditor } from '@/components/editor/page-content-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import type { ContentFormat, PageStatus, PageType, StorefrontPage } from '@/lib/api/types';
import { createPageAction, updatePageAction } from '../new/actions';
import type { PageFormData } from './types';

// Re-export for backwards compatibility
export type { PageFormData } from './types';

interface PageEditorFormProps {
  orgId: string;
  orgSlug?: string;
  attractionId: string;
  attractionSlug?: string | undefined;
  page?: StorefrontPage;
  onSave?: (data: PageFormData) => Promise<void>;
  isNew?: boolean;
}

const PAGE_TYPES: { value: PageType; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'faq', label: 'FAQ' },
  { value: 'contact', label: 'Contact' },
  { value: 'rules', label: 'Rules & Policies' },
  { value: 'jobs', label: 'Jobs / Careers' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'custom', label: 'Custom Page' },
];

const STATUS_OPTIONS: { value: PageStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export function PageEditorForm({
  orgId,
  orgSlug,
  attractionId,
  attractionSlug,
  page,
  onSave,
  isNew = false,
}: PageEditorFormProps) {
  const router = useRouter();
  // Use orgSlug for URLs (human-readable), orgId for API calls (UUID)
  const urlOrgId = orgSlug || orgId;
  const basePath = `/${urlOrgId}/attractions/${attractionId}/storefront/pages`;

  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState(page?.title ?? '');
  const [slug, setSlug] = useState(page?.slug ?? '');
  const [content, setContent] = useState(page?.content ?? '');
  const [contentFormat] = useState<ContentFormat>(page?.contentFormat ?? 'html');
  const [pageType, setPageType] = useState<PageType>(page?.pageType ?? 'custom');
  const [status, setStatus] = useState<PageStatus>(page?.status ?? 'draft');
  const [showInNav, setShowInNav] = useState(page?.showInNav ?? false);
  const [seoTitle, setSeoTitle] = useState(page?.seo?.title ?? '');
  const [seoDescription, setSeoDescription] = useState(page?.seo?.description ?? '');
  const [seoOgImageUrl, setSeoOgImageUrl] = useState(page?.seo?.ogImageUrl ?? '');

  // Auto-generate slug from title for new pages
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isNew && !slug) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData: PageFormData = {
        slug,
        title,
        content,
        contentFormat,
        pageType,
        status,
        showInNav,
        seo: {
          title: seoTitle,
          description: seoDescription,
          ogImageUrl: seoOgImageUrl,
        },
      };

      // Call the server action directly from this client component
      if (isNew) {
        await createPageAction(orgId, attractionId, formData);
      } else if (page?.id) {
        await updatePageAction(orgId, attractionId, page.id, formData);
      } else if (onSave) {
        // Fallback to onSave prop if provided
        await onSave(formData);
      }

      router.push(basePath);
      router.refresh();
    } catch (error) {
      console.error('Failed to save page:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save page';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab
    const previewUrl = attractionSlug
      ? `http://localhost:3002/${slug}?storefront=${attractionSlug}`
      : `http://localhost:3002/${slug}`;
    window.open(previewUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(basePath)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pages
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || !title || !slug}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isNew ? 'Create Page' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Page Details</CardTitle>
              <CardDescription>Basic information about your page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter page title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    placeholder="page-url"
                    className="font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  The URL path for this page (e.g., /about, /rules)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Write your page content</CardDescription>
            </CardHeader>
            <CardContent>
              <PageContentEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your page content..."
                minHeight="400px"
              />
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Meta Title</Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || 'Page title for search engines'}
                />
                <p className="text-xs text-muted-foreground">
                  {seoTitle.length}/60 characters (leave empty to use page title)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Brief description of this page for search results..."
                  className="h-20"
                />
                <p className="text-xs text-muted-foreground">
                  {seoDescription.length}/160 characters recommended
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoOgImage">Social Share Image (OG Image)</Label>
                <Input
                  id="seoOgImage"
                  type="url"
                  value={seoOgImageUrl}
                  onChange={(e) => setSeoOgImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Image shown when shared on Facebook, Twitter, Slack, etc. Recommended: 1200x630px
                </p>
                {seoOgImageUrl && (
                  <div className="mt-2 rounded-md border overflow-hidden">
                    <img
                      src={seoOgImageUrl}
                      alt="OG Image preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right 1/3 */}
        <div className="space-y-6">
          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as PageStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show in Navigation</Label>
                  <p className="text-xs text-muted-foreground">
                    {status === 'published'
                      ? 'Auto-add to header menu when saved'
                      : 'Publish page first to add to navigation'}
                  </p>
                </div>
                <Switch
                  checked={showInNav}
                  onCheckedChange={setShowInNav}
                  disabled={status !== 'published'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Page Type */}
          <Card>
            <CardHeader>
              <CardTitle>Page Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={pageType} onValueChange={(v) => setPageType(v as PageType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Helps organize your pages and may affect default styling
              </p>
            </CardContent>
          </Card>

          {/* Page Info (for existing pages) */}
          {page && (
            <Card>
              <CardHeader>
                <CardTitle>Page Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Page ID</span>
                  <span className="font-mono text-xs">{page.id.slice(0, 8)}...</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
