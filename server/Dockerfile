# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Debug: list dist contents
RUN ls -la dist/

# Prune dev dependencies
RUN pnpm prune --prod

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

# Copy package.json for npm scripts
COPY package.json ./

# Copy node_modules and dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
