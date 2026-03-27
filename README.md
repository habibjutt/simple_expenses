This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Simple Expenses — Expense Tracking Application

A comprehensive expense tracking application built with Next.js (web) and React Native + Expo (iOS & Android), organized as a Turborepo monorepo.

### Repository Structure

```
simple_expenses/
├── apps/
│   ├── web/        Next.js 16 web app (App Router, Prisma, Better Auth)
│   └── mobile/     Expo SDK app (React Native, Expo Router, NativeWind)
└── packages/
    ├── types/      Shared TypeScript types and Zod schemas
    ├── utils/      Shared utilities (formatCurrency, date helpers, cn)
    └── api/        REST API client (calls apps/web's /api/v1/ endpoints)
```

### Currency Configuration

This application supports 18 currencies with AED as default. See [CURRENCY.md](./docs/CURRENCY.md) for details.

---

## Web App

### Getting Started

```bash
# Install all dependencies (from repo root)
npm install

# Start web development server
npm run dev
# or from root with turbo:
npx turbo dev --filter=@simple-expenses/web
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Environment Variables (Web)

Create `apps/web/.env.local`:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
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
cd apps/mobile
npx expo start

# or scan the QR code with Expo Go on your phone
```

### Environment Variables (Mobile)

Create `apps/mobile/.env.local`:

```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000

# RevenueCat (optional — needed for in-app subscriptions)
# Use a single key for testing, or separate keys per platform in production
EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_api_key
# EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key
# EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key
```

Replace `YOUR_LOCAL_IP` with your machine's local IP (e.g., `192.168.1.10`).  
Use `http://localhost:3000` only if running in the same machine (simulator/emulator).

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

**Required secret in GitHub Actions:** `EXPO_TOKEN` — generate at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens).

Update the `EXPO_PUBLIC_API_URL` in `apps/mobile/eas.json` for each build profile before building for production.

---

## Monorepo Commands

```bash
# Run all apps in dev mode
npx turbo dev

# Build everything
npx turbo build

# Lint all workspaces
npx turbo lint

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
