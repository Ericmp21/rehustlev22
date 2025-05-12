/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This is required for Replit
  webpack: (config, { isServer }) => {
    // Fix for using sharp with webpack 5
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    return config;
  },
  // Listen on all interfaces so it can be accessed outside of Replit
  serverRuntimeConfig: {
    hostname: '0.0.0.0',
  },
};

export default nextConfig;