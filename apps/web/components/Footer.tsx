"use client";

import React from "react";
import {
  LayoutDashboard,
  ListOrdered,
  BarChart2,
  Target,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ListOrdered },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/spending-limits", label: "Budgets", icon: Target },
  { href: "/manage-cards", label: "Cards", icon: CreditCard },
];

const Footer = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-white border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 h-16">
        {FOOTER_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                isActive
                  ? "text-[#1a9e5c]"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span
                className={cn(
                  "text-[9px] font-semibold tracking-wide uppercase",
                  isActive && "text-[#1a9e5c]",
                )}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#1a9e5c] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Footer;
