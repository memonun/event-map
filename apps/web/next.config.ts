import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix monorepo workspace root warning
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // Suppress punycode deprecation warnings from dependencies
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress deprecation warnings during development
      const originalEmit = process.emit;
      process.emit = function (name, data, ...args) {
        if (
          name === 'warning' &&
          typeof data === 'object' &&
          data.name === 'DeprecationWarning' &&
          data.message.includes('punycode')
        ) {
          return;
        }
        return originalEmit.apply(process, arguments as any);
      };
    }
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bugece.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.bugece.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.bugece.com',
        port: '',
        pathname: '/**',
      },
      // Add other potential image domains as needed
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ],
  },

  // Optimize for monorepo
  outputFileTracingIncludes: {
    '/': ['../../packages/**/*'],
  },
};

export default nextConfig;
