import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicStorefront, getPublicStorefrontPage } from '@/lib/api';
import type { StorefrontNavItem } from '@/lib/api/types';
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

          {page.content ? (
            <PlateContentRenderer content={page.content} />
          ) : (
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
