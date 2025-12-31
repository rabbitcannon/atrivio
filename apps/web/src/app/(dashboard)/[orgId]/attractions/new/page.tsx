import type { Metadata } from 'next';
import { AttractionForm } from '@/components/features/attractions/attraction-form';

export const metadata: Metadata = {
  title: 'New Attraction',
};

interface NewAttractionPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function NewAttractionPage({ params }: NewAttractionPageProps) {
  const { orgId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Attraction</h1>
        <p className="text-muted-foreground">Add a new attraction to your organization.</p>
      </div>

      <AttractionForm orgId={orgId} />
    </div>
  );
}
