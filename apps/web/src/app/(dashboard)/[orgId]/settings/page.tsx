import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OrgSettingsForm } from '@/components/features/organizations/org-settings-form';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Organization Settings',
};

interface SettingsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgId: orgIdentifier } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization details and preferences.</p>
      </div>

      <OrgSettingsForm orgId={orgId} />
    </div>
  );
}
