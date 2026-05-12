import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Clock, MessageCircle, Phone, ArrowRight } from "lucide-react";
import LandingFooter from "@/components/LandingFooter";
import LandingNav from "@/components/LandingNav";
import { SITE_URL } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Fixpenses team. We're here to help UAE users with any questions about tracking expenses, credit cards, and bank accounts.",
  keywords: [
    "contact Fixpenses",
    "Fixpenses support",
    "UAE finance app help",
    "expense tracker support",
  ],
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contact Us | Fixpenses",
    description: "Get in touch with the Fixpenses team.",
    url: `${SITE_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Get in touch
            </h1>
            <p className="text-lg text-muted-foreground">
              Have a question or need help? Our team is based in Dubai and ready
              to assist UAE users. We aim to respond within one business day.
            </p>
          </div>
        </section>

        {/* Main content */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background border border-border rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-foreground">
                Contact information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Email
                    </p>
                    <a
                      href="mailto:hello@simpleexpenses.ae"
                      className="text-sm text-primary hover:underline"
                    >
                      hello@simpleexpenses.ae
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      We reply within 1 business day
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      WhatsApp Support
                    </p>
                    <a
                      href="https://wa.me/97150000000"
                      className="text-sm text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      +971 50 000 0000
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Premium &amp; Business plans only
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Location
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dubai Internet City
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dubai, United Arab Emirates 🇦🇪
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Business hours
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

            {/* Quick links */}
            <div className="bg-muted/50 border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-foreground text-sm">Quick links</h3>
              <div className="space-y-2">
                {[
                  { href: "/#faq", label: "Browse FAQs" },
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/signup", label: "Create free account" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between py-2 px-3 rounded-xl text-sm text-muted-foreground hover:bg-background hover:text-foreground transition-all group"
                  >
                    {link.label}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
