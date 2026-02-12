# Build stage
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy dependency files first (cached layer)
COPY package.json bun.lock ./

# Install all dependencies
RUN bun install --frozen-lockfile

# Copy config files (rarely change = good cache hit)
COPY tsconfig.json nest-cli.json ./

# Copy source code
COPY . .

# Build and prune in one layer
RUN bun run build && bun install --production --ignore-scripts

# Production stage
FROM oven/bun:alpine AS production

WORKDIR /app

# Copy only what's needed to run
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["bun", "dist/main"]
