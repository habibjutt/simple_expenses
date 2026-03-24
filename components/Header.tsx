"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  ListOrdered,
  Building2,
  LogOut,
  BarChart2,
  Target,
  Tags,
  Settings,
  PiggyBank,
  Receipt,
  Shield,
  Lightbulb,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationsBell } from "./NotificationsBell";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ListOrdered },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/spending-limits", label: "Budgets", icon: Target },
  { href: "/goals", label: "Goals", icon: PiggyBank },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/manage-cards", label: "Cards", icon: CreditCard },
  { href: "/manage-accounts", label: "Accounts", icon: Building2 },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const userInitial = session?.user.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#1a9e5c] shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-0 px-4 md:px-6 h-14">
          {/* Logo + desktop nav */}
          <div className="flex items-center gap-1 md:gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm md:text-base text-white hidden sm:block">
                Simple Expenses
              </span>
            </Link>

            {session && (
              <nav className="hidden lg:flex items-center gap-0.5">
                {NAV_LINKS.map(({ href, label }) => {
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}

              </nav>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {isPending ? (
              <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
            ) : session ? (
              <>
                <ThemeToggle />
                <NotificationsBell />
                {/* Desktop user dropdown */}
                <div className="hidden md:flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/10 transition-colors group">
                        <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-xs">
                          {userInitial}
                        </div>
                        <span className="text-white/90 text-sm font-medium max-w-[120px] truncate hidden lg:block">
                          {session.user.name || session.user.email?.split("@")[0]}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-white/60 group-hover:text-white/90 transition-colors" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem disabled>
                        <span className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/billing" className="flex items-center gap-2 cursor-pointer">
                          <Receipt className="h-4 w-4" />
                          Billing
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/request-feature" className="flex items-center gap-2 cursor-pointer">
                          <Lightbulb className="h-4 w-4" />
                          Request a Feature
                        </Link>
                      </DropdownMenuItem>
                      {(session.user as { role?: string }).role === "admin" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-[#4f6ef7] focus:text-[#4f6ef7]">
                              <Shield className="h-4 w-4" />
                              Admin Panel
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  className="lg:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white border-white/30 hover:bg-white/10">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-white text-[#1a9e5c] hover:bg-white/90 font-semibold">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && session && (
          <div className="lg:hidden border-t border-white/10 bg-[#158a4f]">
            <div className="max-w-7xl mx-auto px-4 py-2 space-y-0.5">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}

              <div className="border-t border-white/10 pt-2 mt-1 pb-1">
                <p className="px-3 text-xs mb-1 text-white/40 truncate">{session.user.email}</p>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  Settings
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Receipt className="h-4 w-4 shrink-0" />
                  Billing
                </Link>
                <Link
                  href="/request-feature"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  Request a Feature
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Logout
                </button>
                {(session.user as { role?: string }).role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: "#a5b4ff" }}
                  >
                    <Shield className="h-4 w-4 shrink-0" style={{ color: "#4f6ef7" }} />
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

    </>
  );
};

export default Header;
