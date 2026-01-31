/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ---------------------------------------------------------------------------
  // Image optimization
  // remotePatterns replaces the deprecated "domains" key.
  // asilvainnovations.com is included so Next can proxy the official logo.
  // ---------------------------------------------------------------------------
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'asilvainnovations.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ---------------------------------------------------------------------------
  // Security & performance headers
  // ---------------------------------------------------------------------------
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control',  value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
          { key: 'Referrer-Policy',          value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  // ---------------------------------------------------------------------------
  // Redirects
  // ---------------------------------------------------------------------------
  async redirects() {
    return [
      { source: '/blog', destination: '/', permanent: true },
    ];
  },

  // ---------------------------------------------------------------------------
  // API proxy rewrites — only wired when the env var is set so a fresh deploy
  // without a backend doesn't try to forward to a non-existent origin.
  // ---------------------------------------------------------------------------
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return [];

    return [
      { source: '/api/:path*', destination: `${apiUrl}/:path*` },
    ];
  },

  // ---------------------------------------------------------------------------
  // Webpack tweaks
  // ---------------------------------------------------------------------------
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:  false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // ---------------------------------------------------------------------------
  // Environment variables available at build time
  // ---------------------------------------------------------------------------
  env: {
    SITE_NAME: 'ASilva Innovations Blog',
    SITE_URL:  process.env.NEXT_PUBLIC_SITE_URL || 'https://asilva-innovations.com',
  },

  // ---------------------------------------------------------------------------
  // Experimental — only tree-shake lucide icons; CSS optimisation left to Vercel
  // ---------------------------------------------------------------------------
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
