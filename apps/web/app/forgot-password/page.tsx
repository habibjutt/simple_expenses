import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Forgot Password",
  description:
    "Reset your Simple Expenses password. Enter your email and we'll send you a secure link to get back into your account.",
  keywords: [
    "forgot password Simple Expenses",
    "reset password UAE finance app",
  ],
  alternates: {
    canonical: `${SITE_URL}/forgot-password`,
  },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />
      <main className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
