import { AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OrgSettingsForm } from '@/components/features/organizations/org-settings-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getOrganization, resolveOrgId } from '@/lib/api';

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

  // Fetch organization data
  const result = await getOrganization(orgId);

  if (result.error || !result.data) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading organization</AlertTitle>
          <AlertDescription>
            {result.error?.message ||
              'Failed to load organization. Please try refreshing the page.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization details and preferences.</p>
      </div>

      <OrgSettingsForm orgId={orgId} organization={result.data} />
    </div>
  );
}
