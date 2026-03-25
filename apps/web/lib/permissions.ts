import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  if ((session.user as { role?: string }).role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}

export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

export function isAdminUser(
  session: { user?: { role?: string } } | null,
): boolean {
  return (session?.user as { role?: string })?.role === "admin";
}
