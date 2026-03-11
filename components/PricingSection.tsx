"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { createCheckoutSession } from "@/app/api/billing-action";
import { STRIPE_PRICES } from "@/lib/stripe";

const PLANS = {
  monthly: [
    {
      id: "starter",
      name: "Starter",
      price: "Free",
      priceLabel: "forever",
      description: "Perfect for getting started with personal finance tracking.",
      cta: "Start for free",
      href: "/signup",
      highlight: false,
      badge: null,
      features: [
        "2 credit cards",
        "2 bank accounts",
        "100 transactions / month",
        "Basic reports",
        "AED native formatting",
        "Email & GitHub sign in",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "AED 29",
      priceLabel: "/ month",
      description: "Unlock the full power of Smart Expenses for serious savers.",
      cta: "Start 14-day free trial",
      href: "/signup?plan=pro",
      highlight: true,
      badge: "Most Popular",
      features: [
        "Unlimited credit cards",
        "Unlimited bank accounts",
        "Unlimited transactions",
        "Advanced reports & charts",
        "Budget & spending limits",
        "Financial goals tracking",
        "Invoice management",
        "Installment tracking",
        "Dark mode",
        "Priority email support",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: "AED 79",
      priceLabel: "/ month",
      description: "For power users who need exports, advanced analytics and top support.",
      cta: "Get Premium",
      href: "/signup?plan=premium",
      highlight: false,
      badge: null,
      features: [
        "Everything in Pro",
        "CSV & PDF data export",
        "Advanced spending analytics",
        "Custom categories",
        "Recurring transaction templates",
        "WhatsApp & email reminders",
        "Dedicated account manager",
        "1-hour response SLA",
      ],
    },
  ],
  yearly: [
    {
      id: "starter",
      name: "Starter",
      price: "Free",
      priceLabel: "forever",
      description: "Perfect for getting started with personal finance tracking.",
      cta: "Start for free",
      href: "/signup",
      highlight: false,
      badge: null,
      features: [
        "2 credit cards",
        "2 bank accounts",
        "100 transactions / month",
        "Basic reports",
        "AED native formatting",
        "Email & GitHub sign in",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "AED 249",
      priceLabel: "/ year",
      description: "Unlock the full power of Smart Expenses for serious savers.",
      cta: "Start 14-day free trial",
      href: "/signup?plan=pro-yearly",
      highlight: true,
      badge: "Save AED 99",
      features: [
        "Unlimited credit cards",
        "Unlimited bank accounts",
        "Unlimited transactions",
        "Advanced reports & charts",
        "Budget & spending limits",
        "Financial goals tracking",
        "Invoice management",
        "Installment tracking",
        "Dark mode",
        "Priority email support",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: "AED 679",
      priceLabel: "/ year",
      description: "For power users who need exports, advanced analytics and top support.",
      cta: "Get Premium",
      href: "/signup?plan=premium-yearly",
      highlight: false,
      badge: "Save AED 269",
      features: [
        "Everything in Pro",
        "CSV & PDF data export",
        "Advanced spending analytics",
        "Custom categories",
        "Recurring transaction templates",
        "WhatsApp & email reminders",
        "Dedicated account manager",
        "1-hour response SLA",
      ],
    },
  ],
};

export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const plans = PLANS[billing];

  const handleProCta = async (planId: string) => {
    if (planId === "starter") return; // handled by Link
    if (!session) {
      router.push("/signup");
      return;
    }
    const priceId = billing === "monthly" ? STRIPE_PRICES.monthly : STRIPE_PRICES.yearly;
    setLoadingPlan(planId);
    try {
      const { url } = await createCheckoutSession(priceId);
      if (url) window.location.href = url;
    } catch {
      router.push("/billing");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="px-6 py-24 bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
            Plans that grow with you
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready. All prices in AED — no surprises.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "text-sm font-medium transition-colors px-4 py-2 rounded-full",
                billing === "monthly"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={cn(
                "relative text-sm font-medium transition-colors px-4 py-2 rounded-full",
                billing === "yearly"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              {billing === "monthly" && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  -28%
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col transition-all duration-200",
                plan.highlight
                  ? "bg-primary border-primary shadow-2xl shadow-primary/20 scale-[1.03] z-10"
                  : "bg-background border-border hover:shadow-lg hover:border-primary/30"
              )}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={cn(
                    "absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full shadow",
                    plan.highlight
                      ? "bg-white text-primary"
                      : "bg-amber-400 text-amber-900"
                  )}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  {plan.highlight && <Zap className="w-4 h-4 text-white/80" />}
                  <h3
                    className={cn(
                      "font-bold text-lg",
                      plan.highlight ? "text-white" : "text-foreground"
                    )}
                  >
                    {plan.name}
                  </h3>
                </div>
                <p
                  className={cn(
                    "text-sm mb-4",
                    plan.highlight ? "text-white/70" : "text-muted-foreground"
                  )}
                >
                  {plan.description}
                </p>
                <div className="flex items-end gap-1">
                  <span
                    className={cn(
                      "text-4xl font-extrabold",
                      plan.highlight ? "text-white" : "text-foreground"
                    )}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      "text-sm pb-1",
                      plan.highlight ? "text-white/60" : "text-muted-foreground"
                    )}
                  >
                    {plan.priceLabel}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={cn(
                        "w-4 h-4 mt-0.5 shrink-0",
                        plan.highlight ? "text-white/80" : "text-primary"
                      )}
                    />
                    <span className={plan.highlight ? "text-white/80" : "text-muted-foreground"}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.id === "starter" ? (
                <Link
                  href={plan.href}
                  className={cn(
                    "block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all",
                    plan.highlight
                      ? "bg-white text-primary hover:bg-white/90 shadow-lg"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleProCta(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-center transition-all disabled:opacity-70",
                    plan.highlight
                      ? "bg-white text-primary hover:bg-white/90 shadow-lg"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {loadingPlan === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          All plans include a 14-day free trial. No credit card required to start.
          Cancel anytime.
        </p>
      </div>
    </section>
  );
}
