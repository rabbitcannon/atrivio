import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createStorefrontPage, getAttraction, resolveOrgId } from '@/lib/api';
import { PageEditorForm, type PageFormData } from '../_components/page-editor-form';

export const metadata: Metadata = {
  title: 'Create New Page',
};

interface NewPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

export default async function NewStorefrontPage({ params }: NewPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  const resolvedOrgId = await resolveOrgId(orgIdentifier);
  if (!resolvedOrgId) {
    notFound();
  }
  const orgId: string = resolvedOrgId;

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

    await createStorefrontPage(capturedOrgId, capturedAttractionId, payload);
  }

  return (
    <div className="container py-6">
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
