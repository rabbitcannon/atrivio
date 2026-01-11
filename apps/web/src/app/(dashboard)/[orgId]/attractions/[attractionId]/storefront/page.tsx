import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  HelpCircle,
  Link2,
  Megaphone,
  Navigation,
  Settings,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import {
  getAttraction,
  getStorefrontAnnouncements,
  getStorefrontDomains,
  getStorefrontFaqs,
  getStorefrontPages,
  getStorefrontSettings,
  resolveOrgId,
} from '@/lib/api';
import type {
  StorefrontAnnouncement,
  StorefrontDomain,
  StorefrontFaq,
  StorefrontPage,
  StorefrontSettings,
} from '@/lib/api/types';
import { siteConfig } from '@/lib/config/site';

export const metadata: Metadata = {
  title: 'Storefront',
};

interface StorefrontPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

const NAV_ITEMS = [
  {
    title: 'Settings',
    description: 'Configure theme, SEO, analytics, and contact info',
    href: 'storefront/settings',
    icon: Settings,
  },
  {
    title: 'Pages',
    description: 'Create and manage content pages',
    href: 'storefront/pages',
    icon: FileText,
  },
  {
    title: 'Domains',
    description: 'Manage custom domains and subdomains',
    href: 'storefront/domains',
    icon: Link2,
  },
  {
    title: 'FAQs',
    description: 'Manage frequently asked questions',
    href: 'storefront/faqs',
    icon: HelpCircle,
  },
  {
    title: 'Announcements',
    description: 'Create announcements and promotions',
    href: 'storefront/announcements',
    icon: Megaphone,
  },
  {
    title: 'Navigation',
    description: 'Configure header and footer navigation',
    href: 'storefront/navigation',
    icon: Navigation,
  },
];

export default async function StorefrontDashboardPage({ params }: StorefrontPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  // Fetch attraction and storefront data
  const attractionResult = await getAttraction(orgId, attractionId);
  const attraction = attractionResult.data;

  if (!attraction) {
    notFound();
  }

  let settings: StorefrontSettings | null = null;
  let pages: StorefrontPage[] = [];
  let domains: StorefrontDomain[] = [];
  let faqs: StorefrontFaq[] = [];
  let announcements: StorefrontAnnouncement[] = [];

  try {
    const [settingsResult, pagesResult, domainsResult, faqsResult, announcementsResult] =
      await Promise.all([
        getStorefrontSettings(orgId, attractionId),
        getStorefrontPages(orgId, attractionId),
        getStorefrontDomains(orgId, attractionId),
        getStorefrontFaqs(orgId, attractionId),
        getStorefrontAnnouncements(orgId, attractionId),
      ]);

    settings = settingsResult.data?.settings ?? null;
    pages = pagesResult.data?.pages ?? [];
    domains = domainsResult.data?.domains ?? [];
    faqs = faqsResult.data?.faqs ?? [];
    announcements = announcementsResult.data?.announcements ?? [];
  } catch {
    // Feature might not be enabled or no settings yet
  }

  const breadcrumbs = [
    { label: 'Attractions', href: `/${orgIdentifier}/attractions` },
    { label: attraction.name, href: basePath },
    { label: 'Storefront' },
  ];

  const publishedPages = pages.filter((p) => p.status === 'published');
  const activeDomains = domains.filter((d) => d.status === 'active');
  const activeFaqs = faqs.filter((f) => f.isPublished);
  const activeAnnouncements = announcements.filter((a) => a.isActive);

  const getStatusBadge = () => {
    if (!settings) return <Badge variant="secondary">Not Configured</Badge>;
    if (settings.isPublished) return <Badge className="bg-green-500">Published</Badge>;
    return <Badge variant="outline">Draft</Badge>;
  };

  const getPreviewUrl = () => {
    const primaryDomain = domains.find((d) => d.isPrimary && d.status === 'active');
    if (primaryDomain) return siteConfig.getDomainUrl(primaryDomain.domain);
    const subdomain = domains.find((d) => d.domainType === 'subdomain' && d.status === 'active');
    if (subdomain) return siteConfig.getDomainUrl(subdomain.domain);
    return null;
  };

  // Get environment-aware domain display
  const getDomainDisplay = (domain: string, domainType: string) => {
    if (domainType === 'subdomain') {
      const slug = siteConfig.getSlugFromSubdomain(domain);
      return slug ? `${slug}.${siteConfig.platformDomain}` : domain;
    }
    return domain;
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Breadcrumb items={breadcrumbs} />
        <AnimatedPageHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Storefront</h1>
            <p className="text-muted-foreground">
              Manage your attraction&apos;s public-facing website and content.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {previewUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </AnimatedPageHeader>
      </div>

      {/* Quick Stats */}
      <StaggerContainer className="grid gap-4 md:grid-cols-4" staggerDelay={0.05} delayChildren={0.1}>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pages</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedPages.length}</div>
              <p className="text-xs text-muted-foreground">
                {pages.length} total ({pages.length - publishedPages.length} drafts)
              </p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Domains</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDomains.length}</div>
              <p className="text-xs text-muted-foreground">Active domains</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">FAQs</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeFaqs.length}</div>
              <p className="text-xs text-muted-foreground">Active questions</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAnnouncements.length}</div>
              <p className="text-xs text-muted-foreground">Active announcements</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Status Banner */}
      {settings && (
        <Card
          className={
            settings.isPublished
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
              : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {settings.isPublished ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Storefront is Published</h3>
                    <p className="text-sm text-muted-foreground">
                      Your storefront is live and accessible to the public.
                      {settings.publishedAt &&
                        ` Published ${new Date(settings.publishedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  {previewUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                        Visit Site
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Clock className="h-8 w-8 text-amber-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Storefront is in Draft Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Your storefront is not yet public. Configure your settings and pages, then
                      publish when ready.
                    </p>
                  </div>
                  <Link href={`${basePath}/storefront/settings`}>
                    <Button size="sm">Configure & Publish</Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Configured */}
      {!settings && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-semibold">Get Started with Your Storefront</h3>
                <p className="text-sm text-muted-foreground">
                  Create a public website for your attraction with custom pages, FAQs, and more.
                </p>
              </div>
              <Link href={`${basePath}/storefront/settings`}>
                <Button>Set Up Storefront</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Cards */}
      <StaggerContainer className="grid gap-4 md:grid-cols-3" staggerDelay={0.06} delayChildren={0.15}>
        {NAV_ITEMS.map((item) => (
          <StaggerItem key={item.href}>
            <Link href={`${basePath}/${item.href}`} className="block h-full">
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Domain Status */}
      {domains.length > 0 && (
        <FadeIn delay={0.2}>
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Domain Status
            </CardTitle>
            <CardDescription>Your storefront domain configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {domains.slice(0, 3).map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {domain.status === 'active' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : domain.status === 'verifying' ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {getDomainDisplay(domain.domain, domain.domainType)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {domain.domainType} {domain.isPrimary && '• Primary'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={domain.status === 'active' ? 'default' : 'secondary'}>
                    {domain.status}
                  </Badge>
                </div>
              ))}
              {domains.length > 3 && (
                <Link
                  href={`${basePath}/storefront/domains`}
                  className="block text-center text-sm text-primary hover:underline py-2"
                >
                  View all {domains.length} domains
                </Link>
              )}
            </div>
          </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
