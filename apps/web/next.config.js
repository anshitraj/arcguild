/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@arcguilds/database', '@arcguilds/sdk'],
  images: {
    domains: ['localhost', 'pexels.com'],
  },
}

module.exports = nextConfig
