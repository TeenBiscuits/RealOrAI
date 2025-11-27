import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Allow local images
    unoptimized: false,
  },
  // Suppress the middleware deprecation warning (next-intl uses it)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experimental: {} as any,
};

export default withNextIntl(nextConfig);
