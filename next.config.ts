import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (and Partial Prefetching, which depends on it) are left
  // off: almost every page in this app shows per-user data, so pages are
  // rendered on request and there is little to cache.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
