import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins/bearer";
import { admin } from "better-auth/plugins/admin";
import { db } from "./db";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email";
import { env } from "./env";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // ── Extra user columns exposed on session.user ─────────────────
  user: {
    additionalFields: {
      preferredCurrency: { type: "string", defaultValue: "AED" },
      onboardingCompleted: { type: "boolean", defaultValue: false },
      subscriptionStatus: { type: "string", required: false },
    },
  },

  // ── Session ──────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh token once per day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5-minute client-side cache to cut DB round-trips
    },
  },

  // ── CSRF / open-redirect protection ─────────────────────────────
  trustedOrigins: [env.BETTER_AUTH_URL],

  // ── Cookie security ──────────────────────────────────────────────
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },

  // ── Rate limiting (stored in DB — survives serverless restarts) ──
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
    customRules: {
      // 5 attempts per 15 min in production; relaxed in development/test
      "/sign-in/email": {
        window: 900,
        max: process.env.NODE_ENV === "production" ? 5 : 100,
      },
      // 10 sign-ups per hour in production; relaxed in development/test
      "/sign-up/email": {
        window: 3600,
        max: process.env.NODE_ENV === "production" ? 10 : 100,
      },
      "/forget-password": { window: 3600, max: 5 },
      "/reset-password": { window: 3600, max: 5 },
      "/send-verification-email": { window: 3600, max: 5 },
    },
  },

  // ── Email + password ─────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 3600,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ to: user.email, url });
    },
  },

  // ── Email verification ───────────────────────────────────────────
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[auth] sendVerificationEmail hook called for ${user.email}`);
      await sendVerificationEmail({ to: user.email, url });
    },
  },

  // ── Account linking ──────────────────────────────────────────────
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github", "google", "credential"],
    },
  },

  // ── Social providers (only registered when credentials are set) ──
  socialProviders: {
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  plugins: [bearer(), admin()],
});
