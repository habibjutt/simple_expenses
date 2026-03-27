import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? "";
const IOS_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? API_KEY;
const ANDROID_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? API_KEY;

export const ENTITLEMENT_ID = "Simple Expenses Pro";

let isConfigured = false;

/**
 * Initialize the RevenueCat SDK. Call once on app startup.
 * Must be called before any other RevenueCat method.
 */
export async function initRevenueCat(): Promise<void> {
  if (isConfigured) return;

  const apiKey = Platform.OS === "ios" ? IOS_API_KEY : ANDROID_API_KEY;

  if (!apiKey) {
    console.warn("RevenueCat API key not configured — skipping init");
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  Purchases.configure({ apiKey });
  isConfigured = true;
}

/**
 * Identify the current user to RevenueCat after login.
 * Uses the backend user ID so store purchases link to the correct account.
 */
export async function loginRevenueCat(userId: string): Promise<void> {
  if (!isConfigured) return;
  try {
    await Purchases.logIn(userId);
  } catch (err) {
    console.error("RevenueCat logIn failed:", err);
  }
}

/**
 * Log out the current user from RevenueCat on sign-out.
 */
export async function logoutRevenueCat(): Promise<void> {
  if (!isConfigured) return;
  try {
    await Purchases.logOut();
  } catch (err) {
    console.error("RevenueCat logOut failed:", err);
  }
}

/**
 * Check whether the user has the pro entitlement via RevenueCat.
 */
export async function checkEntitlement(): Promise<boolean> {
  if (!isConfigured) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return (
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined"
    );
  } catch {
    return false;
  }
}

/**
 * Restore purchases (required by App Store guidelines).
 * Returns true if the user now has an active entitlement.
 */
export async function restorePurchases(): Promise<boolean> {
  if (!isConfigured) return false;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return (
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined"
    );
  } catch (err) {
    console.error("RevenueCat restore failed:", err);
    throw err;
  }
}

/**
 * Get available offerings for the paywall.
 */
export async function getOfferings() {
  if (!isConfigured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (err) {
    console.error("RevenueCat getOfferings failed:", err);
    return null;
  }
}
