import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  createStorefrontPage,
  getAttraction,
  getStorefrontNavigation,
  resolveOrgId,
  updateStorefrontNavigation,
} from '@/lib/api';
import type { StorefrontNavItem } from '@/lib/api/types';
import { PageEditorForm, type PageFormData } from '../_components/page-editor-form';

export const metadata: Metadata = {
  title: 'Create New Page',
};

interface NewPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

// Helper to convert StorefrontNavItem to API expected format
function mapNavItemForApi(item: StorefrontNavItem) {
  // Map linkType to the API's expected 'type' values
  let type: 'page' | 'link' | 'dropdown' = 'link';
  if (item.linkType === 'page') {
    type = 'page';
  } else if (item.linkType === 'external' || item.linkType === 'home' || item.linkType === 'tickets') {
    type = 'link';
  }

  return {
    label: item.label,
    type,
    pageId: item.pageId ?? undefined,
    url: item.externalUrl || item.url || (item.linkType === 'home' ? '/' : item.linkType === 'tickets' ? '/tickets' : undefined),
    openNewTab: item.openInNewTab || item.openNewTab,
  };
}

export default async function NewStorefrontPage({ params }: NewPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  const resolvedOrgId = await resolveOrgId(orgIdentifier);
  if (!resolvedOrgId) {
    notFound();
  }
  const orgId: string = resolvedOrgId;

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  // Get attraction details for preview URL and breadcrumbs
  let attractionSlug: string | undefined;
  let attractionName = '';
  try {
    const attractionResult = await getAttraction(orgId, attractionId);
    attractionSlug = attractionResult.data?.slug;
    attractionName = attractionResult.data?.name ?? '';
  } catch {
    // Attraction not found
  }

  // Capture values for server action
  const capturedOrgId = orgId;
  const capturedAttractionId = attractionId;

  async function handleSave(data: PageFormData) {
    'use server';

    const payload: Parameters<typeof createStorefrontPage>[2] = {
      pageType: data.pageType,
      slug: data.slug,
      title: data.title,
      showInNav: data.showInNav,
      status: data.status,
      contentFormat: data.contentFormat,
    };
    if (data.content) payload.content = data.content;
    if (data.seo.title) payload.metaTitle = data.seo.title;
    if (data.seo.description) payload.metaDescription = data.seo.description;
    if (data.seo.ogImageUrl) payload.ogImageUrl = data.seo.ogImageUrl;

    // Create the page first
    const result = await createStorefrontPage(capturedOrgId, capturedAttractionId, payload);
    const createdPage = result.data?.page;

    // If showInNav is true and page is published, add to navigation
    if (data.showInNav && data.status === 'published' && createdPage) {
      try {
        const navResult = await getStorefrontNavigation(capturedOrgId, capturedAttractionId);
        const currentNav = navResult.data?.navigation ?? { header: [], footer: [] };

        // Add new nav item for this page to header
        const newNavItem = {
          label: data.title,
          type: 'page' as const,
          pageId: createdPage.id,
          openNewTab: false,
        };

        await updateStorefrontNavigation(capturedOrgId, capturedAttractionId, {
          header: [...currentNav.header.map(mapNavItemForApi), newNavItem],
          footer: currentNav.footer.map(mapNavItemForApi),
        });
      } catch {
        // Navigation sync failed, but page was created - don't fail the whole operation
        console.error('Failed to sync navigation after page creation');
      }
    }
  }

  const breadcrumbs = [
    { label: 'Attractions', href: `/${orgIdentifier}/attractions` },
    { label: attractionName || 'Attraction', href: basePath },
    { label: 'Storefront', href: `${basePath}/storefront` },
    { label: 'Pages', href: `${basePath}/storefront/pages` },
    { label: 'New Page' },
  ];

  return (
    <div className="container py-6 space-y-6">
      <Breadcrumb items={breadcrumbs} />
      <PageEditorForm
        orgId={orgIdentifier}
        attractionId={attractionId}
        attractionSlug={attractionSlug}
        onSave={handleSave}
        isNew
      />
    </div>
  );
}
