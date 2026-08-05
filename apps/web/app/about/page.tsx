import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CreditCard,
  Globe,
  Landmark,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Receipt,
  ServerOff,
  ShieldCheck,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Fixpenses is personal finance management software built for UAE residents — why we created it, who it is for, and our privacy-first approach to your financial data.",
  keywords: [
    "about Fixpenses",
    "personal finance management software UAE",
    "personal finance software UAE",
    "UAE expense tracker company",
    "privacy-first finance app UAE",
  ],
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About Us | Fixpenses",
    description:
      "Why we built personal finance management software for UAE residents, and how we keep your financial data private.",
    url: `${SITE_URL}/about`,
  },
};

const AUDIENCE = [
  {
    icon: Globe,
    title: "Expats building a life here",
    description:
      "Juggling a salary in AED, rent cheques, remittances home, and a credit card or two. Fixpenses keeps all of it in one place.",
  },
  {
    icon: Users,
    title: "Families managing a shared budget",
    description:
      "Groceries, school fees, DEWA, Salik and nursery costs tracked against a monthly limit, so nobody is guessing where the money went.",
  },
  {
    icon: CreditCard,
    title: "Anyone paying in installments",
    description:
      "Buy-now-pay-later plans and 0% card installments are everywhere in the UAE. We track what is left to pay, not just what you spent today.",
  },
  {
    icon: Building2,
    title: "Freelancers and small business owners",
    description:
      "Separate personal and work spending, keep invoices attached to the right card, and see a clean picture at the end of the month.",
  },
];

const BENEFITS = [
  {
    icon: Wallet,
    title: "AED first, multi-currency ready",
    description:
      "Amounts are shown in dirhams by default, with support for the other currencies you actually hold.",
  },
  {
    icon: CreditCard,
    title: "Credit cards you can actually follow",
    description:
      "Statement periods, due dates, and installment plans tracked per card so a payment never quietly slips.",
  },
  {
    icon: Landmark,
    title: "Every account in one view",
    description:
      "Bank accounts, cash, and cards side by side — the full picture instead of four different banking apps.",
  },
  {
    icon: Receipt,
    title: "Bills and invoices in context",
    description:
      "Recurring bills and invoices linked to the card that pays them, so renewals stop being a surprise.",
  },
  {
    icon: Target,
    title: "Limits and goals that fit real life",
    description:
      "Set spending limits per category and save toward a goal — a visa renewal, a flight home, a deposit.",
  },
  {
    icon: MessageCircle,
    title: "Support that knows the market",
    description:
      "Questions answered by people who understand UAE banking, not a generic overseas help desk.",
  },
];

const PRIVACY = [
  {
    icon: ServerOff,
    title: "No bank credentials, ever",
    description:
      "Fixpenses does not ask for your online banking login and does not screen-scrape your accounts. You stay in control of what you enter.",
  },
  {
    icon: Lock,
    title: "Encrypted in transit and at rest",
    description:
      "Your data travels over TLS and is stored encrypted. Access is scoped to your account and nothing else.",
  },
  {
    icon: ShieldCheck,
    title: "We do not sell your data",
    description:
      "Your spending history is not a product. We do not sell it, rent it, or hand it to advertisers — we are funded by subscriptions.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero — mission and credibility */}
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-3xl mx-auto space-y-5">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1a9e5c] bg-[#1a9e5c]/10 px-3 py-1 rounded-full">
              About Fixpenses
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Personal finance software built{" "}
              <span className="text-[#1a9e5c]">for the UAE</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Fixpenses is personal finance management software for people
              living and earning in the Emirates. One place for your expenses,
              credit cards, bank accounts, bills and installments — in dirhams,
              without handing over your banking logins.
            </p>
          </div>
        </section>

        {/* Who it is for */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Who Fixpenses is for
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We built this for everyday money in the UAE — not for traders,
              accountants, or anyone who enjoys spreadsheets.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {AUDIENCE.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-4 bg-background border border-border rounded-2xl p-6 hover:border-[#1a9e5c]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#1a9e5c]" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why we built it */}
        <section className="bg-muted/40 border-y border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Why we created Fixpenses
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Money in the UAE is spread thin across places that do not talk
                to each other. Salary lands in one bank. Rent goes out in
                cheques. A card from a second bank covers groceries, a third
                sits behind a 0% installment plan on a laptop. Add Salik, DEWA,
                a school fee plan and a transfer home, and the honest answer to
                &ldquo;where did the money go?&rdquo; is usually a shrug.
              </p>
              <p>
                The apps we tried did not fit. Most were built around US or
                European banking, assumed a direct feed into your accounts, and
                had no real concept of installments — the way a very large share
                of spending here actually happens. The alternative was a
                spreadsheet that everyone abandons by March.
              </p>
              <p>
                So we built the tool we wanted: dirhams as the default, credit
                cards and their statement cycles treated as first-class,
                installments tracked to the last payment, and manual entry that
                takes seconds rather than a bank integration that wants your
                password. Fixpenses is deliberately small in scope. It answers
                what you spent, what you still owe, and whether you are on track
                — and stops there.
              </p>
            </div>
          </div>
        </section>

        {/* How it helps */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              How it helps UAE residents
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every feature exists because of something that trips people up
              here specifically.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-4 bg-background border border-border rounded-2xl p-6 hover:border-[#1a9e5c]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#1a9e5c]" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-10">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a9e5c] hover:underline underline-offset-4"
            >
              See all features <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Privacy-first */}
        <section className="bg-[#0f1f17] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="max-w-2xl space-y-3 mb-10">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#4ade80] bg-white/10 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Privacy first
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Your money is your business
              </h2>
              <p className="text-white/70 leading-relaxed">
                A finance app only works if you trust it with the details. We
                designed Fixpenses to need as little of your data as possible.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {PRIVACY.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#4ade80]" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60 mt-8">
              The full details live in our{" "}
              <Link
                href="/privacy"
                className="text-[#4ade80] font-medium hover:underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Contact & support */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Talk to us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We are a small team based in Dubai. Questions, bug reports, and
                feature ideas all reach the people who build the product — we
                aim to reply within one business day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-[#1a9e5c] hover:bg-[#158a4f] text-white font-semibold shadow-lg shadow-[#1a9e5c]/20 w-full sm:w-auto"
                  >
                    Contact support{" "}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/request-feature">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Request a feature
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#1a9e5c]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <a
                    href="mailto:hello@simpleexpenses.ae"
                    className="text-sm text-[#1a9e5c] hover:underline underline-offset-4"
                  >
                    hello@simpleexpenses.ae
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We reply within 1 business day
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#1a9e5c]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Where we are
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dubai Internet City
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dubai, United Arab Emirates
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a9e5c]/10 flex items-center justify-center shrink-0">
                  <MessageCircle
                    className="w-4 h-4 text-[#1a9e5c]"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Support hours
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mon – Fri: 9 AM – 6 PM GST
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sat: 10 AM – 2 PM GST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#1a9e5c] py-16 px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Start tracking every dirham
            </h2>
            <p className="text-white/80">
              Free to start, no bank login required. Set up your first account
              in a couple of minutes.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-[#1a9e5c] hover:bg-white/90 font-bold shadow-lg"
              >
                Create your free account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
