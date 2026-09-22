import type { NextConfig } from "next";

/**
 * NEXT_DIST_DIR lets a throwaway dev server build into its own directory, so a
 * second instance can be started for checking a change without touching the one
 * already running (and without dropping the browser tab pointed at it).
 * See package.json → "dev:check".
 */
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: [
              "accelerometer=(self)",
              "browsing-topics=()",
              "camera=()",
              "geolocation=(self)",
              "gyroscope=(self)",
              "magnetometer=(self)",
              "microphone=()",
              "payment=()",
              "usb=()",
            ].join(", "),
          },
        ],
      },
    ];
  },
  experimental: {
    // Two dev servers only coexist if neither claims the other's lock.
    lockDistDir: false,
  },
};

export default nextConfig;
