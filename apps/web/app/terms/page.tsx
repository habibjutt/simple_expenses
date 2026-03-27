import type { Metadata } from "next";
import Link from "next/link";
import LandingFooter from "@/components/LandingFooter";
import LandingNav from "@/components/LandingNav";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Fixpenses Terms of Service — the rules and conditions governing your use of the platform.",
  keywords: [
    "Fixpenses terms of service",
    "expense app terms and conditions",
    "UAE finance app terms",
  ],
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: "Terms of Service | Fixpenses",
    description:
      "The rules and conditions governing your use of Fixpenses.",
    url: `${SITE_URL}/terms`,
  },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <LandingNav />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
              Legal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated:{" "}
              <strong className="text-foreground">1 March 2025</strong>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Please read these Terms of Service carefully before using Simple
              Expenses. By accessing or using the Service, you agree to be bound
              by these Terms. If you do not agree, do not use the Service.
            </p>
          </div>

          <div className="space-y-10 border-t border-border pt-10">
            <Section title="1. Acceptance of Terms">
              <p>
                These Terms constitute a legally binding agreement between you
                and Fixpenses (operated from Dubai, UAE) governing your
                use of the web application and related services. These Terms are
                governed by the laws of the{" "}
                <strong className="text-foreground">
                  United Arab Emirates
                </strong>
                .
              </p>
            </Section>

            <Section title="2. Description of Service">
              <p>
                Fixpenses is a personal finance tracking application that
                allows UAE residents to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Manually track credit card balances and transactions.</li>
                <li>Monitor bank account balances.</li>
                <li>Manage invoices and payment due dates.</li>
                <li>Set budgets, spending limits, and financial goals.</li>
                <li>View reports and financial analytics.</li>
              </ul>
              <p>
                The Service is a manual tracking tool. We do{" "}
                <strong className="text-foreground">not</strong> connect to your
                bank accounts, process payments, or provide financial advice.
              </p>
            </Section>

            <Section title="3. Eligibility">
              <p>
                You must be at least{" "}
                <strong className="text-foreground">18 years old</strong> to use
                Fixpenses. By using the Service, you represent that you
                meet this requirement. The Service is intended primarily for
                residents of the United Arab Emirates.
              </p>
            </Section>

            <Section title="4. Account Registration">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  You must provide accurate and complete registration
                  information.
                </li>
                <li>
                  You are responsible for maintaining the security of your
                  account credentials.
                </li>
                <li>
                  You must notify us immediately of any unauthorised account
                  access.
                </li>
                <li>
                  Each account is for personal use only; sharing accounts is not
                  permitted.
                </li>
                <li>
                  You may not create multiple accounts to circumvent plan
                  limits.
                </li>
              </ul>
            </Section>

            <Section title="5. Subscription Plans and Billing">
              <p>
                Fixpenses offers a free Starter plan and paid Pro and
                Premium plans billed in AED (UAE Dirham).
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-foreground">Free trial:</strong> Paid
                  plans include a 14-day free trial. No charge until the trial
                  ends.
                </li>
                <li>
                  <strong className="text-foreground">Billing:</strong>{" "}
                  Subscriptions are billed monthly or annually in advance.
                </li>
                <li>
                  <strong className="text-foreground">Refunds:</strong> We offer
                  a full refund within 7 days of an initial charge if you are
                  unsatisfied. No refunds for partial periods after that.
                </li>
                <li>
                  <strong className="text-foreground">Cancellation:</strong> You
                  may cancel your subscription anytime. Access continues until
                  the end of the billing period.
                </li>
                <li>
                  <strong className="text-foreground">Price changes:</strong> We
                  will notify you at least 30 days before any pricing change.
                </li>
              </ul>
            </Section>

            <Section title="6. Acceptable Use">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Use the Service for illegal purposes or in violation of UAE
                  law.
                </li>
                <li>
                  Attempt to gain unauthorised access to the Service or other
                  users&apos; accounts.
                </li>
                <li>
                  Reverse engineer, decompile, or disassemble any part of the
                  Service.
                </li>
                <li>
                  Use automated tools to scrape or extract data from the
                  Service.
                </li>
                <li>Upload malicious content, viruses, or harmful code.</li>
                <li>Impersonate other users or misrepresent your identity.</li>
              </ul>
            </Section>

            <Section title="7. Data and Privacy">
              <p>
                Your use of the Service is also governed by our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms. You retain ownership
                of all financial data you enter. We only process your data as
                necessary to provide the Service.
              </p>
            </Section>

            <Section title="8. Intellectual Property">
              <p>
                The Service, including its design, code, content, and branding,
                is owned by Fixpenses and protected by UAE and
                international intellectual property laws. You may not reproduce,
                distribute, or create derivative works without our written
                permission.
              </p>
            </Section>

            <Section title="9. Disclaimer of Warranties">
              <p>
                The Service is provided &quot;as is&quot; without warranties of
                any kind. We do not guarantee that the Service will be
                uninterrupted, error-free, or completely secure. Fixpenses
                does not provide financial, investment, tax, or legal advice.
              </p>
            </Section>

            <Section title="10. Limitation of Liability">
              <p>
                To the maximum extent permitted by UAE law, Fixpenses
                shall not be liable for indirect, incidental, consequential, or
                punitive damages arising from your use of the Service. Our total
                liability shall not exceed the amount you paid us in the three
                months preceding the claim.
              </p>
            </Section>

            <Section title="11. Termination">
              <p>
                We may suspend or terminate your account if you breach these
                Terms. You may delete your account at any time from Settings.
                Upon termination, your data will be deleted per our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </Section>

            <Section title="12. Changes to Terms">
              <p>
                We may update these Terms periodically. We will provide at least
                14 days notice via email before material changes take effect.
                Continued use of the Service after changes constitutes
                acceptance.
              </p>
            </Section>

            <Section title="13. Governing Law and Disputes">
              <p>
                These Terms are governed by the laws of the{" "}
                <strong className="text-foreground">
                  United Arab Emirates
                </strong>
                . Any disputes shall be resolved in the courts of Dubai, UAE.
                Before filing a claim, you agree to contact us to seek informal
                resolution.
              </p>
            </Section>

            <Section title="14. Contact">
              <p>
                For questions about these Terms:{" "}
                <a
                  href="mailto:legal@simpleexpenses.ae"
                  className="text-primary hover:underline"
                >
                  legal@simpleexpenses.ae
                </a>{" "}
                · Dubai, United Arab Emirates.
              </p>
            </Section>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4">
            <Link href="/privacy">
              <Button variant="outline" size="sm">
                View Privacy Policy →
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="sm">
                Contact us
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
