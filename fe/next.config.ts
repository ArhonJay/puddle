import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
    };
    // Ignore node-specific modules in browser bundles
    config.externals.push('pino-pretty');
    return config;
  },
};

export default nextConfig;
