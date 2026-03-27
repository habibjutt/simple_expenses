import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billing } from "@simple-expenses/api";
import type { Subscription } from "@simple-expenses/types";
import {
  getOfferings,
  restorePurchases,
  checkEntitlement,
} from "../lib/revenuecat";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

/**
 * Fetch subscription status from the backend.
 * This is the source of truth — reflects Stripe AND RevenueCat purchases.
 */
export function useSubscription() {
  return useQuery<Subscription>({
    queryKey: ["subscription"],
    queryFn: () => billing.subscription(),
    staleTime: 60_000,
  });
}

/**
 * Fetch RevenueCat offerings (available packages for purchase).
 */
export function useOfferings() {
  return useQuery({
    queryKey: ["revenuecat-offerings"],
    queryFn: () => getOfferings(),
    staleTime: 5 * 60_000,
  });
}

/**
 * Present the RevenueCat paywall and handle the result.
 * Returns true if a purchase or restore was completed.
 */
export function usePresentPaywall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "Simple Expenses Pro",
      });
      return result;
    },
    onSuccess: (result) => {
      if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED
      ) {
        // Invalidate subscription query to refetch from backend
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
      }
    },
  });
}

/**
 * Restore previous purchases. Required by App Store guidelines.
 */
export function useRestorePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const hasEntitlement = await restorePurchases();
      return hasEntitlement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}

/**
 * Check RevenueCat entitlement status directly (client-side).
 */
export function useEntitlement() {
  return useQuery({
    queryKey: ["revenuecat-entitlement"],
    queryFn: () => checkEntitlement(),
    staleTime: 60_000,
  });
}
