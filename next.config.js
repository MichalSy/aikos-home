const { withAikoApp } = require('@michalsy/aiko-webapp-core/next-config')

/** @type {import('next').NextConfig} */
const nextConfig = {}

// SSR by default - only specified pages use Client Components ('use client')
module.exports = withAikoApp(nextConfig, {
  // Pages that need client-side interactivity (tab switching, state, etc.)
  clientPages: [
    '/dashboard/kanban',
    '/dashboard/settings', 
    '/dashboard/inventory'
  ]
})
