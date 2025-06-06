/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // App Router is now stable in Next.js 14
  // experimental: {
  //   appDir: true,
  // },
  // Enable standalone output for Docker optimization
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // Enable iframe embedding
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Remove X-Frame-Options to let CSP handle frame control
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },
  // Optimize for embedding
  trailingSlash: false,
  poweredByHeader: false,
};

module.exports = nextConfig; 