/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security
  poweredByHeader: false, // Ocultar header "X-Powered-By: Next.js"
  reactStrictMode: true,

  // Build configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Images
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tile.openstreetmap.org",
      },
    ],
  },

  // Compression
  compress: true,

  // Headers de seguridad adicionales (complementan middleware.ts)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Download-Options",
            value: "noopen",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
