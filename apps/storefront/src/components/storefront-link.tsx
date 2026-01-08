'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';

type StorefrontLinkProps = ComponentProps<typeof Link>;

/**
 * Link component that preserves the `?storefront=` query parameter in development mode.
 * In production, subdomains/custom domains handle storefront identification via middleware.
 * In development, we use query params since we can't easily simulate subdomains.
 */
export function StorefrontLink({ href, children, ...props }: StorefrontLinkProps) {
  const searchParams = useSearchParams();
  const storefrontParam = searchParams.get('storefront');

  // Build the href with storefront param preserved for internal links in dev mode
  const resolvedHref = (() => {
    // Only modify internal links (starting with /)
    if (typeof href !== 'string' || !href.startsWith('/')) {
      return href;
    }

    // Only add query param if we're in development and have a storefront param
    if (!storefrontParam) {
      return href;
    }

    // Parse the href to handle existing query params
    const [pathname, existingQuery] = href.split('?');
    const params = new URLSearchParams(existingQuery || '');

    // Add storefront param if not already present
    if (!params.has('storefront')) {
      params.set('storefront', storefrontParam);
    }

    return `${pathname}?${params.toString()}`;
  })();

  return (
    <Link href={resolvedHref} {...props}>
      {children}
    </Link>
  );
}
