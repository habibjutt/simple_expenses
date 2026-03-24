import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";

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
