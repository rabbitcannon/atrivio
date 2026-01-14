import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { FadeIn } from '@/components/ui/motion';
import { getAttraction, resolveOrgId } from '@/lib/api';
import { PageEditorForm, type PageFormData } from '../_components/page-editor-form';
import { createPageAction } from './actions';

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

  // Create a bound server action with the orgId and attractionId
  async function handleSave(data: PageFormData): Promise<void> {
    'use server';
    await createPageAction(orgId, attractionId, data);
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
      <AnimatedPageHeader>
        <h1 className="text-3xl font-bold tracking-tight">Create New Page</h1>
        <p className="text-muted-foreground">Add a new content page to your storefront.</p>
      </AnimatedPageHeader>
      <FadeIn delay={0.1}>
        <PageEditorForm
          orgId={orgId}
          orgSlug={orgIdentifier}
          attractionId={attractionId}
          attractionSlug={attractionSlug}
          onSave={handleSave}
          isNew
        />
      </FadeIn>
    </div>
  );
}
