"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Flag,
  ScrollText,
  Shield,
  LogOut,
  ChevronRight,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/admin/flags", label: "Feature Flags", icon: Flag },
  { href: "/admin/logs", label: "Audit Logs", icon: ScrollText },
];

export default function AdminSidebar({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initial = userName?.charAt(0)?.toUpperCase() ?? userEmail.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  function SidebarContent({ onNav }: { onNav?: () => void }) {
    return (
      <>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "#1a2d4a" }}>
          <Link href="/admin" className="flex items-center gap-2.5 group" onClick={onNav}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #4f6ef7, #6c47ff)" }}
            >
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-none">Admin Panel</p>
              <p className="mt-0.5 text-[10px]" style={{ color: "#4f6ef7" }}>
                Simple Expenses
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#3d5a80" }}>
            Navigation
          </p>
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNav}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer",
                  isActive ? "text-white" : "hover:text-white"
                )}
                style={
                  isActive
                    ? { background: "rgba(79,110,247,0.15)", color: "#a5b4ff" }
                    : { color: "#64748b" }
                }
              >
                <Icon
                  className="w-4 h-4 shrink-0 transition-colors"
                  style={{ color: isActive ? "#4f6ef7" : undefined }}
                />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: "#4f6ef7" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Status strip */}
        <div
          className="mx-3 mb-3 px-3 py-2 rounded-lg flex items-center gap-2"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
          <span className="text-xs font-medium" style={{ color: "#10b981" }}>
            System Operational
          </span>
        </div>

        {/* User footer */}
        <div className="border-t p-3" style={{ borderColor: "#1a2d4a" }}>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #4f6ef7, #6c47ff)" }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {userName || "Admin"}
              </p>
              <p className="text-[10px] truncate" style={{ color: "#64748b" }}>
                {userEmail}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors mb-1 cursor-pointer"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Back to App
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside
        className="hidden lg:flex w-60 shrink-0 flex-col border-r h-screen sticky top-0"
        style={{ background: "#0c1628", borderColor: "#1a2d4a" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b"
        style={{ background: "#0c1628", borderColor: "#1a2d4a" }}
      >
        <Link href="/admin" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4f6ef7, #6c47ff)" }}
          >
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white text-sm font-bold">Admin Panel</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
          style={{ color: "#94a3b8" }}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="relative flex flex-col w-72 h-full border-r"
            style={{ background: "#0c1628", borderColor: "#1a2d4a" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
              style={{ color: "#64748b" }}
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
