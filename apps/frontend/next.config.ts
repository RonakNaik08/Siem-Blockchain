import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Enable modern optimizations
  experimental: {
    turbo: true,
    optimizePackageImports: ["lucide-react"]
  },

  // Image optimization (useful later for dashboards)
  images: {
    domains: ["localhost"]
  },

  // Environment variables (safe exposure)
  env: {
    NEXT_PUBLIC_APP_NAME: "SIEM Dashboard"
  },

  // Headers (security best practices)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          }
        ]
      }
    ];
  }
};

export default nextConfig;