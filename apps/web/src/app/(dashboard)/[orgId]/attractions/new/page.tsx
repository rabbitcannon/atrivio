import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { AttractionForm } from '@/components/features/attractions/attraction-form';
import { FadeIn } from '@/components/ui/motion';
import { getAttractionTypes, requireRole, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'New Attraction',
};

interface NewAttractionPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function NewAttractionPage({ params }: NewAttractionPageProps) {
  const { orgId: orgIdentifier } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Creating attractions requires owner, admin, or manager roles
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);

  // Fetch attraction types for the form
  const attractionTypes = await getAttractionTypes();

  return (
    <div className="space-y-6">
      <AnimatedPageHeader>
        <h1 className="text-3xl font-bold">Create Attraction</h1>
        <p className="text-muted-foreground">Add a new attraction to your organization.</p>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <AttractionForm orgId={orgId} attractionTypes={attractionTypes} />
      </FadeIn>
    </div>
  );
}
