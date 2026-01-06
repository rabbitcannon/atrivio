import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPublicStorefront, getPublicPage } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');

  if (!identifier) return {};

  const page = await getPublicPage(identifier, slug);
  if (!page) return {};

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');

  if (!identifier) return null;

  const page = await getPublicPage(identifier, slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <article className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-4">{page.title}</h1>
          </header>

          <div
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: page.contentFormat === 'html' ? page.content : formatContent(page.content),
            }}
          />
        </article>
      </div>
    </div>
  );
}

function formatContent(content: string): string {
  // Convert markdown-style content to basic HTML
  // For production, use a proper markdown parser
  return content
    .split('\n\n')
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join('');
}
