/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@arcguilds/database', '@arcguilds/sdk'],
}

module.exports = nextConfig
