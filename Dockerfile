# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
#  Simple Expenses — Web (Next.js 16, Node 22, Turborepo monorepo)
#
#  Stages:
#    1. installer — npm install (layer-cached; re-runs only when package.json changes)
#    2. builder   — prisma generate + next build (standalone output)
#    3. runner    — minimal runtime image (~200 MB) with non-root user
#
#  Required runtime env vars — pass via docker run -e or docker-compose env_file:
#    DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
#    NEXT_PUBLIC_BETTER_AUTH_URL, STRIPE_SECRET_KEY,
#    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat


# ── Stage 1: Install dependencies (layer-cached per package.json changes) ────
FROM base AS installer
WORKDIR /app

# Copy only package manifests first so this layer is cached until deps change.
# Each workspace package.json is listed explicitly (no glob support in COPY).
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/web/package.json         ./apps/web/package.json
COPY apps/mobile/package.json      ./apps/mobile/package.json
COPY packages/api/package.json     ./packages/api/package.json
COPY packages/types/package.json   ./packages/types/package.json
COPY packages/utils/package.json   ./packages/utils/package.json

# --ignore-scripts skips prisma generate (run explicitly in builder with proper env).
# No --frozen-lockfile: the lockfile was generated on macOS and npm regenerates
# it on linux to add the correct platform-specific optional binaries.
RUN npm install --ignore-scripts


# ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

# Restore the full node_modules (hoisted root + workspace-local copies).
COPY --from=installer /app/node_modules         ./node_modules
COPY --from=installer /app/apps/web/node_modules ./apps/web/node_modules

# Copy all source. .dockerignore excludes .env*, node_modules, .next, etc.
COPY . .

# DATABASE_URL placeholder — prisma.config.ts validates its presence but
# prisma generate does NOT open a DB connection. Inject the real URL at runtime.
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DATABASE_URL=$DATABASE_URL

# Skip t3-oss/env-nextjs validation; all real env vars are injected at runtime.
ENV SKIP_ENV_VALIDATION=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN cd apps/web && npx prisma generate
RUN cd apps/web && npx next build --webpack


# ── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# next build --standalone emits a self-contained server.js + all traced deps.
# With outputFileTracingRoot set to the repo root, the standalone directory
# mirrors the monorepo path: server is at apps/web/server.js inside the bundle.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public           ./apps/web/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
