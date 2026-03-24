"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SUPPORTED_CURRENCIES } from "@/lib/utils";

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
