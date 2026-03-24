import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight, Rocket, ThumbsUp, Star } from "lucide-react";
import LandingFooter from "@/components/LandingFooter";
import LandingNav from "@/components/LandingNav";

export const metadata = {
  title: "Request a Feature",
  description: "Share your ideas and help shape the future of Simple Expenses.",
};

export default function RequestFeaturePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#1a9e5c]/8 to-background px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Lightbulb className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Request a feature
            </h1>
            <p className="text-lg text-muted-foreground">
              Have an idea that would make Simple Expenses even better? We love
              hearing from our users. Share your suggestion and help us build the
              features that matter most to you.
            </p>
          </div>
        </section>

        {/* Main content */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Feature request form */}
          <div className="lg:col-span-3">
            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Submit your idea
              </h2>
              <form
                action="mailto:hello@simpleexpenses.ae"
                method="GET"
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="feature-title"
                    className="text-sm font-medium text-foreground"
                  >
                    Feature title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="feature-title"
                    name="Feature title"
                    type="text"
                    required
                    placeholder="e.g. Export transactions to Excel"
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="category"
                    className="text-sm font-medium text-foreground"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="Category"
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  >
                    <option value="">Select a category…</option>
                    <option value="dashboard">Dashboard &amp; Overview</option>
                    <option value="transactions">Transactions</option>
                    <option value="reports">Reports &amp; Analytics</option>
                    <option value="budgets">Budgets &amp; Spending Limits</option>
                    <option value="goals">Goals &amp; Savings</option>
                    <option value="cards">Credit Cards</option>
                    <option value="accounts">Bank Accounts</option>
                    <option value="invoices">Invoices</option>
                    <option value="integrations">Integrations</option>
                    <option value="mobile">Mobile Experience</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="impact"
                    className="text-sm font-medium text-foreground"
                  >
                    How important is this to you?
                  </label>
                  <select
                    id="impact"
                    name="Impact"
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  >
                    <option value="">Select priority…</option>
                    <option value="nice-to-have">Nice to have</option>
                    <option value="important">Important – would use it often</option>
                    <option value="critical">Critical – blocking my workflow</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-foreground"
                  >
                    Describe the feature <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="Description"
                    rows={5}
                    required
                    placeholder="Tell us what you'd like and why it would be valuable…"
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Your email (optional)
                  </label>
                  <input
                    id="email"
                    name="Email"
                    type="email"
                    placeholder="We'll notify you when it ships"
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold bg-[#1a9e5c] hover:bg-[#158a4f] text-white shadow-lg shadow-[#1a9e5c]/20"
                >
                  Submit feature request <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting this form you agree to our{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Why we want feedback */}
            <div className="bg-background border border-border rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-foreground">
                Why your feedback matters
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Rocket className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Shape the roadmap
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      The most requested features move to the top of our
                      development queue.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ThumbsUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Built for UAE users
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      We tailor every feature to the needs of users managing
                      finances in dirhams.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Early access
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Leave your email and we'll reach out when your requested
                      feature is live.
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
                  { href: "/contact", label: "Contact support" },
                  { href: "/#faq", label: "Browse FAQs" },
                  { href: "/privacy", label: "Privacy Policy" },
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
