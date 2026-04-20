/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  // Disable x-powered-by header to reduce information leakage
  poweredByHeader: false,
};

module.exports = nextConfig;
