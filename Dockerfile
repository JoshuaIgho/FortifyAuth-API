# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Using npm install --legacy-peer-deps to handle conflicts during build
RUN npm install --legacy-peer-deps
COPY . .
# Generate Prisma Client
RUN npx prisma generate
# Build frontend and bundle server
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
# Inherit only what's needed for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Port is dynamic on Render
EXPOSE 4000
CMD ["node", "dist/server.js"]
