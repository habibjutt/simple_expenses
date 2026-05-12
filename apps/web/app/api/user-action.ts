"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SUPPORTED_CURRENCIES } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { getUserPlanLimits } from "@/lib/subscription";

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

  const [user, planLimits] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingCompleted: true,
        preferredCurrency: true,
        billReminderDays: true,
        name: true,
        passwordChangedAt: true,
      },
    }),
    getUserPlanLimits(session.user.id),
  ]);

  if (!user) return null;
  return { ...user, planLimits };
}

export async function recordPasswordChanged() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.user.update({
    where: { id: session.user.id },
    data: { passwordChangedAt: new Date() },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateBillReminderDays(days: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const validOptions = [0, 1, 2, 3, 5, 7, 14];
  if (!validOptions.includes(days)) {
    return { error: "Invalid reminder days value" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { billReminderDays: days },
  });

  revalidatePath("/settings");
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

export async function deleteAccount(email: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Verify email matches the logged-in user
  if (session.user.email !== email) {
    return { error: "Email does not match your account." };
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
