/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Note: @haunt/shared is pre-built, no need to transpile

  // Experimental features
  experimental: {
    // typedRoutes disabled - causes issues with dynamic routes
    // typedRoutes: true,
  },

  // Image optimization domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
