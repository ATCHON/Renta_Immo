/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  webpack: (config) => {
    // Prevent canvas errors with react-pdf
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
