export const productionEnvExample = `# ==============================================================================
# FORTIFYAUTH PRODUCTION SERVER ENVIRONMENT CONFIGURATION
# ==============================================================================

# Core Application General Settings
PORT=3000
NODE_ENV=production
APP_URL=https://api.fortifyauth.com

# Relational Database connection parameters (PostgreSQL with SSL enabled)
# Ensure to append sslmode=require in production to protect data in transit.
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DB>?sslmode=require&schema=public"

# Redis cache and Token session store client string
REDIS_URL="rediss://:<PASSWORD>@<HOST>:6379/0"

# HS256 JWT Cryptographic Secrets (Must be at least 32/64 high-entropy random characters)
# Generate via: openssl rand -base64 48
JWT_ACCESS_SECRET="<YOUR_JWT_ACCESS_SECRET>"
JWT_REFRESH_SECRET="<YOUR_JWT_REFRESH_SECRET>"

# Token lifespan thresholds limits
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# SMTP Traversal and Credentials for transaction-mail senders
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<YOUR_SMTP_PASSWORD>
SMTP_FROM="FortifyAuth Security <security@fortifyauth.com>"

# CORS and Allowed Origins Configuration (No wildcards permitted)
CORS_ALLOWED_ORIGINS="https://app.fortifyauth.com,https://admin.fortifyauth.com"
`;

export const productionDockerfile = `# ==============================================================================
# SECURE MULTI-STAGE DOCKERFILE FOR TYPESCRIPT PRODUCTION DEPLOYMENT
# ==============================================================================

# STAGE 1: Compilation environment
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Only copy system lockfiles first to maximize build-cache hits
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install build dependencies including compiler tools
RUN npm ci

# Copy server code
COPY src ./src

# Generate prisma client artifacts
RUN npx prisma generate

# Compile TypeScript into native ESModule / CommonJS Javascript (dist/)
RUN npm run build

# Remove development devDependencies
RUN npm prune --production

# ==============================================================================
# STAGE 2: Lightweight runtime environment (Strictly non-root permissions)
FROM node:20-alpine AS runner

WORKDIR /usr/app

# Inherit safe minimal systems settings
ENV NODE_ENV=production

# Install system utilities needed for health check operations
RUN apk add --no-cache curl

# Copy only compiled code and production node_modules from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Add an unprivileged user to execute container workflows (Reject root execution)
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nestuser -u 1001 && \\
    chown -R nestuser:nodejs /usr/app

USER nestuser

# Expose server ingress port
EXPOSE 3000

# Continuous health assessment configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start execution through compiled JS bundle
CMD ["node", "dist/server.js"]
`;

export const productionDockerCompose = `# ==============================================================================
# DOCKER-COMPOSE CLUSTER CONFIGURATION FOR LOCAL PRODUCTION RUNS
# ==============================================================================
version: '3.8'

services:
  # The FortifyAuth Backend Web Application
  fortify_api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fortify_api_prod
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - DATABASE_URL=postgresql://<USER>:<PASSWORD>@postgres_db:5432/fortify_database?sslmode=disable
      - REDIS_URL=redis://:<PASSWORD>@redis_cache:6379/0
      - JWT_ACCESS_SECRET=<YOUR_JWT_ACCESS_SECRET>
      - JWT_REFRESH_SECRET=<YOUR_JWT_REFRESH_SECRET>
      - SMTP_HOST=smtp.mailtrap.io
      - SMTP_PORT=2525
      - SMTP_USER=your_user_id
      - SMTP_PASS=<PASSWORD>
      - SMTP_FROM=security@fortifyauth.com
    depends_on:
      postgres_db:
        condition: service_healthy
      redis_cache:
        condition: service_healthy
    networks:
      - fortify_backend
    restart: always

  # Persistent SQL Schema Store Database
  postgres_db:
    image: postgres:15-alpine
    container_name: postgres_db_prod
    environment:
      - POSTGRES_USER=<USER>
      - POSTGRES_PASSWORD=<PASSWORD>
      - POSTGRES_DB=fortify_database
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fortify_user -d fortify_database"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - fortify_backend
    restart: always

  # In-Memory Cache and Rate Limiting Redis Server
  redis_cache:
    image: redis:7-alpine
    container_name: redis_cache_prod
    command: redis-server --requirepass <PASSWORD>
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "<PASSWORD>", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - fortify_backend
    restart: always

volumes:
  pgdata:
  redisdata:

networks:
  fortify_backend:
    driver: bridge
`;
