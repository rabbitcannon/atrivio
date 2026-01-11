import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { StaffTable } from '@/components/features/staff/staff-table';
import { Button } from '@/components/ui/button';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Staff',
};

interface StaffPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { orgId: orgIdentifier } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff</h1>
          <p className="text-muted-foreground">
            Manage your staff roster, skills, and certifications.
          </p>
        </div>
        <Button asChild>
          <a href={`/${orgIdentifier}/staff/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </a>
        </Button>
      </AnimatedPageHeader>

      <StaffTable orgId={orgId} />
    </div>
  );
}
