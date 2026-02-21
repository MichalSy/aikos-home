# 🌸 Aiko's Home - Next.js Control Center

> AI Control Center with Agent Spawning - Next.js Version

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server (Port 3001)
npm start
```

## Features

- ✅ Next.js 14 (App Router)
- ✅ TypeScript + Tailwind CSS
- ✅ SQLite Database
- ✅ Password Authentication
- ✅ REST API Routes
- 🚧 WebSocket Server (coming soon)
- 🚧 Quest Management UI
- 🚧 Agent Spawning System

## API Routes

### Auth
- `POST /api/auth/login` - Login with password

### Quests
- `GET /api/quests` - Get all quests with tasks
- `POST /api/quests` - Create new quest

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind
- **Backend:** Next.js API Routes
- **Database:** SQLite (better-sqlite3)
- **WebSocket:** Socket.io (planned)

## Docker Build

The Docker image is built and pushed to GHCR via GitHub Actions.

### Required Repository Secret

The project depends on `@michalsy/aiko-webapp-core` from GitHub Packages. Because `GITHUB_TOKEN` is scoped to the current repository and cannot read packages from other repositories, a **Personal Access Token (PAT)** is required:

1. Create a PAT (classic) with the `read:packages` scope
2. Add it as a repository secret named **`NPM_TOKEN`**

## Deployment (Caddy)

Domain: `aiko-home.sytko.de`

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "aikos-home" -- start

# Or directly
npm start
```

## Migration Status

- ✅ Basic Next.js Setup
- ✅ SQLite Integration
- ✅ Auth API Route
- ✅ Quests API Route
- 🚧 WebSocket Integration
- 🚧 Frontend Components
- 🚧 Agent Spawning System

---

Built with ❤️ by Michal & Ryu 🐉
# Trigger rebuild
