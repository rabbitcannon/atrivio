import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MembersTable } from '@/components/features/organizations/members-table';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Members',
};

interface MembersPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { orgId: orgIdentifier } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage organization members and their roles.</p>
        </div>
      </div>

      <MembersTable orgId={orgId} />
    </div>
  );
}
