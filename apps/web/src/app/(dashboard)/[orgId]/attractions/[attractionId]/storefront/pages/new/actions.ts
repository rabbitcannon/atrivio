'use server';

import {
  createStorefrontPage,
  getStorefrontNavigation,
  updateStorefrontNavigation,
  updateStorefrontPage,
} from '@/lib/api';
import { getSession } from '@/lib/supabase/server';
import type { StorefrontNavItem } from '@/lib/api/types';
import type { PageFormData } from '../_components/types';

// Helper to convert StorefrontNavItem to API expected format
function mapNavItemForApi(item: StorefrontNavItem) {
  return {
    label: item.label,
    linkType: item.linkType as 'home' | 'page' | 'tickets' | 'external',
    pageId: item.pageId ?? undefined,
    externalUrl: item.externalUrl || item.url,
    openInNewTab: item.openInNewTab || item.openNewTab,
  };
}

export async function createPageAction(
  orgId: string,
  attractionId: string,
  data: PageFormData
) {
  // Debug all parameters
  console.log('[createPageAction] orgId:', orgId);
  console.log('[createPageAction] attractionId:', attractionId);
  console.log('[createPageAction] data:', JSON.stringify(data, null, 2));

  // Debug session availability
  const session = await getSession();
  console.log('[createPageAction] Session exists:', !!session);
  console.log('[createPageAction] Has access_token:', !!session?.access_token);
  console.log('[createPageAction] User ID:', session?.user?.id);
  if (!session) {
    console.error('[createPageAction] No session available in Server Action!');
    throw new Error('Not authenticated');
  }

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
  const result = await createStorefrontPage(orgId, attractionId, payload);

  // Check for API errors and throw so the form can handle it
  if (result.error) {
    console.error(
      'Failed to create storefront page. Error:',
      JSON.stringify(result.error, null, 2)
    );
    console.error('API call details - orgId:', orgId, 'attractionId:', attractionId);
    console.error('Payload:', JSON.stringify(payload, null, 2));
    // Include more details in error for debugging
    const errorDetails = [
      `API Error (${result.error.statusCode})`,
      result.error.message || result.error.error || 'Unknown error',
      `orgId: ${orgId}`,
      `attractionId: ${attractionId}`,
    ].join(' | ');
    throw new Error(errorDetails);
  }

  const createdPage = result.data?.page;

  // If showInNav is true and page is published, add to navigation
  if (data.showInNav && data.status === 'published' && createdPage) {
    try {
      const navResult = await getStorefrontNavigation(orgId, attractionId);
      const currentNav = navResult.data?.navigation ?? { header: [], footer: [] };

      // Add new nav item for this page to header
      const newNavItem = {
        label: data.title,
        linkType: 'page' as const,
        pageId: createdPage.id,
        openInNewTab: false,
      };

      await updateStorefrontNavigation(orgId, attractionId, {
        header: [...currentNav.header.map(mapNavItemForApi), newNavItem],
        footer: currentNav.footer.map(mapNavItemForApi),
      });
    } catch {
      // Navigation sync failed, but page was created - don't fail the whole operation
      console.error('Failed to sync navigation after page creation');
    }
  }

  return { success: true, page: createdPage };
}

export async function updatePageAction(
  orgId: string,
  attractionId: string,
  pageId: string,
  data: PageFormData
) {
  // Debug session availability
  const session = await getSession();
  console.log('[updatePageAction] Session exists:', !!session);
  console.log('[updatePageAction] Has access_token:', !!session?.access_token);
  if (!session) {
    console.error('[updatePageAction] No session available in Server Action!');
    throw new Error('Not authenticated');
  }

  const payload: Parameters<typeof updateStorefrontPage>[3] = {
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

  // Update the page
  const result = await updateStorefrontPage(orgId, attractionId, pageId, payload);

  // Check for API errors and throw so the form can handle it
  if (result.error) {
    console.error(
      'Failed to update storefront page. Error:',
      JSON.stringify(result.error, null, 2)
    );
    throw new Error(
      `API Error (${result.error.statusCode}): ${result.error.message || result.error.error || 'Unknown error'}`
    );
  }

  return { success: true, page: result.data?.page };
}
