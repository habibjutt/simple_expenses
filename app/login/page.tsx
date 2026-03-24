import { LoginForm } from "@/components/login-form";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { CreditCard, BarChart3, Shield, Wallet, CheckCircle2 } from "lucide-react";

const features = [
  { icon: BarChart3, text: "Real-time spending insights" },
  { icon: Wallet, text: "All your cards & accounts in one place" },
  { icon: Shield, text: "Secure & completely private" },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />

      <main className="flex flex-1 items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Page background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a9e5c]/8 via-background to-background pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#1a9e5c]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-[#1a9e5c]/4 rounded-full blur-3xl pointer-events-none" />

        {/* ── Contained card ─────────────────────────────────── */}
        <div className="relative w-full max-w-4xl flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl border border-border/50">

          {/* Left: green branding panel */}
          <div className="relative hidden lg:flex lg:w-[380px] xl:w-[420px] bg-[#1a9e5c] flex-col items-center justify-center p-10 overflow-hidden shrink-0">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-white max-w-xs space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">Simple Expenses</span>
              </div>

              <div>
                <h2 className="text-3xl font-extrabold leading-tight">Welcome back</h2>
                <p className="text-white/70 mt-2 text-sm leading-relaxed">
                  Your finances are waiting. Pick up right where you left off.
                </p>
              </div>

              <ul className="space-y-4">
                {features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/90 text-sm font-medium">{text}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/20 pt-5 flex items-center gap-2 text-white/50 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Built exclusively for UAE residents · AED only
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:p-8 md:p-10 bg-background">
            {/* Mobile-only brand header */}
            <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
              <div className="w-8 h-8 rounded-full bg-[#1a9e5c] flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-foreground">Simple Expenses</span>
            </div>

            <div className="w-full max-w-sm">
              <LoginForm />
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
