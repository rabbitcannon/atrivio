import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { StaffForm } from '@/components/features/staff/staff-form';
import { FadeIn } from '@/components/ui/motion';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Invite Staff',
};

interface NewStaffPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function NewStaffPage({ params }: NewStaffPageProps) {
  const { orgId: orgIdentifier } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader>
        <h1 className="text-3xl font-bold">Invite Staff Member</h1>
        <p className="text-muted-foreground">
          Send an invitation to add a new staff member to your organization.
        </p>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <StaffForm orgId={orgId} />
      </FadeIn>
    </div>
  );
}
