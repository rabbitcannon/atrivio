import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Navigation,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ExternalLink,
  FileText,
  ChevronDown,
  PanelTop,
  PanelBottom,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveOrgId, getStorefrontNavigation, getStorefrontPages } from '@/lib/api';
import type { StorefrontNavigation, StorefrontPage, StorefrontNavItem } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Storefront Navigation',
};

interface NavigationPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

function NavItemDisplay({ item, pages }: { item: StorefrontNavItem; pages: StorefrontPage[] }) {
  const page = item.pageId ? pages.find((p) => p.id === item.pageId) : null;

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {item.type === 'page' && <FileText className="h-4 w-4 text-muted-foreground" />}
          {item.type === 'link' && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
          {item.type === 'dropdown' && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          <span className="font-medium">{item.label}</span>
          <Badge variant="outline" className="text-xs">
            {item.type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.type === 'page' && page ? `/${page.slug}` : item.url || 'No destination'}
          {item.openNewTab && ' (opens in new tab)'}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
          <Edit className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default async function StorefrontNavigationPage({ params }: NavigationPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  let navigation: StorefrontNavigation = { header: [], footer: [] };
  let pages: StorefrontPage[] = [];

  try {
    const [navResult, pagesResult] = await Promise.all([
      getStorefrontNavigation(orgId, attractionId),
      getStorefrontPages(orgId, attractionId),
    ]);
    navigation = navResult.data?.navigation ?? { header: [], footer: [] };
    pages = pagesResult.data?.pages ?? [];
  } catch {
    // Feature might not be enabled
  }

  const headerItems = navigation.header || [];
  const footerItems = navigation.footer || [];
  const totalDropdownItems = [...headerItems, ...footerItems].reduce(
    (sum, item) => sum + (item.children?.length || 0),
    0
  );

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
          <h1 className="text-3xl font-bold">Navigation</h1>
          <p className="text-muted-foreground">
            Configure header and footer navigation menus.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Nav Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Header Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{headerItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Footer Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{footerItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dropdown Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDropdownItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Header Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PanelTop className="h-5 w-5" />
            Header Navigation
          </CardTitle>
          <CardDescription>
            Main navigation menu shown at the top of your storefront
          </CardDescription>
        </CardHeader>
        <CardContent>
          {headerItems.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Navigation className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-3">No header navigation items</p>
              <Button size="sm" disabled>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {headerItems.map((item) => (
                <div key={item.id}>
                  <NavItemDisplay item={item} pages={pages} />
                  {item.children && item.children.length > 0 && (
                    <div className="ml-8 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <NavItemDisplay key={child.id} item={child} pages={pages} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PanelBottom className="h-5 w-5" />
            Footer Navigation
          </CardTitle>
          <CardDescription>
            Links shown in the footer of your storefront
          </CardDescription>
        </CardHeader>
        <CardContent>
          {footerItems.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Navigation className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-3">No footer navigation items</p>
              <Button size="sm" disabled>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {footerItems.map((item) => (
                <div key={item.id}>
                  <NavItemDisplay item={item} pages={pages} />
                  {item.children && item.children.length > 0 && (
                    <div className="ml-8 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <NavItemDisplay key={child.id} item={child} pages={pages} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Page Links:</strong> Link directly to pages you've created in your storefront.
          </p>
          <p>
            <strong>External Links:</strong> Add links to external websites like social media or ticket sales.
          </p>
          <p>
            <strong>Dropdowns:</strong> Group related links under a parent menu item.
          </p>
          <p>
            <strong>Reorder:</strong> Drag items to rearrange the navigation order.
          </p>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Navigation editing will be available in a future update.
      </p>
    </div>
  );
}
