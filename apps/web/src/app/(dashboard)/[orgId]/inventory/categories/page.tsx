import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveOrgId } from '@/lib/api';
import { CategoriesList } from '@/components/features/inventory';

export const metadata: Metadata = {
  title: 'Inventory Categories',
};

interface CategoriesPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/${orgIdentifier}/inventory`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Organize inventory items into hierarchical categories.
          </p>
        </div>
      </div>

      <CategoriesList orgId={orgId} />
    </div>
  );
}
