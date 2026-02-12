# syntax=docker/dockerfile:1
# Build stage
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy dependency files first (cached layer)
COPY package.json bun.lock ./

# Install deps with persistent cache (survives même si bun.lock change)
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy config files (rarely change = good cache hit)
COPY tsconfig.json nest-cli.json ./

# Copy source code
COPY . .

# Build and prune in one layer
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun run build && bun install --production --ignore-scripts

# Production stage
FROM oven/bun:alpine AS production

WORKDIR /app

# --link permet la copie parallèle des layers
COPY --link --from=builder /app/package.json ./
COPY --link --from=builder /app/node_modules ./node_modules
COPY --link --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["bun", "dist/main"]
