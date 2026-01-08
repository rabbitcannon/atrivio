import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAttraction, getStorefrontPage, resolveOrgId, updateStorefrontPage } from '@/lib/api';
import { PageEditorForm, type PageFormData } from '../../_components/page-editor-form';

export const metadata: Metadata = {
  title: 'Edit Page',
};

interface EditPageProps {
  params: Promise<{ orgId: string; attractionId: string; pageId: string }>;
}

export default async function EditStorefrontPage({ params }: EditPageProps) {
  const { orgId: orgIdentifier, attractionId, pageId } = await params;

  const resolvedOrgId = await resolveOrgId(orgIdentifier);
  if (!resolvedOrgId) {
    notFound();
  }
  const orgId: string = resolvedOrgId;

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

  // Get attraction details for preview URL
  let attractionSlug: string | undefined;
  try {
    const attractionResult = await getAttraction(orgId, attractionId);
    attractionSlug = attractionResult.data?.slug;
  } catch {
    // Attraction not found
  }

  // Capture values for server action
  const capturedOrgId = orgId;
  const capturedAttractionId = attractionId;
  const capturedPageId = pageId;

  async function handleSave(data: PageFormData) {
    'use server';

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

    await updateStorefrontPage(capturedOrgId, capturedAttractionId, capturedPageId, payload);
  }

  return (
    <div className="container py-6">
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
