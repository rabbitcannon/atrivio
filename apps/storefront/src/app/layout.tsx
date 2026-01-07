import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AnnouncementBanner } from '@/components/announcement-banner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { getPublicStorefront } from '@/lib/api';
import { StorefrontProvider } from '@/lib/storefront-context';
import '@/styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');

  if (!identifier) {
    return { title: 'Storefront' };
  }

  const storefront = await getPublicStorefront(identifier);
  if (!storefront) {
    return { title: 'Storefront Not Found' };
  }

  const { settings, attraction } = storefront;
  const description = settings.seo.description || settings.description || attraction.description;

  return {
    title: {
      default: settings.seo.title || attraction.name,
      template: `%s | ${attraction.name}`,
    },
    description: description || null,
    keywords: settings.seo.keywords,
    openGraph: {
      title: settings.seo.title || attraction.name,
      ...(description && { description }),
      ...(settings.seo.ogImageUrl && { images: [settings.seo.ogImageUrl] }),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.seo.title || attraction.name,
      ...(description && { description }),
      ...(settings.seo.ogImageUrl && { images: [settings.seo.ogImageUrl] }),
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const identifier = headersList.get('x-storefront-identifier');

  // No storefront identifier - show setup instructions in dev
  if (!identifier) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
            <div className="max-w-md text-center">
              <h1 className="text-2xl font-bold mb-4">Storefront Not Configured</h1>
              <p className="text-gray-400 mb-4">
                In development, add{' '}
                <code className="bg-gray-800 px-2 py-1 rounded">?storefront=domain</code> to the
                URL.
              </p>
              <p className="text-gray-400 text-sm">
                Example:{' '}
                <code className="bg-gray-800 px-2 py-1 rounded text-xs">
                  localhost:3002?storefront=haunted-mansion
                </code>
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  const storefront = await getPublicStorefront(identifier);

  // Storefront not found or not published - show error page
  if (!storefront || !storefront.settings.isPublished) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
            <div className="max-w-md text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <h2 className="text-xl font-semibold mb-4">Storefront Not Found</h2>
              <p className="text-gray-400 mb-4">
                The storefront you&apos;re looking for doesn&apos;t exist or isn&apos;t published
                yet.
              </p>
              <p className="text-gray-500 text-sm">
                If you believe this is an error, please contact the attraction owner.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  const { settings } = storefront;
  const themeClass = settings.theme.preset === 'light' ? 'theme-light' : '';

  // Convert hex to HSL for CSS variables
  function hexToHSL(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || !result[1] || !result[2] || !result[3]) return '0 0% 0%';

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }

  // Determine if background is light or dark for contrast
  function isLightColor(hex: string): boolean {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || !result[1] || !result[2] || !result[3]) return false;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }

  const bgColor = settings.theme.backgroundColor || '#0a0a0a';
  const textColor = settings.theme.textColor || '#f5f5f5';
  const primaryColor = settings.theme.primaryColor || '#dc2626';
  const secondaryColor = settings.theme.secondaryColor || '#1f2937';
  const accentColor = settings.theme.accentColor || '#f59e0b';
  const isLight = isLightColor(bgColor);

  // Build CSS variables from storefront settings
  const themeStyles = `
    :root {
      /* Storefront hex colors */
      --storefront-primary: ${primaryColor};
      --storefront-secondary: ${secondaryColor};
      --storefront-accent: ${accentColor};
      --storefront-background: ${bgColor};
      --storefront-text: ${textColor};

      /* Base theme HSL - derived from storefront colors */
      --background: ${hexToHSL(bgColor)};
      --foreground: ${hexToHSL(textColor)};
      --card: ${hexToHSL(isLight ? '#ffffff' : '#111111')};
      --card-foreground: ${hexToHSL(textColor)};
      --primary: ${hexToHSL(primaryColor)};
      --primary-foreground: ${isLightColor(primaryColor) ? '0 0% 0%' : '0 0% 100%'};
      --secondary: ${hexToHSL(secondaryColor)};
      --secondary-foreground: ${hexToHSL(isLight ? '#111111' : '#f5f5f5')};
      --muted: ${hexToHSL(isLight ? '#f5f5f5' : '#1f1f1f')};
      --muted-foreground: ${hexToHSL(isLight ? '#737373' : '#a3a3a3')};
      --accent: ${hexToHSL(accentColor)};
      --accent-foreground: ${isLightColor(accentColor) ? '0 0% 0%' : '0 0% 100%'};
      --border: ${hexToHSL(isLight ? '#e5e5e5' : '#262626')};
      --input: ${hexToHSL(isLight ? '#e5e5e5' : '#262626')};
      --ring: ${hexToHSL(primaryColor)};

      /* Fonts */
      --font-heading: '${settings.theme.fontHeading || 'Inter'}', system-ui, sans-serif;
      --font-body: '${settings.theme.fontBody || 'Inter'}', system-ui, sans-serif;
    }
    ${settings.theme.customCss || ''}
  `;

  // API already filters to active announcements
  // Filter for top position (default to showing all if position not set)
  const topAnnouncements = storefront.announcements.filter(
    (a) => !a.position || a.position === 'top'
  );

  return (
    <html lang="en" className={themeClass}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        {settings.analytics?.googleAnalyticsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.analytics.googleAnalyticsId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.analytics.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <StorefrontProvider storefront={storefront}>
          {topAnnouncements.map((announcement) => (
            <AnnouncementBanner key={announcement.id} announcement={announcement} />
          ))}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </StorefrontProvider>
      </body>
    </html>
  );
}
