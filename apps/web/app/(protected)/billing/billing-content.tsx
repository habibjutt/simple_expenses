"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  createCheckoutSession,
  createPortalSession,
  getCurrentSubscription,
  syncSubscriptionAfterCheckout,
  type PlanKey,
} from "@/app/api/billing-action";
import type { SubscriptionInfo } from "@/lib/subscription";
import {
  Check,
  Zap,
  CreditCard,
  BarChart2,
  Target,
  Tags,
  Loader2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: {
      label: "Active",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    trialing: {
      label: "Free Trial",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    past_due: {
      label: "Past Due",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    canceled: {
      label: "Canceled",
      className:
        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    expired: {
      label: "Expired",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    incomplete: {
      label: "Incomplete",
      className: "bg-orange-100 text-orange-700",
    },
  };
  const { label, className } = map[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
}

const PLANS: Array<{
  tier: "pro" | "premium";
  name: string;
  monthly: { price: string; planKey: PlanKey };
  yearly: { price: string; planKey: PlanKey; perMonth: string };
  description: string;
  highlight: boolean;
  badge?: string;
  features: Array<{ icon: React.ElementType; text: string }>;
}> = [
  {
    tier: "pro",
    name: "Fixpenses Pro",
    monthly: { price: "AED 29", planKey: "pro-monthly" },
    yearly: { price: "AED 249", planKey: "pro-yearly", perMonth: "AED 20.75/mo" },
    description: "Everything you need to track your finances",
    highlight: true,
    badge: "Most Popular",
    features: [
      { icon: CreditCard, text: "Unlimited credit cards & bank accounts" },
      { icon: BarChart2, text: "Advanced reports & analytics" },
      { icon: Target, text: "Spending limits & budgets" },
      { icon: Tags, text: "Custom categories" },
      { icon: Zap, text: "Savings goals tracking" },
    ],
  },
  {
    tier: "premium",
    name: "Fixpenses Premium",
    monthly: { price: "AED 79", planKey: "premium-monthly" },
    yearly: { price: "AED 679", planKey: "premium-yearly", perMonth: "AED 56.58/mo" },
    description: "Everything in Pro plus exports & priority support",
    highlight: false,
    features: [
      { icon: CreditCard, text: "Everything in Pro" },
      { icon: FileDown, text: "CSV & PDF data export" },
      { icon: BarChart2, text: "Advanced spending analytics" },
      { icon: Tags, text: "Recurring transaction templates" },
      { icon: Zap, text: "Dedicated support & 1-hour SLA" },
    ],
  },
];

export default function BillingContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const successParam = searchParams.get("success");
  const canceledParam = searchParams.get("canceled");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      const load = async () => {
        if (successParam === "true") {
          await syncSubscriptionAfterCheckout();
        }
        const info = await getCurrentSubscription();
        setSubscription(info);
        setLoading(false);
      };
      load();
    }
  }, [session, successParam]);

  const handleSubscribe = async (planKey: PlanKey) => {
    setCheckoutLoading(planKey);
    try {
      const { url } = await createCheckoutSession(planKey);
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toast.error("Could not open billing portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  const hasStripeSubscription = subscription?.hasStripeSubscription;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {successParam === "true" && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Subscription activated! Welcome to Fixpenses Pro.
            </p>
          </div>
        )}
        {canceledParam === "true" && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Checkout was canceled. You can subscribe anytime below.
            </p>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your Fixpenses subscription.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-card p-6 mb-8 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              Loading subscription status…
            </span>
          </div>
        ) : subscription ? (
          <div className="rounded-2xl border bg-card p-6 mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current plan</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">Fixpenses Pro</span>
                  <StatusBadge status={subscription.status} />
                </div>
              </div>
              {hasStripeSubscription && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="shrink-0"
                >
                  {portalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Manage Billing
                </Button>
              )}
            </div>

            {subscription.status === "trialing" && !hasStripeSubscription && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-semibold">{subscription.daysLeftInTrial} days</span>{" "}
                  remaining in your free trial. Subscribe now to keep access after it ends.
                </p>
              </div>
            )}
            {subscription.status === "trialing" && hasStripeSubscription && subscription.trialEndsAt && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Trial ends on{" "}
                  <span className="font-semibold">
                    {subscription.trialEndsAt.toLocaleDateString("en-AE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  . You won&apos;t be charged until then.
                </p>
              </div>
            )}
            {subscription.status === "active" && subscription.currentPeriodEnd && (
              <p className="mt-3 text-sm text-muted-foreground">
                Next billing date:{" "}
                <span className="font-medium text-foreground">
                  {subscription.currentPeriodEnd.toLocaleDateString("en-AE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            )}
            {subscription.status === "past_due" && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Your last payment failed. Please update your payment method to keep access.
                </p>
              </div>
            )}
            {subscription.status === "expired" && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-300">
                  Your free trial has ended. Subscribe below to regain full access.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {!hasStripeSubscription && (
          <>
            <Separator className="mb-8" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1">Choose a plan</h2>
              <p className="text-muted-foreground text-sm">
                Full access to every feature. No hidden fees.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-muted rounded-full p-1 w-fit mb-8">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  billingPeriod === "monthly"
                    ? "bg-white dark:bg-zinc-800 shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  billingPeriod === "yearly"
                    ? "bg-white dark:bg-zinc-800 shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Yearly
                <Badge className="bg-[#1a9e5c] text-white text-[10px] px-1.5 py-0 h-4">
                  Save 28%
                </Badge>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PLANS.map((plan) => {
                const pricing = billingPeriod === "monthly" ? plan.monthly : plan.yearly;
                const isLoading = checkoutLoading === pricing.planKey;
                const btnLabel =
                  subscription?.status === "trialing" && !hasStripeSubscription
                    ? "Subscribe with Free Trial"
                    : "Subscribe Now";

                return (
                  <div
                    key={plan.tier}
                    className={cn(
                      "rounded-2xl border-2 bg-card p-6 relative flex flex-col",
                      plan.highlight ? "border-[#1a9e5c]" : "border-border",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-6">
                        <Badge className="bg-[#1a9e5c] text-white px-3 py-1">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                        <p className="text-muted-foreground text-sm mt-0.5">
                          {plan.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-3xl font-bold">{pricing.price}</div>
                        <div className="text-xs text-muted-foreground">
                          {billingPeriod === "monthly"
                            ? "per month"
                            : `per year (${"perMonth" in pricing ? pricing.perMonth : ""})`}
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-center gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3 text-[#1a9e5c]" />
                          </div>
                          {text}
                        </li>
                      ))}
                    </ul>

                    {subscription?.status === "trialing" && !hasStripeSubscription && (
                      <p className="text-xs text-muted-foreground mb-3 text-center">
                        Your remaining {subscription.daysLeftInTrial}-day trial carries
                        over — you won&apos;t be charged until it ends.
                      </p>
                    )}

                    <Button
                      className={cn(
                        "w-full font-semibold h-11",
                        plan.highlight ? "bg-[#1a9e5c] hover:bg-[#158a4f] text-white" : "",
                      )}
                      variant={plan.highlight ? "default" : "outline"}
                      onClick={() => handleSubscribe(pricing.planKey)}
                      disabled={!!checkoutLoading}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {btnLabel}
                    </Button>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Secure payment via Stripe · Cancel anytime
            </p>
          </>
        )}
      </div>
    </main>
  );
}
