/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'https://hedera-quests.com',
    NEXT_PUBLIC_USE_API: 'true',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Add React strict mode to help identify issues
  reactStrictMode: true,
  // Suppress hydration errors in development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://hedera-quests.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
