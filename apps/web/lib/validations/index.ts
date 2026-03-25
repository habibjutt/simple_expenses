import type { PlanTier } from "@/lib/plans";

export type ActionResult =
  | { error: string; planLimitReached?: boolean; requiredPlan?: PlanTier }
  | undefined;

export * from "./credit-card";
export * from "./bank-account";
export * from "./transaction";
export * from "./category";
export * from "./spending-limit";
export * from "./savings-goal";
export * from "./invoice";
