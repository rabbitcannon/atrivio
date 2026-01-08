import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Globe,
  Link2,
  Plus,
  RefreshCw,
  Shield,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStorefrontDomains, getStorefrontSettings, resolveOrgId } from '@/lib/api';
import type { DomainStatus, StorefrontDomain, StorefrontSettings } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Storefront Domains',
};

interface DomainsPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

const STATUS_CONFIG: Record<
  DomainStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    icon: typeof CheckCircle2;
  }
> = {
  active: { label: 'Active', variant: 'default', icon: CheckCircle2 },
  verifying: { label: 'Verifying', variant: 'secondary', icon: Clock },
  pending: { label: 'Pending', variant: 'outline', icon: AlertCircle },
  failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
  expired: { label: 'Expired', variant: 'destructive', icon: XCircle },
};

export default async function StorefrontDomainsPage({ params }: DomainsPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  let domains: StorefrontDomain[] = [];
  let _settings: StorefrontSettings | null = null;

  try {
    const [domainsResult, settingsResult] = await Promise.all([
      getStorefrontDomains(orgId, attractionId),
      getStorefrontSettings(orgId, attractionId),
    ]);
    domains = domainsResult.data?.domains ?? [];
    _settings = settingsResult.data?.settings ?? null;
  } catch {
    // Feature might not be enabled
  }

  // Find the default subdomain (domain ending with .hauntplatform.com)
  const defaultSubdomain = domains.find((d) => d.domainType === 'subdomain');

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
          <h1 className="text-3xl font-bold">Domains</h1>
          <p className="text-muted-foreground">Manage custom domains for your storefront.</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </div>

      {/* Default Subdomain */}
      {defaultSubdomain && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Default Subdomain
            </CardTitle>
            <CardDescription>Your free subdomain on hauntplatform.com</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">{defaultSubdomain.domain}</p>
                  <p className="text-sm text-muted-foreground">Always available • SSL included</p>
                </div>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Custom Domains
          </CardTitle>
          <CardDescription>Connect your own domain to your storefront</CardDescription>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No custom domains</h3>
              <p className="text-muted-foreground mb-4">
                Add a custom domain to use your own URL for your storefront.
              </p>
              <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Domain
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => {
                const statusConfig = STATUS_CONFIG[domain.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{domain.domain}</h4>
                          {domain.isPrimary && (
                            <Badge variant="outline" className="text-amber-600">
                              <Star className="mr-1 h-3 w-3" />
                              Primary
                            </Badge>
                          )}
                          <Badge variant={statusConfig.variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="capitalize">{domain.domainType}</span>
                          {domain.sslStatus === 'active' && (
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3 text-green-500" />
                              SSL
                            </span>
                          )}
                          {domain.verifiedAt && (
                            <span>Verified {new Date(domain.verifiedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {domain.status === 'pending' || domain.status === 'failed' ? (
                        <Button variant="outline" size="sm" disabled>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Verify
                        </Button>
                      ) : null}
                      {!domain.isPrimary && domain.status === 'active' && (
                        <Button variant="ghost" size="sm" disabled>
                          Set as Primary
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" disabled>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DNS Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Connect a Custom Domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              <strong>Add your domain</strong> using the button above
            </li>
            <li>
              <strong>Configure DNS records</strong> at your domain registrar:
              <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-xs">
                <p>Type: CNAME</p>
                <p>Name: www (or @)</p>
                <p>Value: cname.haunt.dev</p>
              </div>
              <p className="mt-1 text-muted-foreground">
                For apex domains (example.com), you may need an ALIAS or ANAME record.
              </p>
            </li>
            <li>
              <strong>Verify your domain</strong> - we&apos;ll check the DNS records and provision
              SSL automatically
            </li>
            <li>
              <strong>Set as primary</strong> (optional) - make this your main storefront URL
            </li>
          </ol>
          <p className="text-sm text-muted-foreground">
            DNS changes can take up to 48 hours to propagate, though most complete within a few
            minutes.
          </p>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Domain management will be available in a future update.
      </p>
    </div>
  );
}
