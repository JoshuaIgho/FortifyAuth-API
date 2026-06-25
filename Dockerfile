FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# We use npm install --legacy-peer-deps because we have forced some versions
# that npm ci might complain about if not perfectly aligned in lockfile.
# But with my recent npm install, the lockfile should be good.
# Still, --legacy-peer-deps is safer given the explicit requirements.
RUN npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm install --legacy-peer-deps

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/server.js"]



