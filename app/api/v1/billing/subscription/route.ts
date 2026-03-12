import { getApiUser, api } from "@/lib/api-auth";
import { getSubscriptionInfo } from "@/lib/subscription";

// GET /api/v1/billing/subscription
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const subscription = await getSubscriptionInfo(user.id);
  return api.ok(subscription);
}
