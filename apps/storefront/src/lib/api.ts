/**
 * Storefront API Client
 * Fetches public storefront data from the API
 */

const API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api/v1';

export interface StorefrontSettings {
  id: string;
  tagline: string | null;
  description: string | null;
  hero: {
    imageUrl: string | null;
    videoUrl: string | null;
    title: string | null;
    subtitle: string | null;
  };
  theme: {
    preset: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string | null;
    backgroundColor: string | null;
    textColor: string | null;
    fontHeading: string;
    fontBody: string;
    customCss: string | null;
  };
  social: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    tiktok: string | null;
    youtube: string | null;
  };
  seo: {
    title: string | null;
    description: string | null;
    keywords: string[];
    ogImageUrl: string | null;
  };
  analytics: {
    googleAnalyticsId: string | null;
    facebookPixelId: string | null;
    customHeadScripts: string | null;
  };
  features: {
    showAttractions: boolean;
    showCalendar: boolean;
    showFaq: boolean;
    showReviews: boolean;
  };
  isPublished: boolean;
  publishedAt: string | null;
}

export interface StorefrontOrg {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
}

export interface StorefrontAttraction {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface StorefrontPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  contentFormat: string;
  pageType: string;
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
}

export interface StorefrontFaq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isFeatured: boolean;
}

export interface StorefrontTicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  category: string | null;
  includes: string[] | null;
  maxPerOrder: number;
  minPerOrder: number;
  isAvailable: boolean;
}

export interface StorefrontAnnouncement {
  id: string;
  title: string;
  content: string;
  type: string;
  position?: string;
  backgroundColor: string | null;
  textColor: string | null;
  linkUrl: string | null;
  linkText: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  isDismissible?: boolean;
}

export interface StorefrontNavItem {
  id?: string;
  label: string;
  type: string;
  url: string;
  openInNewTab?: boolean;
}

export interface StorefrontNavigation {
  header: StorefrontNavItem[];
  footer: StorefrontNavItem[];
}

export interface StorefrontDomain {
  current: string;
  canonical: string;
}

// What the API actually returns
interface ApiStorefrontResponse {
  org: StorefrontOrg;
  attraction: StorefrontAttraction;
  storefront: StorefrontSettings;
  navigation: StorefrontNavigation;
  announcements: StorefrontAnnouncement[];
  domain: StorefrontDomain;
}

// Normalized interface for the app
export interface PublicStorefront {
  org: StorefrontOrg;
  attraction: StorefrontAttraction;
  settings: StorefrontSettings;
  announcements: StorefrontAnnouncement[];
  navigation: StorefrontNavigation;
  domain: StorefrontDomain;
}

/**
 * Fetch public storefront data by domain or slug
 */
export async function getPublicStorefront(identifier: string): Promise<PublicStorefront | null> {
  try {
    const cacheTime = process.env.NODE_ENV === 'development' ? 0 : 60;
    const res = await fetch(`${API_URL}/storefronts/${encodeURIComponent(identifier)}`, {
      next: { revalidate: cacheTime }, // No cache in dev, 60s in prod
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch storefront: ${res.status}`);
    }

    const data: ApiStorefrontResponse = await res.json();

    // Transform API response to app interface
    return {
      org: data.org,
      attraction: data.attraction,
      settings: data.storefront,
      announcements: data.announcements,
      navigation: data.navigation,
      domain: data.domain,
    };
  } catch (_error) {
    return null;
  }
}

/**
 * Fetch a specific public page by slug
 */
export async function getPublicPage(
  storefrontIdentifier: string,
  pageSlug: string
): Promise<StorefrontPage | null> {
  try {
    const res = await fetch(
      `${API_URL}/storefronts/${encodeURIComponent(storefrontIdentifier)}/pages/${encodeURIComponent(pageSlug)}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch page: ${res.status}`);
    }

    const data = await res.json();
    return data.page;
  } catch (_error) {
    return null;
  }
}

/**
 * Fetch public FAQs with optional category filter
 */
export async function getPublicFaqs(
  storefrontIdentifier: string,
  category?: string
): Promise<{ faqs: StorefrontFaq[]; categories: string[] }> {
  try {
    const url = new URL(`${API_URL}/storefronts/${encodeURIComponent(storefrontIdentifier)}/faqs`);
    if (category) url.searchParams.set('category', category);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });

    if (!res.ok) {
      throw new Error(`Failed to fetch FAQs: ${res.status}`);
    }

    return res.json();
  } catch (_error) {
    return { faqs: [], categories: [] };
  }
}

/**
 * Fetch public ticket types for storefront
 */
export async function getPublicTicketTypes(
  storefrontIdentifier: string
): Promise<{ ticketTypes: StorefrontTicketType[] }> {
  try {
    const res = await fetch(
      `${API_URL}/storefronts/${encodeURIComponent(storefrontIdentifier)}/tickets`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch ticket types: ${res.status}`);
    }

    return res.json();
  } catch (_error) {
    return { ticketTypes: [] };
  }
}
