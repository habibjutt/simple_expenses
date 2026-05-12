# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fixpenses** is a full-stack expense tracking app organized as a **Turborepo monorepo**. It consists of:

- `apps/web` — Next.js 16 (App Router) web application
- `apps/mobile` — Expo SDK 55 / React Native mobile app (iOS & Android)
- `packages/types` — Shared TypeScript types and Zod schemas
- `packages/utils` — Shared utilities (`formatCurrency`, date helpers, `cn`)
- `packages/api` — REST API client that wraps `apps/web`'s `/api/v1/` endpoints (used by mobile)

## Commands

All commands run from the **repo root** unless otherwise noted.

```bash
# Install dependencies
npm install

# Web dev server
npm run dev

# Mobile dev server (Expo)
npm run dev:mobile

# Build all workspaces
npm run build

# Lint all workspaces
npm run lint

# Format all workspaces
npm run format

# Docker (local dev with hot-reload)
npm run dev:docker          # start
npm run dev:docker:build    # start with build
npm run dev:docker:down     # stop
npm run dev:docker:reset    # wipe volumes and rebuild
```

### Web-only commands (run from `apps/web/`)

```bash
npx prisma migrate dev --name <description>   # create + apply migration
npx prisma migrate deploy                      # apply migrations (prod/CI)
npx prisma generate                            # regenerate Prisma client
npx prisma studio                             # open Prisma Studio UI
npx playwright test                           # run e2e tests
npx playwright test --ui                      # run e2e tests with UI
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # local Stripe webhook
```

### Turbo filter builds

```bash
npx turbo build --filter=@simple-expenses/web
npx turbo build --filter=@simple-expenses/mobile
```

## Environment Setup

**Web** (`apps/web/.env.local`): requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, Stripe keys, and SMTP settings. Optional: `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `CRON_SECRET`.

**Mobile** (`apps/mobile/.env.local`): requires `EXPO_PUBLIC_API_URL` (pointing to the running web app). Optional: `EXPO_PUBLIC_REVENUECAT_API_KEY` for in-app subscriptions.

## Architecture

### Web App (`apps/web`)

**Next.js App Router structure:**
- `app/(protected)/` — authenticated routes (dashboard, transactions, categories, reports, billing, settings, etc.)
- `app/(protected)/(admin)/` — admin-only routes, protected by `requireAdmin()` in `lib/permissions.ts`
- `app/api/v1/` — REST API endpoints consumed by the mobile app and `packages/api`
- `app/api/` — Server Actions for web (not REST; each resource has a `*-action.ts` file)
- `app/login`, `app/signup`, `app/forgot-password`, `app/reset-password` — public auth pages

**Key library files (`apps/web/lib/`):**
- `auth.ts` — Better Auth configuration (Prisma adapter, sessions, rate limiting, email verification, OAuth)
- `auth-client.ts` — Better Auth browser client
- `db.ts` — PrismaClient singleton using `@prisma/adapter-pg` (native PostgreSQL driver)
- `env.ts` — `@t3-oss/env-nextjs` validated environment variables (the source of truth for env vars)
- `plans.ts` — Plan tiers (`free` / `pro` / `premium` / `trial`), feature limits, and Stripe price ID mappings. **Edit this file to change plan limits or add gated features.**
- `plan-guards.ts` — Server-side limit enforcement helpers
- `subscription.ts` — Resolves a user's effective subscription status from DB (handles Stripe + Apple/Google RevenueCat)
- `stripe.ts` / `stripe-config.ts` — Stripe client and product/price config
- `permissions.ts` — `requireAdmin()` and admin session helpers
- `rate-limit.ts` — Rate limiting utilities (backed by DB)
- `email.ts` — Nodemailer email sending (password reset, verification)
- `sanitize.ts` — Input sanitization helpers

**Prisma:** Client is generated into `apps/web/generated/prisma/client/` (not the default location). Import via `../generated/prisma/client` inside the web app.

### Mobile App (`apps/mobile`)

- Uses **Expo Router** (file-based routing) with two route groups: `(app)` (authenticated) and `(auth)` (login/signup)
- **NativeWind** (Tailwind for React Native) for styling
- **TanStack Query** for data fetching, calling the `packages/api` client
- **RevenueCat** (`react-native-purchases`) for in-app subscription management (Apple/Google)
- Auth state managed via Better Auth bearer tokens stored in `expo-secure-store`

### Shared Packages

- `packages/types` — Zod schemas + TypeScript types for all domain entities. Mobile and web both import from here.
- `packages/api` — Configured via `configureApiClient({ baseUrl, getToken })` once at app startup. All mobile data fetching goes through this client.

### Subscription / Plan System

Three tiers: **Free**, **Pro**, **Premium**, plus a **Trial** state (grants Premium limits). Subscriptions can come from Stripe (web) or Apple/Google via RevenueCat (mobile). The effective plan is resolved by `getSubscriptionInfo()` in `lib/subscription.ts` and enforced server-side via `lib/plan-guards.ts`.

### API Design

The `/api/v1/` routes serve as the mobile REST API. The web app uses Next.js Server Actions (files named `*-action.ts`) directly rather than going through the REST layer. Authentication for API routes uses Better Auth bearer tokens (`lib/auth.ts` with the `bearer` plugin).
