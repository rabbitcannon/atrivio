import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  getAttraction,
  getStorefrontNavigation,
  getStorefrontPage,
  resolveOrgId,
  updateStorefrontNavigation,
  updateStorefrontPage,
} from '@/lib/api';
import type { StorefrontNavItem } from '@/lib/api/types';
import { PageEditorForm, type PageFormData } from '../../_components/page-editor-form';

export const metadata: Metadata = {
  title: 'Edit Page',
};

interface EditPageProps {
  params: Promise<{ orgId: string; attractionId: string; pageId: string }>;
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

export default async function EditStorefrontPage({ params }: EditPageProps) {
  const { orgId: orgIdentifier, attractionId, pageId } = await params;

  const resolvedOrgId = await resolveOrgId(orgIdentifier);
  if (!resolvedOrgId) {
    notFound();
  }
  const orgId: string = resolvedOrgId;

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  // Get the page
  let page;
  try {
    const pageResult = await getStorefrontPage(orgId, attractionId, pageId);
    page = pageResult.data?.page;
  } catch {
    notFound();
  }

  if (!page) {
    notFound();
  }

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
  const capturedPageId = pageId;
  const originalShowInNav = page.showInNav;
  const originalStatus = page.status;

  async function handleSave(data: PageFormData) {
    'use server';

    const payload: Parameters<typeof updateStorefrontPage>[3] = {
      slug: data.slug,
      title: data.title,
      showInNav: data.showInNav,
      status: data.status,
      contentFormat: data.contentFormat,
      // Always include SEO fields (even empty strings to allow clearing)
      metaTitle: data.seo.title || '',
      metaDescription: data.seo.description || '',
      ogImageUrl: data.seo.ogImageUrl || '',
    };
    if (data.content) payload.content = data.content;

    await updateStorefrontPage(capturedOrgId, capturedAttractionId, capturedPageId, payload);

    // Sync navigation based on showInNav changes
    const wasInNav = originalShowInNav && originalStatus === 'published';
    const shouldBeInNav = data.showInNav && data.status === 'published';

    if (wasInNav !== shouldBeInNav) {
      try {
        const navResult = await getStorefrontNavigation(capturedOrgId, capturedAttractionId);
        const currentNav = navResult.data?.navigation ?? { header: [], footer: [] };

        if (shouldBeInNav && !wasInNav) {
          // Add to navigation (header by default)
          const newNavItem = {
            label: data.title,
            type: 'page' as const,
            pageId: capturedPageId,
            openNewTab: false,
          };

          await updateStorefrontNavigation(capturedOrgId, capturedAttractionId, {
            header: [...currentNav.header.map(mapNavItemForApi), newNavItem],
            footer: currentNav.footer.map(mapNavItemForApi),
          });
        } else if (!shouldBeInNav && wasInNav) {
          // Remove from navigation (check both header and footer)
          const headerWithoutPage = currentNav.header.filter((item) => item.pageId !== capturedPageId);
          const footerWithoutPage = currentNav.footer.filter((item) => item.pageId !== capturedPageId);

          await updateStorefrontNavigation(capturedOrgId, capturedAttractionId, {
            header: headerWithoutPage.map(mapNavItemForApi),
            footer: footerWithoutPage.map(mapNavItemForApi),
          });
        }
      } catch {
        // Navigation sync failed, but page was updated - don't fail the whole operation
        console.error('Failed to sync navigation after page update');
      }
    }
  }

  const breadcrumbs = [
    { label: 'Attractions', href: `/${orgIdentifier}/attractions` },
    { label: attractionName || 'Attraction', href: basePath },
    { label: 'Storefront', href: `${basePath}/storefront` },
    { label: 'Pages', href: `${basePath}/storefront/pages` },
    { label: page.title || 'Edit Page' },
  ];

  return (
    <div className="container py-6 space-y-6">
      <Breadcrumb items={breadcrumbs} />
      <PageEditorForm
        orgId={orgIdentifier}
        attractionId={attractionId}
        attractionSlug={attractionSlug}
        page={page}
        onSave={handleSave}
      />
    </div>
  );
}
