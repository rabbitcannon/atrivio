import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { InviteMemberDialog } from '@/components/features/organizations/invite-member-dialog';
import { FadeIn } from '@/components/ui/motion';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Invitations',
};

interface InvitationsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function InvitationsPage({ params }: InvitationsPageProps) {
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
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground">Invite new members to your organization.</p>
        </div>
        <InviteMemberDialog orgId={orgId} />
      </AnimatedPageHeader>

      {/* Pending invitations list */}
      <FadeIn delay={0.1}>
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <p className="text-sm text-muted-foreground">No pending invitations.</p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
