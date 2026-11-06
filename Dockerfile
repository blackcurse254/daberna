# Multi-Stage Production Dockerfile for Daberna Land VIP
# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json tsconfig.json vite.config.ts ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy source code and public assets
COPY public ./public
COPY src ./src
COPY index.html ./

# Build production client bundle
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

# Copy compiled frontend from builder
COPY --from=builder /app/dist ./dist

# Copy server files, prisma schema, and config
COPY prisma ./prisma
COPY server.ts ./
COPY src/server ./src/server
COPY src/types ./src/types
COPY src/utils ./src/utils

# Create persistent data directory and assign ownership
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/leaderboard || exit 1

CMD ["tsx", "server.ts"]
