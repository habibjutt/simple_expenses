"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import type { GuardResult } from "@/lib/plan-guards";
import { getPlanDisplayName } from "@/lib/plans";
import type { PlanTier } from "@/lib/plans";

export type PlanLimitType = "creditCard" | "bankAccount" | "transaction" | "csvExport" | "pdfExport";

interface PlanLimitAlertProps {
  open: boolean;
  onClose: () => void;
  limitType: PlanLimitType;
  guardResult: GuardResult;
}

const LIMIT_TYPE_LABELS: Record<PlanLimitType, string> = {
  creditCard: "Credit Card",
  bankAccount: "Bank Account",
  transaction: "Transaction",
  csvExport: "CSV Export",
  pdfExport: "PDF Export",
};

function getActionLabel(limitType: PlanLimitType): string {
  switch (limitType) {
    case "csvExport":
    case "pdfExport":
      return "export your data";
    default:
      return `add a new ${LIMIT_TYPE_LABELS[limitType].toLowerCase()}`;
  }
}

export default function PlanLimitAlert({ open, onClose, limitType, guardResult }: PlanLimitAlertProps) {
  const router = useRouter();
  const requiredPlan = guardResult.requiredPlan as PlanTier | undefined;
  const requiredPlanName = requiredPlan ? getPlanDisplayName(requiredPlan) : "a higher plan";

  const handleUpgrade = () => {
    onClose();
    router.push("/billing");
  };

  return (
    <AlertDialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            Plan Limit Reached
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <p className="text-foreground/80">
                {guardResult.reason ??
                  `You need to upgrade your plan to ${getActionLabel(limitType)}.`}
              </p>

              {guardResult.currentCount !== undefined && guardResult.limit !== null && guardResult.limit !== undefined && (
                <div className="rounded-lg border bg-muted/50 px-4 py-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current</span>
                    <span className="font-semibold">
                      {guardResult.currentCount} / {guardResult.limit}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-destructive"
                      style={{
                        width: `${Math.min(100, (guardResult.currentCount / (guardResult.limit ?? 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <p className="text-muted-foreground">
                Upgrade to <span className="font-semibold text-foreground">{requiredPlanName}</span> to unlock this feature, or remove excess data to stay on the Free plan.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Maybe later</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade}>
            Upgrade to {requiredPlanName}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
