import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { resolveOrgId, getStorefrontSettings, getStorefrontDomains, getAttraction } from '@/lib/api';
import { StorefrontSettingsForm } from '@/components/features/storefronts/settings-form';
import type { StorefrontSettings, StorefrontDomain } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Storefront Settings',
};

interface SettingsPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

export default async function StorefrontSettingsPage({ params }: SettingsPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  let settings: StorefrontSettings | null = null;
  let domains: StorefrontDomain[] = [];
  let attractionName = '';

  try {
    const [settingsResult, domainsResult, attractionResult] = await Promise.all([
      getStorefrontSettings(orgId, attractionId),
      getStorefrontDomains(orgId, attractionId),
      getAttraction(orgId, attractionId),
    ]);
    settings = settingsResult.data?.settings ?? null;
    domains = domainsResult.data?.domains ?? [];
    attractionName = attractionResult.data?.name ?? '';
  } catch {
    // Settings might not exist yet
  }

  const subdomainDomain = domains.find((d) => d.domainType === 'subdomain');
  const primaryDomain = domains.find((d) => d.isPrimary && d.domainType === 'custom');
  const subdomain = subdomainDomain?.domain ?? `${attractionName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.haunt.dev`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`${basePath}/storefront`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Storefront
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storefront Settings</h1>
          <p className="text-muted-foreground">
            Configure your storefront&apos;s appearance and behavior.
          </p>
        </div>
        <Badge variant={settings?.isPublished ? 'default' : 'secondary'}>
          {settings?.isPublished ? 'Published' : 'Draft'}
        </Badge>
      </div>

      {/* Domain Info (read-only, configured elsewhere) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Configuration
          </CardTitle>
          <CardDescription>
            Your storefront URLs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Subdomain</label>
              <div className="mt-1 flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="text-sm">{subdomain}</code>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Your default storefront URL
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Primary Domain</label>
              <div className="mt-1 flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="text-sm">
                  {primaryDomain?.domain ?? 'Not configured'}
                </code>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Custom domain for your storefront
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure custom domains in the{' '}
            <Link href={`${basePath}/storefront/domains`} className="text-primary hover:underline">
              Domains
            </Link>{' '}
            section.
          </p>
        </CardContent>
      </Card>

      {/* Editable Settings Form */}
      <StorefrontSettingsForm
        orgId={orgId}
        attractionId={attractionId}
        settings={settings}
      />
    </div>
  );
}
