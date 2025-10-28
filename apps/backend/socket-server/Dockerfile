FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies layer (monorepo-aware)
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/backend/socket-server/package.json ./apps/backend/socket-server/package.json
RUN pnpm -w fetch
RUN pnpm -w install --frozen-lockfile --filter ./apps/backend/socket-server...

# Build layer
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm -w install --frozen-lockfile --filter ./apps/backend/socket-server...
WORKDIR /app/apps/backend/socket-server
RUN pnpm run build

# Runtime layer
FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 socketio
ENV NODE_ENV=production
WORKDIR /app

# Copy built app
COPY --from=builder /app /app
WORKDIR /app/apps/backend/socket-server

USER socketio
EXPOSE 3001
ENV PORT=3001

# ✅ Use start script that registers tsconfig-paths
CMD ["pnpm", "start"]