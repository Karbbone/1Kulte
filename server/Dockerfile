# Build stage
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install all dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Debug: list dist contents
RUN ls -la dist/

# Reinstall production dependencies only
RUN bun install --production

# Production stage
FROM oven/bun:latest AS production

WORKDIR /app

# Copy package.json for scripts
COPY package.json ./

# Copy node_modules and dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "dist/main"]
