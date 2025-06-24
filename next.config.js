/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Configure images if needed
  images: {
    domains: ['vercel.com'],
  },
  
  // Environment variables that should be exposed to the browser
  env: {
    // Add any client-side environment variables here
  },
  
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Enable SWC compiler (replaces Babel)
  compiler: {
    // Enable styled-components support
    styledComponents: true,
  },
};

module.exports = nextConfig;
