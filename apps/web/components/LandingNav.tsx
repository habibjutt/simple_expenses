"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, Menu, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FEATURE_LINKS } from "@/lib/feature-links";

const navLinks = [
  { href: "/#pricing", label: "Pricing" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#1a9e5c] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm sm:text-base">
            Simple Expenses
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Features dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all">
                Features
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {FEATURE_LINKS.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link
                    href={href}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-[#1a9e5c]" />
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link
                  href="/features"
                  className="flex items-center gap-2 cursor-pointer font-medium text-[#1a9e5c]"
                >
                  View all features →
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-white border-white/30 hover:bg-white/10 hover:text-white"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-white text-[#1a9e5c] hover:bg-white/90 font-semibold shadow"
            >
              Get started
            </Button>
          </Link>
        </div>

        {/* Mobile: auth + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-white text-[#1a9e5c] hover:bg-white/90 font-semibold shadow text-xs px-3"
            >
              Get started
            </Button>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden border-t border-white/20 bg-[#158a4f]">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {/* Features section */}
            <button
              onClick={() => setFeaturesOpen((v) => !v)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all"
            >
              <span>Features</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${featuresOpen ? "rotate-180" : ""}`}
              />
            </button>
            {featuresOpen && (
              <div className="pl-4 flex flex-col gap-0.5">
                {FEATURE_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => {
                      setOpen(false);
                      setFeaturesOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                ))}
                <Link
                  href="/features"
                  onClick={() => {
                    setOpen(false);
                    setFeaturesOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all"
                >
                  View all features →
                </Link>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/20 mt-2 pt-3">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-white hover:bg-white/10 hover:text-white justify-start"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
