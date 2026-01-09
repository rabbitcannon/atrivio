import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Globe,
  Link2,
  Shield,
  Star,
  XCircle,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  addStorefrontDomain,
  deleteStorefrontDomain,
  getStorefrontDomainLimits,
  getStorefrontDomains,
  getStorefrontSettings,
  resolveOrgId,
  setStorefrontPrimaryDomain,
  verifyStorefrontDomain,
} from '@/lib/api';
import type { DomainStatus, StorefrontDomain, StorefrontSettings } from '@/lib/api/types';
import { siteConfig } from '@/lib/config';
import { AddDomainDialog } from './_components/add-domain-dialog';
import { DomainActions } from './_components/domain-actions';
import { VerificationInstructions } from './_components/verification-instructions';

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

  const resolvedOrgId = await resolveOrgId(orgIdentifier);
  if (!resolvedOrgId) {
    notFound();
  }
  const orgId: string = resolvedOrgId;

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  let domains: StorefrontDomain[] = [];
  let _settings: StorefrontSettings | null = null;
  let domainLimits = { customDomainCount: 0, customDomainLimit: 0, remaining: 0 };

  try {
    const [domainsResult, settingsResult, limitsResult] = await Promise.all([
      getStorefrontDomains(orgId, attractionId),
      getStorefrontSettings(orgId, attractionId),
      getStorefrontDomainLimits(orgId, attractionId),
    ]);
    domains = domainsResult.data?.domains ?? [];
    _settings = settingsResult.data?.settings ?? null;
    domainLimits = limitsResult.data?.limits ?? domainLimits;
  } catch {
    // Feature might not be enabled
  }

  const canAddDomains = domainLimits.customDomainLimit > 0;
  const isAtLimit = domainLimits.remaining <= 0;

  // Find the default subdomain
  const defaultSubdomain = domains.find((d) => d.domainType === 'subdomain');
  const customDomains = domains.filter((d) => d.domainType === 'custom');

  // Show instructions if there are pending/failed domains or no custom domains yet
  const hasPendingDomains = customDomains.some((d) => d.status === 'pending' || d.status === 'failed');
  const showInstructions = hasPendingDomains || customDomains.length === 0;

  // Get environment-aware subdomain display
  const getSubdomainDisplay = (domain: string) => {
    const slug = siteConfig.getSlugFromSubdomain(domain);
    return slug ? `${slug}.${siteConfig.platformDomain}` : domain;
  };

  // Capture values for server actions
  const capturedOrgId = orgId;
  const capturedAttractionId = attractionId;

  // Server action: Add domain
  async function handleAddDomain(domain: string): Promise<{ success: boolean; error?: string }> {
    'use server';
    try {
      const result = await addStorefrontDomain(capturedOrgId, capturedAttractionId, domain);
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: error.message || 'Failed to add domain' };
    }
  }

  // Server action: Verify domain
  async function handleVerifyDomain(domainId: string): Promise<{ success: boolean; error?: string }> {
    'use server';
    try {
      const result = await verifyStorefrontDomain(capturedOrgId, capturedAttractionId, domainId);
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: error.message || 'Verification failed' };
    }
  }

  // Server action: Set primary domain
  async function handleSetPrimaryDomain(domainId: string): Promise<{ success: boolean; error?: string }> {
    'use server';
    try {
      const result = await setStorefrontPrimaryDomain(capturedOrgId, capturedAttractionId, domainId);
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: error.message || 'Failed to set as primary' };
    }
  }

  // Server action: Delete domain
  async function handleDeleteDomain(domainId: string): Promise<{ success: boolean; error?: string }> {
    'use server';
    try {
      const result = await deleteStorefrontDomain(capturedOrgId, capturedAttractionId, domainId);
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: error.message || 'Failed to delete domain' };
    }
  }

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
        <div className="flex items-center gap-4">
          {canAddDomains && (
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {domainLimits.customDomainCount} of {domainLimits.customDomainLimit}
              </span>
              <span className="text-sm text-muted-foreground">domains</span>
            </div>
          )}
          {canAddDomains && !isAtLimit && <AddDomainDialog onAddDomain={handleAddDomain} />}
          {canAddDomains && isAtLimit && (
            <Badge variant="secondary">Domain limit reached</Badge>
          )}
        </div>
      </div>

      {/* Default Subdomain */}
      {defaultSubdomain && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Default Subdomain
            </CardTitle>
            <CardDescription>Your free subdomain on {siteConfig.platformDomain}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">{getSubdomainDisplay(defaultSubdomain.domain)}</p>
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
          {!canAddDomains ? (
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Custom domains available on Pro plan</h3>
              <p className="text-muted-foreground mb-4">
                Upgrade to Pro to connect your own domain to your storefront.
                Your free subdomain will always be available.
              </p>
              <Badge variant="secondary">Pro Feature</Badge>
            </div>
          ) : customDomains.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No custom domains</h3>
              <p className="text-muted-foreground mb-4">
                Add a custom domain to use your own URL for your storefront.
              </p>
              <AddDomainDialog onAddDomain={handleAddDomain} />
            </div>
          ) : (
            <div className="space-y-3">
              {customDomains.map((domain) => {
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
                        {/* Show verification instructions for pending domains */}
                        {(domain.status === 'pending' || domain.status === 'failed') && domain.verification && (
                          <div className="mt-2">
                            <VerificationInstructions verification={domain.verification} />
                          </div>
                        )}
                      </div>
                    </div>
                    <DomainActions
                      domainId={domain.id}
                      domain={domain.domain}
                      domainType={domain.domainType}
                      status={domain.status}
                      isPrimary={domain.isPrimary}
                      onVerify={handleVerifyDomain}
                      onSetPrimary={handleSetPrimaryDomain}
                      onDelete={handleDeleteDomain}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DNS Instructions - only show when relevant and user can add domains */}
      {canAddDomains && showInstructions && (
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
                  <p>Value: {siteConfig.cnameTarget}</p>
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
      )}
    </div>
  );
}
