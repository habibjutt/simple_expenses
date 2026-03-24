# Copilot Instructions

## Commands

```bash
npm run dev          # Start development server
npm run build        # prisma generate && next build
npm run lint         # ESLint
npm run format       # Prettier write
npm run format:check # Prettier check
```

No test suite is configured.

## Architecture

Next.js 16 App Router application for expense tracking (credit cards, bank accounts, transactions, invoices).

**Backend operations use Next.js Server Actions, not API routes.** Actions live in `app/api/*-action.ts` and are called directly from client components. The only true API route is `app/api/auth/[...all]/route.ts` (Better Auth catch-all).

**Data flow:**
- Pages/components call server actions from `app/api/`
- Server actions use the Prisma client from `lib/db.ts`
- Auth state is accessed via `lib/auth.ts` (server) or `lib/auth-client.ts` (client)

## Database

- **PostgreSQL** via Prisma v7 with the `@prisma/adapter-pg` driver adapter
- Prisma client is generated to `generated/prisma/` (not the default location) — import from `@/generated/prisma/client`
- Run `prisma generate` before build (already wired into `npm run build` and `postinstall`)

**Schema change workflow — always follow this order, no exceptions:**
1. Edit `prisma/schema.prisma`
2. `npx prisma migrate dev --name <descriptive_name>` — creates a migration file in `prisma/migrations/` and applies it
3. `npx prisma generate` — regenerates the Prisma client

**Never use `prisma db push` for schema changes.** `db push` bypasses the migration history, causes schema drift, and breaks `prisma migrate deploy` in production. Only use `db push` in a throw-away local environment when you explicitly want to discard migration history.

**Key models:**
- `credit_card` — name, bill_date, payment_date, card_limit, available_balance
- `bank_account` — initial_balance, current_balance
- `transaction` — linked to credit_card or bank_account; supports installments (installment_count, installment_value)
- `invoice` — linked to credit_card; tracks bill period, payment status, paid amounts
- Better Auth models: `user`, `session`, `account`, `verification`

## Authentication

Uses **Better Auth** (`lib/auth.ts` server / `lib/auth-client.ts` client).

```ts
// Server-side (in Server Components or actions)
import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: await headers() });

// Client-side
import { signIn, signOut, useSession } from "@/lib/auth-client";
```

Supported: email/password, GitHub OAuth, and Google OAuth. Env vars required: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

## Conventions

**File naming:**
- React components: PascalCase (`Header.tsx`, `CreditCardModal.tsx`)
- Feature files: kebab-case (`credit-card-action.ts`, `login-form.tsx`)
- Modal components follow the pattern `*-modal.tsx`; form components follow `*-form.tsx`

**UI:**
- shadcn/ui components (New York style) live in `components/ui/` — do not hand-edit these
- Custom/feature components live directly in `components/`
- Tailwind CSS v4; use the `cn()` utility from `@/lib/utils` for conditional classes

**Currency:**
- The app is **multi-currency**. AED is the default but users can set a preferred currency per card/account.
- Use `formatCurrency(amount, currency?)` from `@/lib/utils` — second arg is an ISO 4217 code (default: `"AED"`). It uses `Intl.NumberFormat` with the correct locale per currency via `CURRENCY_LOCALE_MAP`.
- Use the `CurrencyCode` type (from `@/lib/utils`) for currency code values — it is derived from `SUPPORTED_CURRENCIES` (18 currencies: AED, USD, EUR, GBP, SAR, KWD, BHD, OMR, QAR, INR, PKR, EGP, CAD, AUD, JPY, CHF, CNY, SGD).
- Never hardcode `"AED"` in display logic — always pass the currency from the model or user preference.

**Path alias:** `@/` maps to the repository root.

## Tools & MCP Servers

**Always prefer these tools over manual approaches:**

**Chrome DevTools MCP** — Use for browser automation, testing UI flows, taking screenshots, inspecting network requests, and verifying changes in the running app. Always use this instead of asking the user to manually test in the browser.
- Navigate pages, click elements, fill forms, take screenshots
- Check console errors and network responses after UI changes
- Verify OAuth flows, redirects, and auth state

**Playwright MCP** — Use for writing and running end-to-end tests, automating multi-step user flows, and regression testing. Prefer over manual testing for repeatable scenarios.
- Use the `webapp-testing` skill to interact with the local dev server
- Always run `npm run dev` first and confirm the server is up before running Playwright tests

**Context7 MCP** — Use to fetch up-to-date library documentation before implementing features with third-party packages. Always call Context7 when working with:
- Better Auth (auth configuration, plugins, providers)
- Prisma (schema syntax, migrations, adapter APIs)
- Next.js (App Router, Server Actions, caching)
- shadcn/ui (component APIs and variants)
- Any package where you are unsure of the current API

**`frontend-design` skill** — Use whenever building or modifying UI components, pages, or layouts. This skill produces high-quality, production-grade frontend code. Trigger it for:
- New pages or page sections
- Component redesigns or visual improvements
- Landing pages, dashboards, modals, forms
- Any task described as "make it look better", "redesign", or "add a UI for..."
