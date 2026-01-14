import { AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { OrgSettingsForm } from '@/components/features/organizations/org-settings-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FadeIn } from '@/components/ui/motion';
import { getOrganization, requireRole } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Organization Settings',
};

interface SettingsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgId: orgIdentifier } = await params;

  // Require owner or admin role
  const auth = await requireRole(orgIdentifier, ['owner', 'admin']);
  if (!auth) {
    notFound();
  }

  const { orgId } = auth;

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
      <AnimatedPageHeader>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization details and preferences.</p>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <OrgSettingsForm orgId={orgId} organization={result.data} />
      </FadeIn>
    </div>
  );
}
