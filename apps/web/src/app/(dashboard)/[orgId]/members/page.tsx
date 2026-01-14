import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { MembersTable } from '@/components/features/organizations/members-table';
import { FadeIn } from '@/components/ui/motion';
import { requireRole } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Members',
};

interface MembersPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { orgId: orgIdentifier } = await params;

  // Require owner, admin, or hr role
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'hr']);
  if (!auth) {
    notFound();
  }

  const { orgId } = auth;

  return (
    <div className="space-y-6">
      <AnimatedPageHeader className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage organization members and their roles.</p>
        </div>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <MembersTable orgId={orgId} />
      </FadeIn>
    </div>
  );
}
