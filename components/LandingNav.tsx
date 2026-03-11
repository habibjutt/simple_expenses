"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#1a9e5c] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm sm:text-base">Simple Expenses</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
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
              className="text-white border-white/30 hover:bg-white/10"
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
                  className="w-full text-white hover:bg-white/10 justify-start"
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
