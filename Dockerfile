# ---- deps stage ----
FROM node:22.15-alpine AS deps
RUN apk upgrade --no-cache && npm install -g pnpm@10.11.0

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/worker/package.json ./apps/worker/

RUN pnpm install --frozen-lockfile

# ---- builder stage ----
FROM node:22.15-alpine AS builder
RUN apk upgrade --no-cache && npm install -g pnpm@10.11.0

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules

COPY . .

# Generate Prisma client — dummy DATABASE_URL satisfies prisma.config.ts at build time
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm --dir apps/api exec prisma generate

# Build the API
RUN pnpm --dir apps/api build

# ---- runner stage ----
FROM node:22.15-alpine AS runner
RUN apk upgrade --no-cache

WORKDIR /app

ENV NODE_ENV=production

# Copy only what runtime needs
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/generated ./apps/api/generated
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts

EXPOSE ${PORT:-3000}

# Run migrations then start the server
CMD ["sh", "-c", "(cd apps/api && node_modules/.bin/prisma migrate deploy) && node apps/api/dist/src/main"]
