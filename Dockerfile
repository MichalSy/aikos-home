# syntax=docker/dockerfile:1
# Aiko's Home - Docker Image
# Based on Node.js 20 Alpine

FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install ALL dependencies (devDependencies needed for build)
# NPM_TOKEN is passed as a Docker build secret and exported as an env var
# so that .npmrc can expand ${NPM_TOKEN} for GitHub Packages authentication
RUN --mount=type=secret,id=npm_token \
    export NPM_TOKEN=$(cat /run/secrets/npm_token) \
    && npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy necessary files from builder
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/server.js ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
