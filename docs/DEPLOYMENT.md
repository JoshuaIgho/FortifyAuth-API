# FortifyAuth Deployment Guide (Render)

This document provides instructions for deploying FortifyAuth to Render's Node.js runtime.

## Render Configuration

### 1. Web Service Setup
- **Runtime**: `Node`
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Start Command**: `npm start`

### 2. Environment Variables
Configure the following in the Render Dashboard:

| Variable | Requirement |
|----------|-------------|
| `DATABASE_URL` | Required (PostgreSQL) |
| `REDIS_URL` | Required (Redis) |
| `JWT_ACCESS_SECRET` | Required (32+ chars) |
| `JWT_REFRESH_SECRET` | Required (32+ chars) |
| `NODE_ENV` | `production` |
| `PORT` | Render provides this automatically |

## Build Pipeline
The project uses a unified build pipeline:
1.  **Frontend**: Built with Vite into `dist/`.
2.  **Backend**: Bundled with esbuild into `dist/server.js`.
3.  **Static Serving**: Express serves `dist/index.html` and assets.

## Database Connections
The server performs a mandatory connection check with PostgreSQL via Prisma during startup. If the connection fails, the process will log the error and exit to prevent inconsistent states.
