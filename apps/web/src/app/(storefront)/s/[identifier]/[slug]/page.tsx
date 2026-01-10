import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { getPublicStorefront, getPublicStorefrontPage, getPublicStorefrontFaqs } from '@/lib/api';
import type { StorefrontNavItem, StorefrontFaq } from '@/lib/api/types';
import { PlateContentRenderer } from './_components/plate-content-renderer';

interface StorefrontPageProps {
  params: Promise<{ identifier: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: StorefrontPageProps): Promise<Metadata> {
  const { identifier, slug } = await params;

  const [storefrontResponse, pageResponse] = await Promise.all([
    getPublicStorefront(identifier),
    getPublicStorefrontPage(identifier, slug),
  ]);

  if (storefrontResponse.error || !storefrontResponse.data) {
    return { title: 'Page Not Found' };
  }

  if (pageResponse.error || !pageResponse.data?.page) {
    return { title: 'Page Not Found' };
  }

  const storefront = storefrontResponse.data;
  const page = pageResponse.data.page;

  // Use page SEO settings, fallback to page title/storefront description
  const title = page.seo?.title || page.title;
  const description = page.seo?.description || storefront.storefront.description || undefined;

  return {
    title: `${title} | ${storefront.attraction.name}`,
    description,
    openGraph: {
      title: `${title} | ${storefront.attraction.name}`,
      description,
      siteName: storefront.attraction.name,
      images: page.seo?.ogImageUrl ? [page.seo.ogImageUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${storefront.attraction.name}`,
      description,
    },
  };
}

export default async function StorefrontCustomPage({ params }: StorefrontPageProps) {
  const { identifier, slug } = await params;

  const [storefrontResponse, pageResponse] = await Promise.all([
    getPublicStorefront(identifier),
    getPublicStorefrontPage(identifier, slug),
  ]);

  if (storefrontResponse.error || !storefrontResponse.data) {
    notFound();
  }

  if (pageResponse.error || !pageResponse.data?.page) {
    notFound();
  }

  const storefront = storefrontResponse.data;
  const page = pageResponse.data.page;

  // Only show published pages
  if (page.status !== 'published') {
    notFound();
  }

  // Fetch FAQs if this is an FAQ-type page
  let faqs: StorefrontFaq[] = [];
  if (page.pageType === 'faq') {
    const faqsResponse = await getPublicStorefrontFaqs(identifier);
    if (faqsResponse.data?.faqs) {
      faqs = faqsResponse.data.faqs;
    }
  }

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
        <article className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">{page.title}</h1>

          {page.content && (
            <div className="mb-8">
              <PlateContentRenderer content={page.content} />
            </div>
          )}

          {/* Render FAQs for FAQ-type pages */}
          {page.pageType === 'faq' && faqs.length > 0 && (
            <FaqAccordion faqs={faqs} />
          )}

          {/* Empty state for FAQ pages with no FAQs */}
          {page.pageType === 'faq' && faqs.length === 0 && !page.content && (
            <p className="text-muted-foreground">No FAQs have been added yet.</p>
          )}

          {/* Empty state for non-FAQ pages */}
          {page.pageType !== 'faq' && !page.content && (
            <p className="text-muted-foreground">This page has no content yet.</p>
          )}
        </article>
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
    // For page links, url should be the slug like "/about"
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

// FAQ Accordion Component
function FaqAccordion({ faqs }: { faqs: StorefrontFaq[] }) {
  // Group FAQs by category
  const groupedFaqs = faqs.reduce(
    (acc, faq) => {
      const category = faq.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    },
    {} as Record<string, StorefrontFaq[]>
  );

  const categories = Object.keys(groupedFaqs);

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category}>
          {categories.length > 1 && (
            <h2 className="text-2xl font-semibold mb-4">{category}</h2>
          )}
          <div className="space-y-3">
            {groupedFaqs[category].map((faq) => (
              <FaqItem key={faq.id} faq={faq} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Individual FAQ Item with accordion behavior
function FaqItem({ faq }: { faq: StorefrontFaq }) {
  return (
    <details className="group border rounded-lg">
      <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 font-medium list-none">
        <span>{faq.question}</span>
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 text-muted-foreground">
        <p className="whitespace-pre-wrap">{faq.answer}</p>
      </div>
    </details>
  );
}
