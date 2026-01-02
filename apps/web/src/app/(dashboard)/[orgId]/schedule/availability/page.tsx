import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvailabilityMatrix } from '@/components/features/scheduling';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Staff Availability',
};

interface AvailabilityPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function AvailabilityPage({ params }: AvailabilityPageProps) {
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
          <h1 className="text-3xl font-bold">Staff Availability</h1>
          <p className="text-muted-foreground">
            View team availability and time-off requests.
          </p>
        </div>
      </div>

      <AvailabilityMatrix orgId={orgId} />
    </div>
  );
}
