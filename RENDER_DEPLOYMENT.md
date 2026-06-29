# Deployment Guide: Render (Native Node.js)

This project is optimized for direct deployment to Render's Node.js runtime.

## Configuration

### 1. Environment Runtime
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 2. Environment Variables
Ensure the following variables are set in the Render Dashboard:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Managed PostgreSQL connection string |
| `REDIS_URL` | Managed Redis connection string |
| `JWT_ACCESS_SECRET` | 32+ character random string |
| `JWT_REFRESH_SECRET` | 32+ character random string |
| `SMTP_HOST` | SMTP provider host |
| `SMTP_PORT` | SMTP port (e.g. 587) |
| `SMTP_USER` | SMTP auth user |
| `SMTP_PASS` | SMTP auth password |
| `SMTP_FROM` | Sender email address |
| `APP_URL` | The URL of your Render web service |
| `NODE_ENV` | Set to `production` |

## Build Pipeline
The build pipeline performs the following:
1.  **Frontend Build**: Vite compiles the React code into `dist/`.
2.  **Backend Bundle**: esbuild bundles the TypeScript server into `dist/server.js`.
3.  **Static Serving**: The production server automatically serves the frontend from `dist/`.

## Health Monitoring
- **Endpoint**: `/health`
- The server will only start if a successful database connection is established.
