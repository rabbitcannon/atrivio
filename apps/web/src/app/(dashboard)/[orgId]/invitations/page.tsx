import type { Metadata } from 'next';
import { InviteMemberDialog } from '@/components/features/organizations/invite-member-dialog';

export const metadata: Metadata = {
  title: 'Invitations',
};

interface InvitationsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function InvitationsPage({ params }: InvitationsPageProps) {
  const { orgId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground">Invite new members to your organization.</p>
        </div>
        <InviteMemberDialog orgId={orgId} />
      </div>

      {/* Pending invitations list */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <p className="text-sm text-muted-foreground">No pending invitations.</p>
        </div>
      </div>
    </div>
  );
}
