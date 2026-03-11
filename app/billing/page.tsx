import { Suspense } from "react";
import BillingContent from "./billing-content";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";

export default function BillingPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <BillingContent />
      </Suspense>
    </>
  );
}
