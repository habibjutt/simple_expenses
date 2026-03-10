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

Supported: email/password and GitHub OAuth. Env vars required: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.

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
- All monetary values are in **AED (UAE Dirham)**
- Use `formatCurrency(amount)` from `@/lib/utils` for display — it uses `Intl.NumberFormat` with `currency: "AED"`

**Path alias:** `@/` maps to the repository root.
