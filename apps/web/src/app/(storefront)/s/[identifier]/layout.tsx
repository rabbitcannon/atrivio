import { getPublicStorefront } from '@/lib/api';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface StorefrontLayoutProps {
  children: React.ReactNode;
  params: Promise<{ identifier: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>;
}): Promise<Metadata> {
  const { identifier } = await params;

  const response = await getPublicStorefront(identifier);
  if (response.error || !response.data) {
    return {
      title: 'Storefront',
    };
  }

  const storefront = response.data;
  return {
    title: storefront.attraction.name,
    description: storefront.storefront.description || undefined,
  };
}

export default async function StorefrontLayout({
  children,
  params,
}: StorefrontLayoutProps) {
  const { identifier } = await params;

  // Verify storefront exists
  const response = await getPublicStorefront(identifier);
  if (response.error || !response.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
