import Link from "next/link";
import {
  CreditCard,
  Mail,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";

const FOOTER_LINKS = {
  product: [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#faq", label: "FAQ" },
    { href: "/#testimonials", label: "Testimonials" },
  ],
  account: [
    { href: "/login", label: "Sign In" },
    { href: "/signup", label: "Create Free Account" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  company: [
    { href: "/contact", label: "Contact Us" },
    { href: "/request-feature", label: "Request a Feature" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="bg-[#0f1f17] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1a9e5c] flex items-center justify-center shadow-lg">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Fixpenses</span>
            </Link>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              The smartest way for UAE residents to track every dirham across
              credit cards, bank accounts, and invoices.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:hello@simpleexpenses.ae"
                className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                hello@simpleexpenses.ae
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Dubai, United Arab Emirates 🇦🇪</span>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="#"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:bg-[#1a9e5c] hover:text-white transition-all"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:bg-[#1a9e5c] hover:text-white transition-all"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:bg-[#1a9e5c] hover:text-white transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-5">
              Product
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-5">
              Account
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-5">
              Company &amp; Legal
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Fixpenses. All rights reserved.
            Made with ❤️ in UAE.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-white/35 hover:text-white/70 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/35 hover:text-white/70 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-xs text-white/35 hover:text-white/70 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/request-feature"
              className="text-xs text-white/35 hover:text-white/70 transition-colors"
            >
              Request a Feature
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
