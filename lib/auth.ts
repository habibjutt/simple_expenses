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
      "/sign-in/email":            { window: 60, max: 5 },
      "/sign-up/email":            { window: 60, max: 3 },
      "/forget-password":          { window: 60, max: 3 },
      "/reset-password":           { window: 60, max: 5 },
      "/send-verification-email":  { window: 60, max: 3 },
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
      await sendVerificationEmail({ to: user.email, url });
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
  },

  plugins: [bearer(), admin()],
});
