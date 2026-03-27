"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SUPPORTED_CURRENCIES } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";

export async function updatePreferredCurrency(currency: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const isValid = SUPPORTED_CURRENCIES.some((c) => c.code === currency);
  if (!isValid) {
    return { error: "Invalid currency code" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { preferredCurrency: currency },
  });

  revalidatePath("/settings");
}

export async function getUserProfile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      onboardingCompleted: true,
      preferredCurrency: true,
      name: true,
    },
  });
  return user;
}

export async function completeOnboarding() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return {};
}

export async function deleteAccount(email: string, password: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Verify email matches the logged-in user
  if (session.user.email !== email) {
    return { error: "Email does not match your account." };
  }

  // Verify the user has a credential (email/password) account
  const credentialAccount = await db.account.findFirst({
    where: { userId: session.user.id, providerId: "credential" },
    select: { id: true },
  });
  if (!credentialAccount) {
    return {
      error:
        "Your account uses social login only. Password verification is not available.",
    };
  }

  // Verify password by attempting sign-in through Better Auth
  try {
    const signInResult = await auth.api.signInEmail({
      body: { email, password },
    });
    if (!signInResult?.token) {
      return { error: "Invalid password. Please try again." };
    }
  } catch {
    return { error: "Invalid password. Please try again." };
  }

  // Cancel active Stripe subscription if any
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeSubscriptionId: true, stripeCustomerId: true },
  });

  if (user?.stripeSubscriptionId) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (err) {
      console.error(
        "Failed to cancel Stripe subscription during account deletion:",
        err,
      );
    }
  }

  // Delete user — Prisma cascades will remove all related data
  await db.user.delete({ where: { id: session.user.id } });

  return { success: true };
}
