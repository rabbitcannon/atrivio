import {
  ChevronDown,
  ExternalLink,
  FileText,
  GripVertical,
  Home,
  Navigation,
  PanelBottom,
  PanelTop,
  Ticket,
} from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import {
  getAttraction,
  getStorefrontNavigation,
  getStorefrontPages,
  resolveOrgId,
  updateStorefrontNavigation,
} from '@/lib/api';
import type { StorefrontNavItem, StorefrontNavigation, StorefrontPage } from '@/lib/api/types';
import type { NavItemFormData, NavPosition } from './_components/nav-item-dialog';
import { NavItemDialog } from './_components/nav-item-dialog';
import { NavigationActions } from './_components/navigation-actions';

export const metadata: Metadata = {
  title: 'Storefront Navigation',
};

interface NavigationPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

function getNavItemIcon(linkType: string) {
  switch (linkType) {
    case 'home':
      return <Home className="h-4 w-4 text-muted-foreground" />;
    case 'page':
      return <FileText className="h-4 w-4 text-muted-foreground" />;
    case 'tickets':
      return <Ticket className="h-4 w-4 text-muted-foreground" />;
    case 'external':
      return <ExternalLink className="h-4 w-4 text-muted-foreground" />;
    case 'dropdown':
      return <ChevronDown className="h-4 w-4 text-muted-foreground" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
}

function getNavItemUrl(item: StorefrontNavItem, pages: StorefrontPage[]): string {
  switch (item.linkType) {
    case 'home':
      return '/';
    case 'tickets':
      return '/tickets';
    case 'page':
      if (item.pageId) {
        const page = pages.find((p) => p.id === item.pageId);
        return page ? `/${page.slug}` : '#';
      }
      return '#';
    case 'external':
      return item.externalUrl || item.url || '#';
    default:
      return '#';
  }
}

interface NavItemDisplayProps {
  item: StorefrontNavItem;
  pages: StorefrontPage[];
  position: NavPosition;
  onEdit: (
    item: StorefrontNavItem & { position: NavPosition },
    data: NavItemFormData
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (
    itemId: string,
    position: NavPosition
  ) => Promise<{ success: boolean; error?: string }>;
}

function NavItemDisplay({ item, pages, position, onEdit, onDelete }: NavItemDisplayProps) {
  const url = getNavItemUrl(item, pages);

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {getNavItemIcon(item.linkType)}
          <span className="font-medium">{item.label}</span>
          <Badge variant="outline" className="text-xs">
            {item.linkType}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {url}
          {(item.openInNewTab || item.openNewTab) && ' (opens in new tab)'}
        </p>
      </div>
      <NavigationActions
        item={{ ...item, position }}
        pages={pages}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

// Helper to convert NavItemFormData to API expected format
// Defined at module level so server actions can reference it without serialization issues
function mapFormDataForApi(data: NavItemFormData) {
  return {
    label: data.label,
    linkType: data.linkType as 'home' | 'page' | 'tickets' | 'external',
    pageId: data.pageId,
    externalUrl: data.externalUrl,
    openInNewTab: data.openInNewTab,
  };
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
  let attractionName = '';

  try {
    const [navResult, pagesResult, attractionResult] = await Promise.all([
      getStorefrontNavigation(orgId, attractionId),
      getStorefrontPages(orgId, attractionId),
      getAttraction(orgId, attractionId),
    ]);
    navigation = navResult.data?.navigation ?? { header: [], footer: [] };
    pages = pagesResult.data?.pages ?? [];
    attractionName = attractionResult.data?.name ?? '';
  } catch {
    // Feature might not be enabled
  }

  const headerItems = navigation.header || [];
  const footerItems = navigation.footer || [];
  const totalDropdownItems = [...headerItems, ...footerItems].reduce(
    (sum, item) => sum + (item.children?.length || 0),
    0
  );

  // Capture values for server actions
  const capturedOrgId = orgId;
  const capturedAttractionId = attractionId;

  // Server action: Add navigation item
  async function handleAddNavItem(
    data: NavItemFormData
  ): Promise<{ success: boolean; error?: string }> {
    'use server';
    try {
      // Get current navigation
      const currentNav = await getStorefrontNavigation(capturedOrgId, capturedAttractionId);
      const current = currentNav.data?.navigation ?? { header: [], footer: [] };

      // Create new item for API
      const newItem = mapFormDataForApi(data);

      // Add to appropriate position
      const updatedNavigation = {
        header:
          data.position === 'header'
            ? [...current.header.map(mapItemForApi), newItem]
            : current.header.map(mapItemForApi),
        footer:
          data.position === 'footer'
            ? [...current.footer.map(mapItemForApi), newItem]
            : current.footer.map(mapItemForApi),
      };

      const result = await updateStorefrontNavigation(
        capturedOrgId,
        capturedAttractionId,
        updatedNavigation
      );

      if (result.error) {
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: error.message || 'Failed to add navigation item' };
    }
  }

  // Server action: Edit navigation item
  async function handleEditNavItem(
    item: StorefrontNavItem & { position: NavPosition },
    data: NavItemFormData
  ): Promise<{ success: boolean; error?: string }> {
    'use server';
    try {
      // Get current navigation
      const currentNav = await getStorefrontNavigation(capturedOrgId, capturedAttractionId);
      const current = currentNav.data?.navigation ?? { header: [], footer: [] };

      // Updated item for API
      const updatedItem = mapFormDataForApi(data);

      // If position changed, remove from old and add to new
      if (item.position !== data.position) {
        const updatedNavigation = {
          header:
            item.position === 'header'
              ? current.header.filter((i) => i.id !== item.id).map(mapItemForApi)
              : data.position === 'header'
                ? [...current.header.map(mapItemForApi), updatedItem]
                : current.header.map(mapItemForApi),
          footer:
            item.position === 'footer'
              ? current.footer.filter((i) => i.id !== item.id).map(mapItemForApi)
              : data.position === 'footer'
                ? [...current.footer.map(mapItemForApi), updatedItem]
                : current.footer.map(mapItemForApi),
        };

        const result = await updateStorefrontNavigation(
          capturedOrgId,
          capturedAttractionId,
          updatedNavigation
        );

        if (result.error) {
          return { success: false, error: result.error.message };
        }
        return { success: true };
      }

      // Same position - just update in place
      const updatedNavigation = {
        header: current.header.map((i) => (i.id === item.id ? updatedItem : mapItemForApi(i))),
        footer: current.footer.map((i) => (i.id === item.id ? updatedItem : mapItemForApi(i))),
      };

      const result = await updateStorefrontNavigation(
        capturedOrgId,
        capturedAttractionId,
        updatedNavigation
      );

      if (result.error) {
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: error.message || 'Failed to update navigation item' };
    }
  }

  // Server action: Delete navigation item
  async function handleDeleteNavItem(
    itemId: string,
    position: NavPosition
  ): Promise<{ success: boolean; error?: string }> {
    'use server';
    try {
      // Get current navigation
      const currentNav = await getStorefrontNavigation(capturedOrgId, capturedAttractionId);
      const current = currentNav.data?.navigation ?? { header: [], footer: [] };

      // Remove item from appropriate position
      const updatedNavigation = {
        header:
          position === 'header'
            ? current.header.filter((i) => i.id !== itemId).map(mapItemForApi)
            : current.header.map(mapItemForApi),
        footer:
          position === 'footer'
            ? current.footer.filter((i) => i.id !== itemId).map(mapItemForApi)
            : current.footer.map(mapItemForApi),
      };

      const result = await updateStorefrontNavigation(
        capturedOrgId,
        capturedAttractionId,
        updatedNavigation
      );

      if (result.error) {
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: error.message || 'Failed to delete navigation item' };
    }
  }

  const breadcrumbs = [
    { label: 'Attractions', href: `/${orgIdentifier}/attractions` },
    { label: attractionName || 'Attraction', href: basePath },
    { label: 'Storefront', href: `${basePath}/storefront` },
    { label: 'Navigation' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Breadcrumb items={breadcrumbs} />
        <AnimatedPageHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
            <p className="text-muted-foreground">Configure header and footer navigation menus.</p>
          </div>
          <NavItemDialog pages={pages} onSave={handleAddNavItem} />
        </AnimatedPageHeader>
      </div>

      {/* Stats */}
      <StaggerContainer className="grid gap-4 md:grid-cols-3" staggerDelay={0.05} delayChildren={0.1}>
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Header Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{headerItems.length}</div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Footer Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{footerItems.length}</div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dropdown Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDropdownItems}</div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Header Navigation */}
      <FadeIn delay={0.15}>
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
              <NavItemDialog pages={pages} onSave={handleAddNavItem} />
            </div>
          ) : (
            <div className="space-y-2">
              {headerItems.map((item) => (
                <div key={item.id}>
                  <NavItemDisplay
                    item={item}
                    pages={pages}
                    position="header"
                    onEdit={handleEditNavItem}
                    onDelete={handleDeleteNavItem}
                  />
                  {item.children && item.children.length > 0 && (
                    <div className="ml-8 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <NavItemDisplay
                          key={child.id}
                          item={child}
                          pages={pages}
                          position="header"
                          onEdit={handleEditNavItem}
                          onDelete={handleDeleteNavItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </FadeIn>

      {/* Footer Navigation */}
      <FadeIn delay={0.2}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PanelBottom className="h-5 w-5" />
            Footer Navigation
          </CardTitle>
          <CardDescription>Links shown in the footer of your storefront</CardDescription>
        </CardHeader>
        <CardContent>
          {footerItems.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Navigation className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-3">No footer navigation items</p>
              <NavItemDialog pages={pages} onSave={handleAddNavItem} />
            </div>
          ) : (
            <div className="space-y-2">
              {footerItems.map((item) => (
                <div key={item.id}>
                  <NavItemDisplay
                    item={item}
                    pages={pages}
                    position="footer"
                    onEdit={handleEditNavItem}
                    onDelete={handleDeleteNavItem}
                  />
                  {item.children && item.children.length > 0 && (
                    <div className="ml-8 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <NavItemDisplay
                          key={child.id}
                          item={child}
                          pages={pages}
                          position="footer"
                          onEdit={handleEditNavItem}
                          onDelete={handleDeleteNavItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </FadeIn>

      {/* Tips */}
      <FadeIn delay={0.25}>
      <Card>
        <CardHeader>
          <CardTitle>Navigation Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Page Links:</strong> Link directly to pages you&apos;ve created in your
            storefront.
          </p>
          <p>
            <strong>External Links:</strong> Add links to external websites like social media or
            third-party ticket sales.
          </p>
          <p>
            <strong>Special Pages:</strong> &quot;Home&quot; and &quot;Tickets&quot; are built-in
            pages that link to your storefront home and ticket purchasing page.
          </p>
        </CardContent>
      </Card>
      </FadeIn>
    </div>
  );
}

// Helper to convert StorefrontNavItem to API expected format
function mapItemForApi(item: StorefrontNavItem) {
  return {
    label: item.label,
    linkType: item.linkType as 'home' | 'page' | 'tickets' | 'external',
    pageId: item.pageId ?? undefined,
    externalUrl: item.externalUrl || item.url,
    openInNewTab: item.openInNewTab || item.openNewTab,
  };
}
