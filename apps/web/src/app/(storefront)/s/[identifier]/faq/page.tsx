import { ChevronDown, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicStorefront, getPublicStorefrontFaqs } from '@/lib/api';
import type { StorefrontFaq, StorefrontNavItem } from '@/lib/api/types';

interface StorefrontFaqPageProps {
  params: Promise<{ identifier: string }>;
}

export async function generateMetadata({
  params,
}: StorefrontFaqPageProps): Promise<Metadata> {
  const { identifier } = await params;

  const storefrontResponse = await getPublicStorefront(identifier);

  if (storefrontResponse.error || !storefrontResponse.data) {
    return { title: 'FAQs' };
  }

  const storefront = storefrontResponse.data;

  return {
    title: `FAQs | ${storefront.attraction.name}`,
    description: `Frequently asked questions about ${storefront.attraction.name}`,
    openGraph: {
      title: `FAQs | ${storefront.attraction.name}`,
      description: `Frequently asked questions about ${storefront.attraction.name}`,
      siteName: storefront.attraction.name,
    },
  };
}

export default async function StorefrontFaqPage({ params }: StorefrontFaqPageProps) {
  const { identifier } = await params;

  const [storefrontResponse, faqsResponse] = await Promise.all([
    getPublicStorefront(identifier),
    getPublicStorefrontFaqs(identifier),
  ]);

  if (storefrontResponse.error || !storefrontResponse.data) {
    notFound();
  }

  const storefront = storefrontResponse.data;
  const faqs = faqsResponse.data?.faqs ?? [];

  // Only show published FAQs
  const publishedFaqs = faqs.filter((faq: StorefrontFaq) => faq.isPublished);

  // Group FAQs by category
  const faqsByCategory = publishedFaqs.reduce(
    (acc: Record<string, StorefrontFaq[]>, faq: StorefrontFaq) => {
      const category = faq.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    },
    {}
  );

  const categories = Object.keys(faqsByCategory);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href={`/s/${identifier}`} className="flex items-center gap-3 hover:opacity-80">
            {storefront.attraction.logoUrl && (
              <img
                src={storefront.attraction.logoUrl}
                alt={storefront.attraction.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            )}
            <span className="text-xl font-bold">{storefront.attraction.name}</span>
          </Link>

          {/* Navigation */}
          {storefront.navigation?.header && storefront.navigation.header.length > 0 && (
            <nav className="hidden md:flex items-center gap-6">
              {storefront.navigation.header.map((item) => (
                <NavLink key={item.id} item={item} identifier={identifier} />
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">
              Find answers to common questions about {storefront.attraction.name}
            </p>
          </div>

          {publishedFaqs.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No FAQs are currently available.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map((category) => (
                <div key={category}>
                  {categories.length > 1 && (
                    <h2 className="text-xl font-semibold mb-4 text-primary">{category}</h2>
                  )}
                  <div className="space-y-3">
                    {faqsByCategory[category].map((faq: StorefrontFaq) => (
                      <FaqAccordionItem key={faq.id} faq={faq} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 mt-auto">
        <div className="container mx-auto px-4">
          {/* Footer Navigation */}
          {storefront.navigation?.footer && storefront.navigation.footer.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-6 mb-4">
              {storefront.navigation.footer.map((item) => (
                <NavLink key={item.id} item={item} identifier={identifier} />
              ))}
            </nav>
          )}
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {storefront.attraction.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// FAQ Accordion Item Component
function FaqAccordionItem({ faq }: { faq: StorefrontFaq }) {
  return (
    <details className="group rounded-lg border bg-card">
      <summary className="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-accent/50 transition-colors">
        <span>{faq.question}</span>
        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4">
        <p className="text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
      </div>
    </details>
  );
}

// Navigation link component
function NavLink({
  item,
  identifier,
}: {
  item: StorefrontNavItem;
  identifier: string;
}) {
  const openInNewTab = item.openInNewTab || item.openNewTab;

  // Determine the URL based on link type
  let href = '#';
  if (item.linkType === 'home') {
    href = `/s/${identifier}`;
  } else if (item.linkType === 'tickets') {
    href = `/s/${identifier}`;
  } else if (item.linkType === 'faq') {
    href = `/s/${identifier}/faq`;
  } else if (item.linkType === 'external') {
    href = item.externalUrl || item.url || '#';
  } else if (item.linkType === 'page' && item.url) {
    href = `/s/${identifier}${item.url}`;
  }

  const linkProps = openInNewTab
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  if (item.linkType === 'external' || openInNewTab) {
    return (
      <a
        href={href}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        {...linkProps}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {item.label}
    </Link>
  );
}
