# ---- Base image ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies ----
COPY pnpm-lock.yaml package.json ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# ---- Build ----
COPY . .
RUN pnpm build

# ---- Production image ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy from previous build
COPY --from=base /app ./
EXPOSE 3001

# Start the app
CMD ["pnpm", "start"]