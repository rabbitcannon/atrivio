import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TemplateTable } from '@/components/features/scheduling';
import { Button } from '@/components/ui/button';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Shift Templates',
};

interface TemplatesPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function TemplatesPage({ params }: TemplatesPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${orgIdentifier}/schedule`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Shift Templates</h1>
          <p className="text-muted-foreground">
            Create reusable templates to quickly generate schedules.
          </p>
        </div>
      </div>

      <TemplateTable orgId={orgId} orgSlug={orgIdentifier} />
    </div>
  );
}
