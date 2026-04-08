import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ FIX: turbopack root
  turbopack: {
    root: __dirname,
  },

  // ✅ modern optimization
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

  // ✅ Webpack path aliases — ensures @/* resolves to src/*
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src"),
    };
    return config;
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