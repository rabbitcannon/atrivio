import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable MDX pages
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  // Note: @haunt/shared is pre-built, no need to transpile

  // Transpile motion and framer-motion for proper ESM support
  transpilePackages: ['motion', 'framer-motion'],

  // Experimental features
  experimental: {
    // typedRoutes disabled - causes issues with dynamic routes
    // typedRoutes: true,

    // Optimize package imports for better tree-shaking
    optimizePackageImports: ['lucide-react', 'date-fns', 'lodash', '@radix-ui/react-icons'],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Use modern image formats
    formats: ['image/avif', 'image/webp'],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Compression
  compress: true,

  // Production source maps for debugging (can be disabled for smaller bundles)
  productionBrowserSourceMaps: false,

  // Headers for caching and security
  async headers() {
    // No custom cache headers in development
    if (process.env.NODE_ENV === 'development') {
      return [];
    }

    return [
      {
        // Content-hashed assets: cache forever (safe - filename changes on content change)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Non-hashed static assets: cache 1 day, revalidate in background for 1 week
        source: '/:path*.(ico|png|jpg|jpeg|gif|svg|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Enable tree-shaking for lodash
      config.resolve.alias = {
        ...config.resolve.alias,
        lodash: 'lodash-es',
      };
    }

    // Fix motion/framer-motion module resolution
    // Ensure consistent module resolution to avoid 'call' errors
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force ESM imports for motion packages
      'motion/react': require.resolve('motion/react'),
      'framer-motion': require.resolve('framer-motion'),
    };

    return config;
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
