import { Star, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAttraction, getStorefrontFaqs, resolveOrgId } from '@/lib/api';
import type { StorefrontFaq } from '@/lib/api/types';
import { FaqHeaderActions } from './_components/faq-header-actions';
import { FaqList } from './_components/faq-list';

export const metadata: Metadata = {
  title: 'Storefront FAQs',
};

interface FaqsPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

export default async function StorefrontFaqsPage({ params }: FaqsPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  let faqs: StorefrontFaq[] = [];
  let attractionName = '';

  try {
    const [faqsResult, attractionResult] = await Promise.all([
      getStorefrontFaqs(orgId, attractionId),
      getAttraction(orgId, attractionId),
    ]);
    faqs = faqsResult.data?.faqs ?? [];
    attractionName = attractionResult.data?.name ?? '';
  } catch {
    // Feature might not be enabled
  }

  // Get unique categories
  const categories = [...new Set(faqs.map((f) => f.category).filter(Boolean))];
  const publishedFaqs = faqs.filter((f) => f.isPublished);
  const featuredFaqs = faqs.filter((f) => f.isFeatured);

  const breadcrumbs = [
    { label: 'Attractions', href: `/${orgIdentifier}/attractions` },
    { label: attractionName || 'Attraction', href: basePath },
    { label: 'Storefront', href: `${basePath}/storefront` },
    { label: 'FAQs' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Breadcrumb items={breadcrumbs} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
            <p className="text-muted-foreground">
              Manage frequently asked questions for your storefront.
            </p>
          </div>
          <FaqHeaderActions orgId={orgId} attractionId={attractionId} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faqs.length}</div>
            <p className="text-xs text-muted-foreground">{publishedFaqs.length} published</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Featured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredFaqs.length}</div>
            <p className="text-xs text-muted-foreground">Highlighted on FAQ page</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Unique categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Categories:</span>
          <Badge variant="secondary">All</Badge>
          {categories.map((category) => (
            <Badge key={category} variant="outline">
              {category}
            </Badge>
          ))}
        </div>
      )}

      {/* FAQs List */}
      <FaqList orgId={orgId} attractionId={attractionId} faqs={faqs} />
    </div>
  );
}
