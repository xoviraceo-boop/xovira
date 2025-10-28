FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies layer (monorepo-aware). Expect Docker context to be the repo root.
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Bring in workspace package manifests for proper resolution
COPY packages ./packages
COPY apps/backend/socket-server/package.json ./apps/backend/socket-server/package.json
# Pre-fetch store to leverage caching, then install only what this app needs
RUN pnpm -w fetch
RUN pnpm -w install --frozen-lockfile --filter ./apps/backend/socket-server...

# Build layer
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /root/.pnpm-store /root/.pnpm-store
RUN pnpm config set store-dir /root/.pnpm-store
RUN pnpm -w install --frozen-lockfile --filter ./apps/backend/socket-server...
RUN pnpm -w --filter ./apps/backend/socket-server... run build

# Runtime layer
FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 socketio
ENV NODE_ENV=production
WORKDIR /app

# Copy only the built app and its workspace (to keep symlinks valid)
COPY --from=builder /app /app
WORKDIR /app/apps/backend/socket-server

USER socketio
EXPOSE 3001
ENV PORT=3001

CMD ["node", "dist/index.js"]