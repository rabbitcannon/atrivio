import {
  ArrowLeft,
  Edit,
  GripVertical,
  HelpCircle,
  MoreHorizontal,
  Plus,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStorefrontFaqs, resolveOrgId } from '@/lib/api';
import type { StorefrontFaq } from '@/lib/api/types';

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

  try {
    const faqsResult = await getStorefrontFaqs(orgId, attractionId);
    faqs = faqsResult.data?.faqs ?? [];
  } catch {
    // Feature might not be enabled
  }

  // Get unique categories
  const categories = [...new Set(faqs.map((f) => f.category).filter(Boolean))];
  const activeFaqs = faqs.filter((f) => f.isActive);
  const featuredFaqs = faqs.filter((f) => f.isFeatured);

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
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions for your storefront.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faqs.length}</div>
            <p className="text-xs text-muted-foreground">{activeFaqs.length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredFaqs.length}</div>
            <p className="text-xs text-muted-foreground">Highlighted on homepage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
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
          <Badge variant="secondary" className="cursor-pointer">
            All
          </Badge>
          {categories.map((category) => (
            <Badge key={category} variant="outline" className="cursor-pointer">
              {category}
            </Badge>
          ))}
        </div>
      )}

      {/* FAQs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            All FAQs
          </CardTitle>
          <CardDescription>Drag to reorder. Featured FAQs appear on the homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No FAQs yet</h3>
              <p className="text-muted-foreground mb-4">
                Add frequently asked questions to help your visitors.
              </p>
              <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Add First FAQ
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    !faq.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <div className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{faq.question}</h4>
                      {faq.isFeatured && (
                        <Badge variant="outline" className="text-amber-600">
                          <Star className="mr-1 h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      {!faq.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                    {faq.category && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          {faq.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" disabled>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        FAQ management will be available in a future update.
      </p>
    </div>
  );
}
