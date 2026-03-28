# Fixpenses — Expense Tracking Application

A full-stack expense tracking app built with **Next.js 16** (web) and **React Native + Expo** (iOS & Android), organized as a **Turborepo monorepo**.

## Repository Structure

```
simple_expenses/
├── apps/
│   ├── web/        Next.js 16 web app (App Router, Prisma, Better Auth)
│   └── mobile/     Expo SDK app (React Native, Expo Router, NativeWind)
├── packages/
│   ├── types/      Shared TypeScript types and Zod schemas
│   ├── utils/      Shared utilities (formatCurrency, date helpers, cn)
│   └── api/        REST API client (calls apps/web's /api/v1/ endpoints)
├── Dockerfile
└── docker-compose.yml
```

> **Currency:** 18 currencies supported, AED as default. See [CURRENCY.md](./docs/CURRENCY.md).

---

## Docker (Recommended for Production)

The multi-stage `Dockerfile` produces a minimal ~200 MB runtime image (Node 22 Alpine, standalone Next.js output, non-root user).

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+
- A running PostgreSQL instance (external — not included in the compose file)

### 1. Create the root `.env` file

All runtime secrets are read from `.env` at the repo root (picked up automatically by `docker compose`).

```bash
cp .env.example .env   # or create it manually
```

```env
# ── Required ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host:5432/fixpenses

BETTER_AUTH_SECRET=your-32-char-secret-here
BETTER_AUTH_URL=https://your-domain.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=smtp-password
EMAIL_FROM=noreply@example.com

# ── Optional OAuth ─────────────────────────────────────────────────────────────
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# ── Optional cron protection ───────────────────────────────────────────────────
CRON_SECRET=...
```

### 2. Run with Docker Compose

```bash
# Build the image and start the container
docker compose up --build -d

# View logs
docker compose logs -f web

# Stop the container
docker compose down
```

The app will be available at [http://localhost:3000](http://localhost:3000).  
Health check endpoint: `GET /api/v1/health`

### 3. Run database migrations

After the container is up, run Prisma migrations against your database:

```bash
docker compose exec web node -e "
const { execSync } = require('child_process');
execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: '/app/apps/web' });
"
```

Or run migrations from your local machine (with `DATABASE_URL` set):

```bash
cd apps/web && npx prisma migrate deploy
```

### Docker commands reference

```bash
# Build the image only (no start)
docker build -t fixpenses-web:latest .

# Run without Compose (pass env vars explicitly)
docker run -d --name fixpenses -p 3000:3000 --env-file .env fixpenses-web:latest

# Tail container logs
docker logs -f fixpenses

# Open a shell in the running container
docker exec -it fixpenses sh

# Stop and remove the container
docker stop fixpenses && docker rm fixpenses

# Remove the built image
docker rmi fixpenses-web:latest

# Rebuild from scratch (no cache)
docker compose build --no-cache
docker compose up -d
```

---

## Local Development

### Prerequisites

- Node.js 22+
- PostgreSQL (local or remote)

### Web App

```bash
# Install all dependencies (from repo root)
npm install

# Create env file
cp apps/web/.env.example apps/web/.env.local  # then fill in values

# Apply database migrations
cd apps/web && npx prisma migrate dev

# Start web development server (from repo root)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables (Web)

Create `apps/web/.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fixpenses

BETTER_AUTH_SECRET=your-32-char-secret-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@localhost

# Optional
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CRON_SECRET=...
```

### Prisma commands

```bash
cd apps/web

# Apply pending migrations (development)
npx prisma migrate dev --name <description>

# Apply migrations (production / CI)
npx prisma migrate deploy

# Regenerate the Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

---

## Mobile App (iOS & Android)

### Prerequisites

- Install [Expo Go](https://expo.dev/go) on your device (for quick testing)
- Or set up [EAS Build](https://docs.expo.dev/build/introduction/) for native builds
- The web app must be running and accessible from your device

### Getting Started

```bash
# Install all dependencies (from repo root)
npm install

# Start the Expo dev server
npm run dev:mobile

# or scan the QR code with Expo Go on your phone
```

### Environment Variables (Mobile)

Create `apps/mobile/.env.local`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000

# RevenueCat (optional — needed for in-app subscriptions)
EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_api_key
# EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key
# EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key
```

Replace `YOUR_LOCAL_IP` with your machine's local IP (e.g., `192.168.1.10`).  
Use `http://localhost:3000` only when running a simulator/emulator on the same machine.

### EAS Build (Native Builds)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build for both platforms
cd apps/mobile
eas build --platform all --profile preview
```

**Required GitHub Actions secret:** `EXPO_TOKEN` — generate at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens).

Update `EXPO_PUBLIC_API_URL` in `apps/mobile/eas.json` for each build profile before production builds.

---

## Monorepo Commands

```bash
# Start all apps in dev mode
npx turbo dev

# Build everything
npx turbo build

# Lint all workspaces
npx turbo lint

# Format all workspaces
npm run format

# Build only the web app
npx turbo build --filter=@simple-expenses/web

# Build only the mobile app
npx turbo build --filter=@simple-expenses/mobile
```

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/router/introduction)
- [NativeWind](https://www.nativewind.dev)
- [EAS Build](https://docs.expo.dev/build/introduction)
- [Better Auth](https://www.better-auth.com)
- [Prisma](https://www.prisma.io/docs)
- [Turborepo](https://turbo.build/repo/docs)
