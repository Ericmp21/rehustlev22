/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PORT: process.env.PORT || 5000,
    HOST: '0.0.0.0'
  }
}

module.exports = nextConfig