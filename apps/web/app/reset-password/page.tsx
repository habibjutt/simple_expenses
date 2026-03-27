import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Fixpenses account.",
  keywords: ["reset password Fixpenses"],
  alternates: {
    canonical: `${SITE_URL}/reset-password`,
  },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNav />
      <main className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
