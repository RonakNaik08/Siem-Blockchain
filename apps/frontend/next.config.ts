import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ FIX: turbopack root (VERY IMPORTANT)
  turbopack: {
    root: __dirname,
  },

  // ✅ modern optimization (keep this)
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Image optimization
  images: {
    domains: ["localhost"],
  },

  // Env variables
  env: {
    NEXT_PUBLIC_APP_NAME: "SIEM Dashboard",
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;