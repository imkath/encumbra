import type { NextConfig } from "next";

/**
 * NEXT_DIST_DIR lets a throwaway dev server build into its own directory, so a
 * second instance can be started for checking a change without touching the one
 * already running (and without dropping the browser tab pointed at it).
 * See package.json → "dev:check".
 */
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async headers() {
    return ["/sistema-diseno.html", "/propuestas.html"].map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
    }));
  },
  experimental: {
    // Two dev servers only coexist if neither claims the other's lock.
    lockDistDir: false,
  },
};

export default nextConfig;
