import type { Metadata } from "next";
import Link from "next/link";
import LandingFooter from "@/components/LandingFooter";
import LandingNav from "@/components/LandingNav";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Fixpenses Privacy Policy — how we collect, use, and protect your data in compliance with UAE PDPL.",
  keywords: [
    "Fixpenses privacy policy",
    "UAE PDPL compliance",
    "expense app data privacy",
    "finance app privacy UAE",
  ],
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | Fixpenses",
    description: "How Fixpenses collects, uses, and protects your data.",
    url: `${SITE_URL}/privacy`,
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

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated:{" "}
              <strong className="text-foreground">1 March 2025</strong>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Fixpenses (&quot;we&quot;, &quot;our&quot;, or &quot;the
              Service&quot;) is committed to protecting your personal data. This
              Privacy Policy explains how we collect, use, store, and protect
              information in accordance with the{" "}
              <strong className="text-foreground">
                UAE Federal Decree-Law No. 45 of 2021 on Personal Data
                Protection (PDPL)
              </strong>{" "}
              and other applicable regulations.
            </p>
          </div>

          <div className="space-y-10 border-t border-border pt-10">
            <Section title="1. Information We Collect">
              <p>
                We collect only the information necessary to provide the
                Service:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-foreground">Account data:</strong>{" "}
                  Your name, email address, and authentication credentials when
                  you register.
                </li>
                <li>
                  <strong className="text-foreground">Financial data:</strong>{" "}
                  Credit card details (names, limits, bill dates — not card
                  numbers), bank account balances, and transactions you manually
                  enter.
                </li>
                <li>
                  <strong className="text-foreground">Usage data:</strong> Pages
                  visited, features used, and interactions within the app —
                  collected to improve the Service.
                </li>
                <li>
                  <strong className="text-foreground">Technical data:</strong>{" "}
                  IP address, browser type, device information, and cookies for
                  session management.
                </li>
              </ul>
              <p>
                We do <strong className="text-foreground">not</strong> collect
                actual bank card numbers, CVVs, PINs, or connect to your bank
                accounts directly. All financial data is entered manually by
                you.
              </p>
            </Section>

            <Section title="2. How We Use Your Data">
              <p>Your data is used exclusively to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Provide, operate, and maintain the Fixpenses Service.
                </li>
                <li>Personalise your dashboard, reports, and notifications.</li>
                <li>
                  Send service-related emails (password resets, billing alerts).
                </li>
                <li>
                  Improve and develop new features based on aggregated,
                  anonymised usage data.
                </li>
                <li>Comply with legal obligations under UAE law.</li>
              </ul>
              <p>
                We do <strong className="text-foreground">not</strong> sell,
                rent, or share your personal or financial data with third
                parties for marketing purposes.
              </p>
            </Section>

            <Section title="3. Data Storage and Security">
              <p>
                All data is stored on servers located in the{" "}
                <strong className="text-foreground">UAE or EU regions</strong>{" "}
                with industry-standard security measures:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>TLS 1.3 encryption for all data in transit.</li>
                <li>AES-256 encryption for data at rest.</li>
                <li>Regular security audits and penetration testing.</li>
                <li>
                  Access controls — only authorised personnel can access
                  production data.
                </li>
                <li>Automatic backups with 30-day retention.</li>
              </ul>
            </Section>

            <Section title="4. Data Sharing">
              <p>We may share your data only in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-foreground">
                    Service providers:
                  </strong>{" "}
                  Trusted sub-processors (database hosting, email delivery)
                  under strict data processing agreements.
                </li>
                <li>
                  <strong className="text-foreground">
                    Legal requirements:
                  </strong>{" "}
                  When required by UAE law, court order, or government
                  authority.
                </li>
                <li>
                  <strong className="text-foreground">
                    Business transfer:
                  </strong>{" "}
                  In the event of a merger or acquisition, with prior notice to
                  you.
                </li>
              </ul>
            </Section>

            <Section title="5. Your Rights Under UAE PDPL">
              <p>
                Under the UAE Personal Data Protection Law, you have the right
                to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-foreground">Access</strong> your
                  personal data held by us.
                </li>
                <li>
                  <strong className="text-foreground">Correct</strong>{" "}
                  inaccurate data.
                </li>
                <li>
                  <strong className="text-foreground">Delete</strong> your
                  account and all associated data.
                </li>
                <li>
                  <strong className="text-foreground">Port</strong> your data in
                  a machine-readable format.
                </li>
                <li>
                  <strong className="text-foreground">Object</strong> to certain
                  processing activities.
                </li>
              </ul>
              <p>
                To exercise these rights, contact us at{" "}
                <a
                  href="mailto:privacy@simpleexpenses.ae"
                  className="text-primary hover:underline"
                >
                  privacy@simpleexpenses.ae
                </a>
                . We will respond within 15 business days.
              </p>
            </Section>

            <Section title="6. Cookies">
              <p>
                We use cookies strictly for authentication session management
                and security purposes. We do not use tracking or advertising
                cookies. You can disable cookies in your browser settings, but
                this may prevent login functionality.
              </p>
            </Section>

            <Section title="7. Data Retention">
              <p>
                We retain your data for as long as your account is active. When
                you delete your account, all personal and financial data is
                permanently deleted within{" "}
                <strong className="text-foreground">30 days</strong>. Anonymised
                aggregate data (totals, statistics) may be retained
                indefinitely.
              </p>
            </Section>

            <Section title="8. Children's Privacy">
              <p>
                Fixpenses is not directed to individuals under 18 years of
                age. We do not knowingly collect data from minors. If we become
                aware that a minor has provided personal data, we will delete it
                promptly.
              </p>
            </Section>

            <Section title="9. Changes to This Policy">
              <p>
                We may update this Privacy Policy periodically. We will notify
                you by email and through an in-app notice at least 14 days
                before material changes take effect. Your continued use of the
                Service after changes constitutes acceptance.
              </p>
            </Section>

            <Section title="10. Contact">
              <p>For privacy questions or to exercise your rights:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:privacy@simpleexpenses.ae"
                    className="text-primary hover:underline"
                  >
                    privacy@simpleexpenses.ae
                  </a>
                </li>
                <li>Address: Dubai Internet City, Dubai, UAE</li>
              </ul>
            </Section>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4">
            <Link href="/terms">
              <Button variant="outline" size="sm">
                View Terms of Service →
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
