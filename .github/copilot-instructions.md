# Copilot Instructions

## Monorepo Overview

**Turborepo** monorepo with two apps and three shared packages.

```
apps/
  web/     — Next.js 16 full-stack web app  (@simple-expenses/web)
  mobile/  — Expo 55 / React Native 0.83.2  (@simple-expenses/mobile)
packages/
  api/     — Shared HTTP API client          (@simple-expenses/api)
  types/   — Shared TypeScript types + Zod   (@simple-expenses/types)
  utils/   — Shared utilities                (@simple-expenses/utils)
```

## Commands

**Root (Turborepo):**
```bash
npm run dev          # Start the web dev server
npm run dev:mobile   # Start the Expo dev server
npm run build        # Build all packages + apps
npm run lint         # Lint all workspaces
npm run format       # Prettier (all workspaces)
npm run format:check # Prettier check (all workspaces)
```

**Web app only (`apps/web`):**
```bash
npm run dev          # next dev
npm run build        # prisma generate && next build --webpack
npm run lint         # eslint
npm run test:e2e     # Playwright end-to-end tests
npm run test:e2e:ui  # Playwright with UI mode
npm run studio       # prisma studio
```

**Mobile app only (`apps/mobile`):**
```bash
npm run dev          # expo start
npm run android      # expo run:android
npm run ios          # expo run:ios
npm run build:android  # eas build --platform android
npm run build:ios      # eas build --platform ios
```

## Shared Packages

### `@simple-expenses/types` (`packages/types/src/index.ts`)
Single source of truth for shared types and Zod schemas. Import from here in **both** web and mobile:
- `SUPPORTED_CURRENCIES`, `CurrencyCode` — 18 currencies (AED default)
- `User`, `CreditCard`, `BankAccount`, `Transaction`, `Invoice`, `Category`
- Zod schemas: `createCreditCardSchema`, `createTransactionSchema`, `loginSchema`, `signupSchema`, etc.
- `ApiResponse<T>`, `ApiError`

### `@simple-expenses/utils` (`packages/utils/src/index.ts`)
Shared pure utilities. Import from here in **both** web and mobile:
- `cn(...inputs)` — Tailwind class merging (clsx + tailwind-merge)
- `formatCurrency(amount, currency?)` — locale-aware, ISO 4217 code (default `"AED"`)
- `CURRENCY_LOCALE_MAP` — maps currency codes to BCP 47 locales
- `formatMonthYear`, `formatDate`, `formatShortDate`, `toLocalISODate`
- `clamp(value, min, max)`, `formatPercent(value, total)`

> **Note:** `apps/web/lib/utils.ts` re-exports everything above for backward compatibility within the web app. New web code should prefer `@simple-expenses/utils` / `@simple-expenses/types` directly, but `@/lib/utils` is also fine.

### `@simple-expenses/api` (`packages/api/src/index.ts`)
HTTP REST client used by the **mobile app** to call the web's `/api/v1/` endpoints. Must be configured before use:
```ts
import { configureApiClient, creditCards, bankAccounts, transactions, invoices, categories, auth } from "@simple-expenses/api";

configureApiClient({ baseUrl, getToken, onUnauthorized });
```
Exposes typed methods for: `auth`, `creditCards`, `bankAccounts`, `transactions`, `invoices`, `categories`.

## Web App Architecture (`apps/web`)

**Next.js 16 App Router** — expense tracking SaaS with subscriptions.

### Data flow
- **Web UI → Server Actions** — Web pages/components call server actions in `app/api/*-action.ts` directly (no API hop needed)
- **Mobile → REST API** — Mobile app uses `@simple-expenses/api` to call real REST routes at `app/api/v1/`
- Both paths hit the same Prisma client (`lib/db.ts`)
- Auth state: `lib/auth.ts` (server) / `lib/auth-client.ts` (client)

### REST API routes (`app/api/v1/`)
Real HTTP routes consumed by the mobile app:
`auth`, `credit-cards`, `bank-accounts`, `transactions`, `invoices`, `categories`, `spending-limits`, `savings-goal`, `reports`, `notifications`, `billing`, `cron`, `webhooks`, `admin`, `health`

### Path alias
`@/` maps to `apps/web/` (not the repo root).

## Database (`apps/web`)

- **PostgreSQL** via Prisma v7 with the `@prisma/adapter-pg` driver adapter
- Schema: `apps/web/prisma/schema.prisma`
- Generated client: `apps/web/generated/prisma/` — import from `@/generated/prisma/client`

**Schema change workflow — always follow this order, no exceptions:**
1. Edit `apps/web/prisma/schema.prisma`
2. `npx prisma migrate dev --name <descriptive_name>` (from `apps/web/`) — creates migration + applies it
3. `npx prisma generate` — regenerates the client

**Never use `prisma db push`.** It bypasses migration history and breaks `prisma migrate deploy` in production.

**Key models:**
- `user` — auth user; includes `role`, `preferredCurrency`, `onboardingCompleted`, Stripe subscription fields (`stripeCustomerId`, `subscriptionStatus`, `trialEndsAt`, `currentPeriodEnd`)
- `credit_card` — `name`, `billGenerationDate` (1–31), `paymentDate` (1–31), `cardLimit`, `availableBalance`, `currency`
- `bank_account` — `name`, `initialBalance`, `currentBalance`, `currency`
- `transaction` — linked to `credit_card` or `bank_account`; supports installments (`installments`, `installmentNumber`, `parentTransactionId`) and recurring (`isRecurring`, `recurringFrequency`, `nextRecurDate`, `parentRecurringId`)
- `invoice` — linked to `credit_card`; tracks `billStartDate`, `billEndDate`, `paymentDueDate`, `totalAmount`, `paidAmount`, `creditFromPreviousMonth`
- `category` — user-owned; `name`, `color`, `icon`, `type` (expense/income/both)
- `spending_limit` — per category/month/year budget cap
- `savings_goal` — `name`, `targetAmount`, `currentAmount`, `deadline`
- `audit_log` — admin audit trail: `action`, `entityType`, `entityId`, `metadata`
- `feature_flag` — key/enabled admin toggles
- Better Auth models: `session`, `account`, `verification`, `rateLimit`

## Authentication (`apps/web`)

Uses **Better Auth** with the `bearer` and `admin` plugins.

```ts
// Server-side (Server Components or actions)
import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: await headers() });

// Client-side
import { signIn, signOut, useSession } from "@/lib/auth-client";
```

**Providers:** email/password (verification required), GitHub OAuth (optional), Google OAuth (optional).  
**Plugins:** `bearer()` (API token auth for mobile), `admin()` (RBAC).  
**Account linking** enabled across all providers.  
**Rate limiting** is database-backed with stricter limits in production.

**Required env vars:**
```
DATABASE_URL
BETTER_AUTH_SECRET          # 32+ char secret
BETTER_AUTH_URL             # e.g. http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL
STRIPE_SECRET_KEY           # sk_...
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
```

**Optional env vars:**
```
GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
STRIPE_WEBHOOK_SECRET, STRIPE_MONTHLY_PRICE_ID, STRIPE_YEARLY_PRICE_ID
CRON_SECRET
```

Env vars are validated at startup via `@t3-oss/env-nextjs` in `lib/env.ts`.

## Subscriptions (`apps/web`)

Stripe integration with a **14-day free trial**, then monthly or yearly plans.
- `lib/stripe.ts` — server-side Stripe SDK
- `lib/stripe-config.ts` — `TRIAL_DAYS = 14`, `STRIPE_PRICES.monthly / .yearly`
- `lib/subscription.ts` — subscription helpers
- Webhooks: `app/api/webhooks/route.ts`
- Billing actions: `app/api/billing-action.ts`

## Web UI Conventions

**File naming:**
- React components: PascalCase (`Header.tsx`, `CreditCardModal.tsx`)
- Feature files: kebab-case (`credit-card-action.ts`, `login-form.tsx`)
- Modals: `*-modal.tsx` | Forms: `*-form.tsx`

**Components:**
- shadcn/ui (New York style) in `components/ui/` — do not hand-edit
- Custom/feature components in `components/`
- Tailwind CSS v4; use `cn()` from `@/lib/utils` for conditional classes

**Key UI libraries:** Recharts (charts), TanStack React Table (data tables), dnd-kit (drag-and-drop), Sonner (toasts), Vaul (drawers/sheets), cmdk (command palette), React Day Picker (dates)

**Icons:** Lucide React + Tabler Icons (`@tabler/icons-react`)

**Themes:** Light/dark via `next-themes`. Font: **Plus Jakarta Sans** (`--font-jakarta`).

**Currency:**
- The app is **multi-currency**. AED is the default; users set a preferred currency per card/account.
- Use `formatCurrency(amount, currency?)` from `@/lib/utils` (or `@simple-expenses/utils`)
- Use `CurrencyCode` type from `@/lib/utils` (or `@simple-expenses/types`) — never use raw strings for currency codes
- Never hardcode `"AED"` in display logic

## Mobile App Architecture (`apps/mobile`)

**Expo 55 / React Native 0.83.2** with **Expo Router** (file-based navigation).

### Stack
- **Routing**: Expo Router 5 — `app/(app)/` (authenticated), `app/(auth)/` (login/signup)
- **Styling**: NativeWind v4 (Tailwind for React Native)
- **Data fetching**: TanStack React Query 5
- **Forms**: React Hook Form + Zod (same schemas from `@simple-expenses/types`)
- **API**: `@simple-expenses/api` with bearer token via `expo-secure-store`
- **Animations**: react-native-reanimated 3, expo-linear-gradient
- **Icons**: `@expo/vector-icons` (Ionicons, MaterialIcons)

### Theme (`apps/mobile/lib/theme.ts`)
Light fintech theme — always import from here, never hardcode colors:
```ts
import { colors, shadow } from "../../lib/theme";
// colors.bg           #f5f5f7   app background
// colors.surface      #ffffff   cards
// colors.surface2     #eef1ff   totals / hover
// colors.primary      #6c47ff   brand violet
// colors.success      #00b896   teal
// colors.danger       #ff4060
// colors.warning      #ff9f0a
// colors.cards        [[from, to], ...]  gradient pairs for credit cards
```

### Mobile screens
- `app/(app)/dashboard.tsx` — home with credit cards, bank accounts, invoices
- `app/(app)/credit-cards/`, `bank-accounts/`, `transactions/`, `invoices/`
- `app/(app)/settings.tsx`
- `app/add-transaction.tsx`

## Tools & MCP Servers

**Always prefer these tools over manual approaches:**

**Chrome DevTools MCP** — Browser automation, UI testing, screenshots, network inspection. Always use instead of asking the user to test manually.

**Playwright MCP** — E2E tests (`npm run test:e2e` in `apps/web`). Always run `npm run dev` first.

**Context7 MCP** — Fetch up-to-date docs before implementing third-party features. Always call for:
- Better Auth (plugins, providers, session config)
- Prisma (schema, migrations, adapter APIs)
- Next.js (App Router, Server Actions, caching)
- Expo / React Native (SDK APIs, native modules)
- shadcn/ui, NativeWind, TanStack Query

**`frontend-design` skill** — Use for any UI work (new pages, redesigns, modals, dashboards). Triggers on: "make it look better", "redesign", "add a UI for..."
