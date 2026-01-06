import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Plus, Eye, Edit, MoreHorizontal, Globe, EyeOff, Archive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveOrgId, getStorefrontPages } from '@/lib/api';
import type { StorefrontPage, PageStatus } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Storefront Pages',
};

interface PagesPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  home: 'Home',
  about: 'About',
  faq: 'FAQ',
  contact: 'Contact',
  rules: 'Rules',
  jobs: 'Jobs',
  gallery: 'Gallery',
  custom: 'Custom',
};

const STATUS_CONFIG: Record<PageStatus, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: typeof Eye }> = {
  published: { label: 'Published', variant: 'default', icon: Eye },
  draft: { label: 'Draft', variant: 'secondary', icon: EyeOff },
  archived: { label: 'Archived', variant: 'outline', icon: Archive },
};

export default async function StorefrontPagesPage({ params }: PagesPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  let pages: StorefrontPage[] = [];

  try {
    const pagesResult = await getStorefrontPages(orgId, attractionId);
    pages = pagesResult.data?.pages ?? [];
  } catch {
    // Feature might not be enabled
  }

  // Group pages by status
  const publishedPages = pages.filter((p) => p.status === 'published');
  const draftPages = pages.filter((p) => p.status === 'draft');
  const archivedPages = pages.filter((p) => p.status === 'archived');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`${basePath}/storefront`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Storefront
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground">
            Create and manage your storefront content pages.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create Page
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftPages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedPages.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Pages
          </CardTitle>
          <CardDescription>
            {pages.length} total pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No pages yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first page to start building your storefront.
              </p>
              <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Create First Page
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {pages.map((page) => {
                const statusConfig = STATUS_CONFIG[page.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{page.title}</h4>
                          <Badge variant={statusConfig.variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>/{page.slug}</span>
                          <span>•</span>
                          <span>{PAGE_TYPE_LABELS[page.pageType] || page.pageType}</span>
                          {page.showInNav && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                In navigation
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" disabled>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm" disabled>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="icon" disabled>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Page creation and editing will be available in a future update.
      </p>
    </div>
  );
}
