import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@smart-edu/api-client', '@smart-edu/types', '@smart-edu/ui-tokens'],
};

export default nextConfig;
