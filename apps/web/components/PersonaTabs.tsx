"use client";

import { useState } from "react";
import { Users, Briefcase, Store, Calculator, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Persona {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

const PERSONAS: Persona[] = [
  {
    id: "individuals",
    label: "Individuals & Families",
    icon: Users,
    desc: "Track your own spending, or share a dashboard with your partner so household expenses stop living in two separate memories. See who paid for what, what's left in the monthly budget, and what you're both saving toward — all without a shared spreadsheet someone forgets to update.",
  },
  {
    id: "freelancers",
    label: "Freelancers",
    icon: Briefcase,
    desc: "Income that arrives on no fixed schedule makes budgeting harder, not impossible. Log client payments as they land, separate business costs from personal ones, and know exactly what you've earned this month versus what you've spent — no accountant required for the day-to-day view.",
  },
  {
    id: "small-business",
    label: "Small Businesses",
    icon: Store,
    desc: "Keep operating expenses visible without opening a full accounting platform for it. Track recurring costs, monitor spending against a monthly ceiling, and catch a subscription you forgot to cancel before it drains the account.",
  },
  {
    id: "finance-teams",
    label: "Finance & Accounting Teams",
    icon: Calculator,
    desc: "Get a real-time view of spending across accounts without waiting on a reconciliation cycle. Pull reports when you need them, flag unusual activity as it happens, and hand off clean data instead of a pile of receipts at month's end.",
  },
];

export default function PersonaTabs() {
  const [activeId, setActiveId] = useState(PERSONAS[0].id);
  const active = PERSONAS.find((p) => p.id === activeId) ?? PERSONAS[0];
  const ActiveIcon = active.icon;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Who uses Fixpenses"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {PERSONAS.map(({ id, label, icon: Icon }) => {
          const isActive = id === activeId;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-300",
                isActive
                  ? "bg-[#1a9e5c] text-white border-[#1a9e5c] shadow-lg shadow-[#1a9e5c]/30"
                  : "bg-background text-muted-foreground border-border hover:border-[#1a9e5c]/40 hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 bg-background border border-border rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center">
            <ActiveIcon className="w-6 h-6 text-[#1a9e5c]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              {active.label}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {active.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
