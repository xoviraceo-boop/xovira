# ===== Base image =====
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ===== Build layer =====
FROM base AS builder
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Generate Prisma client
RUN cd packages/database && pnpm run db:generate

# Build types
RUN cd packages/types && pnpm run build

# Build service
RUN cd apps/backend/service-server && pnpm run build

# ===== Runtime layer =====
FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 serviceio

WORKDIR /app

# Copy EVERYTHING from builder
COPY --chown=serviceio:nodejs --from=builder /app ./

WORKDIR /app/apps/backend/service-server

USER serviceio

EXPOSE 3001
ENV PORT=3001 NODE_ENV=production

CMD ["node", "scripts/run-server-and-worker.js"]