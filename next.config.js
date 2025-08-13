/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://ec2-35-95-138-191.us-west-2.compute.amazonaws.com/',
    NEXT_PUBLIC_USE_API: 'true',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
