import Link from "next/link";
import { CreditCard, FileText, CalendarClock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";

export const metadata = {
  title: "Credit Card Management – Simple Expenses",
  description:
    "Track balances, due dates, payment dates, and invoices for all your credit cards in one clean dashboard.",
};

const HIGHLIGHTS = [
  "Add unlimited credit cards with custom names",
  "Track available balance and credit limit",
  "Bill date and payment date reminders",
  "Automatic invoice generation per billing cycle",
  "View all transactions per card",
  "Installment tracking — split large purchases across months",
];

export default function CreditCardsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#1a9e5c]/10 flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7 text-[#1a9e5c]" />
            </div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              Feature
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Credit Card Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Juggling multiple credit cards in the UAE? Keep every card&apos;s
              balance, due date, and billing cycle in perfect order — all in one
              place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white font-semibold shadow-lg shadow-[#1a9e5c]/20 w-full sm:w-auto"
                >
                  Add your cards <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Every card, perfectly organised
              </h2>
              <ul className="space-y-3">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1a9e5c] shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: CalendarClock,
                  title: "Payment reminders",
                  desc: "Never miss a due date. Track bill and payment dates for every card at a glance.",
                },
                {
                  icon: FileText,
                  title: "Invoice history",
                  desc: "Automatically generated invoices for each billing cycle, stored forever.",
                },
                {
                  icon: CreditCard,
                  title: "Balance tracking",
                  desc: "Know your available balance and utilisation percentage for each card instantly.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-4 bg-background border border-border rounded-2xl p-5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#1a9e5c]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 text-center">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-sm text-[#1a9e5c] hover:underline font-medium"
          >
            ← Back to all features
          </Link>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
