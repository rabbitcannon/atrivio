'use client';

import { createContext, type ReactNode, useContext } from 'react';
import type { PublicStorefront } from './api';

const StorefrontContext = createContext<PublicStorefront | null>(null);

export function StorefrontProvider({
  storefront,
  children,
}: {
  storefront: PublicStorefront;
  children: ReactNode;
}) {
  return <StorefrontContext.Provider value={storefront}>{children}</StorefrontContext.Provider>;
}

export function useStorefront(): PublicStorefront {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error('useStorefront must be used within a StorefrontProvider');
  }
  return context;
}

export function useStorefrontOptional(): PublicStorefront | null {
  return useContext(StorefrontContext);
}
