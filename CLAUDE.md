# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fixpenses** is a full-stack expense tracking app organized as a **Turborepo monorepo**. It consists of:

- `apps/web` — Next.js 16 (App Router) web application (`@simple-expenses/web`)
- `apps/mobile` — Expo SDK 55 / React Native 0.83.2 mobile app (`@simple-expenses/mobile`)
- `packages/types` — Shared TypeScript types and Zod schemas (`@simple-expenses/types`)
- `packages/utils` — Shared utilities: `formatCurrency`, date helpers, `cn` (`@simple-expenses/utils`)
- `packages/api` — REST API client that wraps `apps/web`'s `/api/v1/` endpoints, used by mobile (`@simple-expenses/api`)

## Commands

All commands run from the **repo root** unless otherwise noted.

```bash
npm install               # install dependencies
npm run dev               # web dev server
npm run dev:mobile        # mobile dev server (Expo)
npm run build             # build all workspaces
npm run lint              # lint all workspaces
npm run format            # format all workspaces (Prettier)
npm run format:check      # check formatting without writing

# Turbo filter builds
npx turbo build --filter=@simple-expenses/web
npx turbo build --filter=@simple-expenses/mobile

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
npx prisma studio                              # open Prisma Studio UI
npx playwright test                            # run all e2e tests
npx playwright test e2e/auth.spec.ts           # run a single e2e spec
npx playwright test --ui                       # run e2e tests with UI
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # local Stripe webhook
```

### Mobile-only commands (run from `apps/mobile/`)

```bash
npm run dev             # expo start
npm run android         # expo run:android
npm run ios             # expo run:ios
npm run build:android   # eas build --platform android
npm run build:ios       # eas build --platform ios
```

## Environment Setup

**Web** (`apps/web/.env.local`): requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `STRIPE_SECRET_KEY`, and email settings (`EMAIL_PROVIDER` defaults to `"smtp"`, set to `"resend"` to use Resend). Optional: `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `CRON_SECRET`, `REVENUECAT_WEBHOOK_SECRET`.

Set `SKIP_ENV_VALIDATION=1` to bypass `@t3-oss/env-nextjs` validation during CI builds or when env vars are unavailable. Env vars are defined and validated in `lib/env.ts`.

**Mobile** (`apps/mobile/.env.local`): requires `EXPO_PUBLIC_API_URL` (pointing to the running web app). Optional: `EXPO_PUBLIC_REVENUECAT_API_KEY` for in-app subscriptions.

## Architecture

### Web App (`apps/web`)

**Next.js 16 App Router.** Path alias `@/` maps to `apps/web/` (not the repo root).

**Route structure:**
- `app/(protected)/` — authenticated routes (dashboard, transactions, categories, reports, billing, settings, etc.)
- `app/(protected)/(admin)/` — admin-only routes, protected by `requireAdmin()` in `lib/permissions.ts`
- `app/api/v1/` — REST API endpoints consumed by mobile and `packages/api`
- `app/api/*-action.ts` — Server Actions for web (not REST; one file per resource domain)
- `app/login`, `app/signup`, `app/forgot-password`, `app/reset-password` — public auth pages

**Data flow:**
- Web UI calls server actions (`app/api/*-action.ts`) directly — no API hop
- Mobile calls REST routes at `app/api/v1/` via `@simple-expenses/api`
- Both paths hit the same Prisma client (`lib/db.ts`)

**Key library files (`apps/web/lib/`):**
- `auth.ts` — Better Auth config (Prisma adapter, sessions, rate limiting, email verification, OAuth, `bearer` + `admin` plugins)
- `auth-client.ts` — Better Auth browser client (`signIn`, `signOut`, `useSession`)
- `db.ts` — PrismaClient singleton using `@prisma/adapter-pg` (native PostgreSQL driver)
- `env.ts` — `@t3-oss/env-nextjs` validated env vars (source of truth for all env vars)
- `plans.ts` — Plan tiers (`free`/`pro`/`premium`/`trial`), feature limits, and Stripe price ID mappings. **Edit this file to change plan limits or add gated features.**
- `plan-guards.ts` — Server-side limit enforcement helpers
- `subscription.ts` — Resolves a user's effective subscription status from DB (handles Stripe + Apple/Google RevenueCat)
- `stripe.ts` / `stripe-config.ts` — Stripe client and product/price config
- `permissions.ts` — `requireAdmin()` and admin session helpers
- `sanitize.ts` — Input sanitization helpers

### Database

**PostgreSQL** via Prisma v7 with the `@prisma/adapter-pg` driver adapter. Schema: `apps/web/prisma/schema.prisma`. Generated client output: `apps/web/generated/prisma/` — import via `@/generated/prisma/client`.

**Schema change workflow — always follow this order:**
1. Edit `apps/web/prisma/schema.prisma`
2. `npx prisma migrate dev --name <descriptive_name>` (from `apps/web/`)
3. `npx prisma generate`

**Never use `prisma db push`.** It bypasses migration history and breaks `prisma migrate deploy` in production.

**Key models:** `user` (auth + Stripe subscription fields), `credit_card`, `bank_account`, `transaction` (supports installments and recurring), `invoice` (linked to credit cards), `category` (user-owned, typed as expense/income/both), `spending_limit`, `savings_goal`, `audit_log`, `feature_flag`. Better Auth models: `session`, `account`, `verification`, `rateLimit`.

### Authentication

Uses **Better Auth** with `bearer` (API token auth for mobile) and `admin` (RBAC) plugins. Providers: email/password (verification required), GitHub OAuth, Google OAuth. Account linking enabled across all providers.

```ts
// Server-side
import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: await headers() });

// Client-side
import { signIn, signOut, useSession } from "@/lib/auth-client";
```

### Subscription / Plan System

Three tiers: **Free**, **Pro**, **Premium**, plus a **Trial** state (grants Premium limits, 14-day trial). Subscriptions come from Stripe (web) or Apple/Google via RevenueCat (mobile). Effective plan resolved by `getSubscriptionInfo()` in `lib/subscription.ts`, enforced server-side via `lib/plan-guards.ts`.

### Mobile App (`apps/mobile`)

- **Expo Router** (file-based routing): `app/(app)/` (authenticated), `app/(auth)/` (login/signup)
- **NativeWind** v4 (Tailwind for React Native) for styling; Tailwind CSS **v3** (not v4 like web)
- **TanStack Query** v5 for data fetching via `@simple-expenses/api`
- **RevenuCat** (`react-native-purchases`) for in-app subscription management
- Auth state: Better Auth bearer tokens stored in `expo-secure-store`
- Theme: `apps/mobile/lib/theme.ts` — import colors/shadows from here, never hardcode

### Shared Packages

- `packages/types` — Zod schemas + TypeScript types for all domain entities. Both apps import from here. Includes `SUPPORTED_CURRENCIES`, `CurrencyCode`, all entity schemas.
- `packages/utils` — `cn()` (clsx + tailwind-merge), `formatCurrency(amount, currency?)` (default `"AED"`), date formatting helpers, `clamp`, `formatPercent`.
- `packages/api` — Configured via `configureApiClient({ baseUrl, getToken, onUnauthorized })` once at app startup. All mobile data fetching goes through this client.

Note: `apps/web/lib/utils.ts` re-exports everything from `@simple-expenses/utils` and `@simple-expenses/types` for backward compatibility. New web code can import from either `@/lib/utils` or the packages directly.

## Web UI Conventions

**File naming:** React components use PascalCase (`Header.tsx`). Feature files use kebab-case (`credit-card-action.ts`). Modals: `*-modal.tsx`. Forms: `*-form.tsx`.

**Components:** shadcn/ui (New York style) in `components/ui/` — do not hand-edit these. Custom components in `components/`. Tailwind CSS v4 with `cn()` from `@/lib/utils` for conditional classes.

**Key UI libraries:** Recharts (charts), TanStack React Table (data tables), dnd-kit (drag-and-drop), Sonner (toasts), Vaul (drawers/sheets), cmdk (command palette), React Day Picker (dates).

**Icons:** Lucide React + Tabler Icons (`@tabler/icons-react`).

**Theme:** Light/dark via `next-themes`. Font: Plus Jakarta Sans (`--font-jakarta`).

**Currency:** The app is multi-currency (AED default). Always use `formatCurrency(amount, currency?)` and `CurrencyCode` type — never hardcode currency codes in display logic.

## E2E Tests

Playwright tests live in `apps/web/e2e/`. Four test projects configured in `playwright.config.ts`:
- `setup` — authenticates once and persists session to `playwright/.auth/user.json`
- `auth-flows` — auth-specific tests (runs unauthenticated)
- `billing` — billing boundary tests (creates its own account, uses `en-US` locale + UTC timezone)
- `chromium` — all other tests (reuses saved session, depends on `setup`)

The web server auto-starts via `npm run dev` when running tests. Test user credentials default to env vars `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`.

Web build uses `--webpack` flag (`next build --webpack`) rather than the Next.js 16 default Turbopack bundler.
