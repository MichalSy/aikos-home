const { withAikoApp } = require('@michalsy/aiko-webapp-core/next-config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3']
  }
}

module.exports = withAikoApp(nextConfig)
