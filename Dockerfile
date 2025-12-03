FROM oven/bun:1-alpine AS base

WORKDIR /app

# Dependencies stage - install all deps for build
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# Runner stage
FROM oven/bun:1-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy all dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy Next.js build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Copy server files (only what's needed at runtime)
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/lib/game-store.ts ./src/lib/game-store.ts
COPY --from=builder /app/src/lib/types.ts ./src/lib/types.ts
COPY --from=builder /app/src/lib/images.ts ./src/lib/images.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["bun", "run", "server.ts"]
