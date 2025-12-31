import type { Metadata } from 'next';
import { OrgSettingsForm } from '@/components/features/organizations/org-settings-form';

export const metadata: Metadata = {
  title: 'Organization Settings',
};

interface SettingsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgId } = await params;

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
