import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, BarChart3, Shield, Zap, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Simple Expenses</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Decorative background orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/4 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20">
            <Zap className="w-4 h-4" />
            Personal finance made simple
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Track every dirham,<br />
            <span className="text-primary">effortlessly</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Manage credit cards, bank accounts, and transactions in one place.
            Know exactly where your money goes — no spreadsheets needed.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button size="lg" className="h-12 px-8 text-base shadow-md" asChild>
              <Link href="/signup">Start for free</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">No credit card required · 100% private · Free forever</p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 border-t border-border px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything you need to manage your finances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: CreditCard,
                title: "Credit Card Tracking",
                desc: "Track balances, bill dates, payment due dates, and set spending limits for all your cards.",
              },
              {
                icon: Wallet,
                title: "Bank Accounts",
                desc: "Monitor multiple bank accounts with running balances updated automatically with each transaction.",
              },
              {
                icon: BarChart3,
                title: "Invoice Management",
                desc: "See upcoming bills at a glance, track paid invoices, and never miss a payment deadline.",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your data is encrypted and tied to your account only. Sign in with email or GitHub.",
              },
              {
                icon: Zap,
                title: "Installment Support",
                desc: "Split purchases across months with full installment tracking and per-month breakdowns.",
              },
              {
                icon: Globe,
                title: "AED Native",
                desc: "Built for UAE residents — all amounts displayed in AED with proper formatting.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-background border border-border rounded-xl p-6 space-y-3 hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-primary/5 border-t border-border text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Ready to take control?</h2>
          <p className="text-muted-foreground text-lg">
            Create your free account in seconds and start tracking your expenses today.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base shadow-md" asChild>
              <Link href="/signup">Create free account</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/login">Sign in →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Simple Expenses. All rights reserved.
      </footer>
    </div>
  );
}
