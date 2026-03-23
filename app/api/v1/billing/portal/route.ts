import { getApiUser, api } from "@/lib/api-auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const BASE_URL = env.BETTER_AUTH_URL;

// POST /api/v1/billing/portal
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId)
    return api.badRequest("No billing account found. Please subscribe first.");

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${BASE_URL}/billing`,
  });

  return api.ok({ url: portalSession.url });
}
