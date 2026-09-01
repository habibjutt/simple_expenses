"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Zap, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { createCheckoutSession, type PlanKey } from "@/app/api/billing-action";

const PLANS: Record<
  "monthly" | "yearly",
  Array<{
    id: string;
    name: string;
    price: string;
    priceLabel: string;
    description: string;
    cta: string;
    href: string;
    highlight: boolean;
    badge: string | null;
    planKey?: PlanKey;
    features: string[];
  }>
> = {
  monthly: [
    {
      id: "starter",
      name: "Starter",
      price: "Free",
      priceLabel: "forever",
      description:
        "Perfect for getting started with personal finance tracking.",
      cta: "Start for free",
      href: "/signup",
      highlight: false,
      badge: null,
      features: [
        "1 credit card",
        "1 bank account",
        "100 transactions / month",
        "Basic reports",
        "AED native formatting",
        "Email & GitHub sign in",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "AED 9.99",
      priceLabel: "/ month",
      description:
        "Unlock the full power of Smart Expenses for serious savers.",
      cta: "Start 14-day free trial",
      href: "/signup?plan=pro",
      highlight: true,
      badge: "Most Popular",
      planKey: "pro-monthly",
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
      price: "AED 29",
      priceLabel: "/ month",
      description:
        "For power users who need exports, advanced analytics and top support.",
      cta: "Get Premium",
      href: "/signup?plan=premium",
      highlight: false,
      badge: null,
      planKey: "premium-monthly",
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
      description:
        "Perfect for getting started with personal finance tracking.",
      cta: "Start for free",
      href: "/signup",
      highlight: false,
      badge: null,
      features: [
        "1 credit card",
        "1 bank account",
        "100 transactions / month",
        "Basic reports",
        "AED native formatting",
        "Email & GitHub sign in",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "AED 99",
      priceLabel: "/ year",
      description:
        "Unlock the full power of Smart Expenses for serious savers.",
      cta: "Start 14-day free trial",
      href: "/signup?plan=pro-yearly",
      highlight: true,
      badge: "Save AED 20.88",
      planKey: "pro-yearly",
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
      price: "AED 299",
      priceLabel: "/ year",
      description:
        "For power users who need exports, advanced analytics and top support.",
      cta: "Get Premium",
      href: "/signup?plan=premium-yearly",
      highlight: false,
      badge: "Save AED 49",
      planKey: "premium-yearly",
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
    if (planId === "starter") return;
    if (!session) {
      router.push("/signup");
      return;
    }
    const plan = plans.find((p) => p.id === planId);
    const planKey = plan?.planKey;
    if (!planKey) {
      router.push("/billing");
      return;
    }
    setLoadingPlan(planId);
    try {
      const { url } = await createCheckoutSession(planKey);
      if (url) window.location.href = url;
    } catch {
      router.push("/billing");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-t border-[#1a9e5c]/20"
      style={{
        background:
          "linear-gradient(160deg, #071812 0%, #0b2218 40%, #091a14 70%, #071610 100%)",
      }}
    >
      {/* Atmospheric orbs */}
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(26,158,92,0.18) 0%, transparent 70%)",
          animation: "se-orb-drift 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(26,158,92,0.12) 0%, transparent 70%)",
          animation: "se-orb-drift 14s ease-in-out 5s infinite reverse",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(26,158,92,0.08) 0%, transparent 70%)",
          animation: "se-orb-drift 22s ease-in-out 2s infinite",
        }}
      />
      {/* Dot grid overlay */}
      <div className="absolute inset-0 se-dot-grid opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-6 sm:pt-8 pb-6 sm:pb-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 bg-[#1a9e5c]/20 text-[#22d47a] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#1a9e5c]/30">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">
            Plans That Grow With You
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            No hidden tiers, no &ldquo;contact sales&rdquo; for basic
            features — just the best expense tracker in the UAE. Start free,
            see the value, upgrade only if you need more. All prices in AED,
            no surprises.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="flex items-center bg-white/8 border border-white/15 rounded-full p-1 gap-1">
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300",
                  billing === "monthly"
                    ? "bg-[#1a9e5c] text-white shadow-lg shadow-[#1a9e5c]/40"
                    : "text-white/50 hover:text-white/80",
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={cn(
                  "relative text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300",
                  billing === "yearly"
                    ? "bg-[#1a9e5c] text-white shadow-lg shadow-[#1a9e5c]/40"
                    : "text-white/50 hover:text-white/80",
                )}
              >
                Yearly
                {billing === "monthly" && (
                  <span className="absolute -top-2.5 -right-2 bg-amber-400 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap shadow">
                    −28%
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-6">
          {plans.map((plan) => {
            if (plan.highlight) {
              return (
                <div
                  key={plan.id}
                  className="relative rounded-2xl p-px se-pro-glow-border scale-[1.03] z-10"
                  style={{
                    boxShadow:
                      "0 0 80px rgba(26,158,92,0.35), 0 20px 60px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* Most Popular badge */}
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#1a9e5c] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#1a9e5c]/40 whitespace-nowrap"
                    style={{
                      animation: "se-badge-bounce 3s ease-in-out infinite",
                    }}
                  >
                    <Zap className="w-3 h-3" />
                    {plan.badge}
                  </div>

                  <div
                    className="relative rounded-[calc(1rem-1px)] p-8 flex flex-col h-full overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #0e2218 0%, #162e1e 50%, #0e2218 100%)",
                    }}
                  >
                    {/* Inner shimmer overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-30"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(26,158,92,0.3) 0%, transparent 50%, rgba(26,158,92,0.2) 100%)",
                        animation: "se-gradient-shift 6s ease infinite",
                        backgroundSize: "200% 200%",
                      }}
                    />

                    <div className="relative mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-white">
                          {plan.name}
                        </h3>
                      </div>
                      <p className="text-sm mb-4 text-white/60">
                        {plan.description}
                      </p>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-extrabold text-white">
                          {plan.price}
                        </span>
                        <span className="text-sm pb-1 text-white/50">
                          {plan.priceLabel}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1 relative">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <div className="w-4 h-4 mt-0.5 shrink-0 rounded-full bg-[#1a9e5c]/30 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-[#22d47a]" />
                          </div>
                          <span className="text-white/75">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.id === "starter" ? (
                      <Link
                        href={plan.href}
                        className="relative block w-full py-3.5 rounded-xl font-bold text-sm text-center text-[#1a9e5c] overflow-hidden transition-all hover:opacity-90"
                        style={{
                          background:
                            "linear-gradient(90deg, #ffffff 0%, #f0fdf4 50%, #ffffff 100%)",
                          backgroundSize: "200% auto",
                          animation: "se-shimmer 3s linear infinite",
                        }}
                      >
                        {plan.cta}
                        <ArrowRight className="inline ml-1.5 w-4 h-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleProCta(plan.id)}
                        disabled={loadingPlan === plan.id}
                        className="relative flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm text-center text-[#1a9e5c] transition-all hover:opacity-90 disabled:opacity-60 overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(90deg, #ffffff 0%, #f0fdf4 50%, #ffffff 100%)",
                          backgroundSize: "200% auto",
                          animation: "se-shimmer 3s linear infinite",
                        }}
                      >
                        {loadingPlan === plan.id && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {plan.cta}
                        {!loadingPlan && <ArrowRight className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            // Non-highlighted cards (Starter, Premium)
            return (
              <div
                key={plan.id}
                className="relative rounded-2xl border border-white/10 p-8 flex flex-col hover:border-[#1a9e5c]/40 hover:shadow-[0_0_40px_rgba(26,158,92,0.12)] transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Badge for premium yearly */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-bold text-lg text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm mb-4 text-white/50">
                    {plan.description}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm pb-1 text-white/40">
                      {plan.priceLabel}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#1a9e5c]" />
                      <span className="text-white/60">{feat}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === "starter" ? (
                  <Link
                    href={plan.href}
                    className="block w-full py-3.5 rounded-xl font-semibold text-sm text-center bg-[#1a9e5c] text-white hover:bg-[#1a9e5c]/90 transition-all hover:shadow-lg hover:shadow-[#1a9e5c]/30"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleProCta(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm text-center bg-[#1a9e5c] text-white hover:bg-[#1a9e5c]/90 transition-all hover:shadow-lg hover:shadow-[#1a9e5c]/30 disabled:opacity-70"
                  >
                    {loadingPlan === plan.id && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {plan.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-white/35 mt-10">
          All plans include a 14-day free trial. No credit card required to
          start. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
