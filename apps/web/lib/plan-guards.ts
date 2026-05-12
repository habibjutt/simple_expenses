/**
 * lib/plan-guards.ts
 *
 * Reusable guard functions that check whether a user is allowed to perform
 * a given action based on their current plan tier.
 *
 * Each guard returns a GuardResult. Server actions should call the guard and
 * return { error, planLimitReached: true, requiredPlan } when !allowed.
 */

import { db } from "@/lib/db";
import { getEffectivePlan } from "@/lib/subscription";
import { getPlanLimits, type PlanTier } from "@/lib/plans";

export interface GuardResult {
  allowed: boolean;
  /** Human-readable reason shown to the user (only set when !allowed) */
  reason?: string;
  /** How many the user currently has (for count-based limits) */
  currentCount?: number;
  /** The plan's limit (null = unlimited) */
  limit?: number | null;
  /** The minimum plan tier required to perform this action */
  requiredPlan?: PlanTier;
}

// ─── Credit Cards ─────────────────────────────────────────────────────────────

export async function checkCanAddCreditCard(
  userId: string,
): Promise<GuardResult> {
  const plan = await getEffectivePlan(userId);
  const limits = getPlanLimits(plan);

  if (limits.creditCards === null) return { allowed: true };

  const count = await db.credit_card.count({ where: { userId } });

  if (count >= limits.creditCards) {
    return {
      allowed: false,
      reason: `Your ${plan === "free" ? "Free" : "current"} plan allows up to ${limits.creditCards} credit card${limits.creditCards === 1 ? "" : "s"}. You already have ${count}.`,
      currentCount: count,
      limit: limits.creditCards,
      requiredPlan: "pro",
    };
  }

  return { allowed: true, currentCount: count, limit: limits.creditCards };
}

// ─── Bank Accounts ────────────────────────────────────────────────────────────

export async function checkCanAddBankAccount(
  userId: string,
): Promise<GuardResult> {
  const plan = await getEffectivePlan(userId);
  const limits = getPlanLimits(plan);

  if (limits.bankAccounts === null) return { allowed: true };

  const count = await db.bank_account.count({ where: { userId } });

  if (count >= limits.bankAccounts) {
    return {
      allowed: false,
      reason: `Your ${plan === "free" ? "Free" : "current"} plan allows up to ${limits.bankAccounts} bank account${limits.bankAccounts === 1 ? "" : "s"}. You already have ${count}.`,
      currentCount: count,
      limit: limits.bankAccounts,
      requiredPlan: "pro",
    };
  }

  return { allowed: true, currentCount: count, limit: limits.bankAccounts };
}

// ─── Transactions ─────────────────────────────────────────────────────────────

/**
 * Counts user-initiated transactions for the current calendar month.
 * Excludes:
 *  - Cron-generated recurring instances (parentRecurringId IS NOT NULL)
 *  - Installment child records (installmentNumber > 0 AND parentTransactionId IS NOT NULL)
 */
async function countMonthlyTransactions(userId: string): Promise<number> {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  // Get user's account IDs for join-free counting
  const [cardIds, accountIds] = await Promise.all([
    db.credit_card.findMany({ where: { userId }, select: { id: true } }),
    db.bank_account.findMany({ where: { userId }, select: { id: true } }),
  ]);

  const cardIdList = cardIds.map((c) => c.id);
  const accountIdList = accountIds.map((a) => a.id);

  return db.transaction.count({
    where: {
      date: { gte: monthStart, lt: monthEnd },
      // Belongs to the user (at least one account matches)
      OR: [
        cardIdList.length > 0 ? { creditCardId: { in: cardIdList } } : {},
        accountIdList.length > 0
          ? { bankAccountId: { in: accountIdList } }
          : {},
      ],
      // Exclude cron-generated recurring instances
      parentRecurringId: null,
      // Exclude installment child records (installmentNumber > 1 AND parentTransactionId != null)
      NOT: {
        AND: [
          { parentTransactionId: { not: null } },
          { installmentNumber: { gt: 1 } },
        ],
      },
    },
  });
}

export async function checkCanAddTransaction(
  userId: string,
): Promise<GuardResult> {
  const plan = await getEffectivePlan(userId);
  const limits = getPlanLimits(plan);

  if (limits.transactionsPerMonth === null) return { allowed: true };

  // Block transactions if the user has exceeded their account or card limits.
  // They must delete the excess data before they can add new transactions.
  const [cardCount, accountCount] = await Promise.all([
    limits.creditCards !== null
      ? db.credit_card.count({ where: { userId } })
      : Promise.resolve(0),
    limits.bankAccounts !== null
      ? db.bank_account.count({ where: { userId } })
      : Promise.resolve(0),
  ]);

  if (limits.creditCards !== null && cardCount > limits.creditCards) {
    return {
      allowed: false,
      reason: `You have ${cardCount} credit card${cardCount === 1 ? "" : "s"} but the Free plan allows ${limits.creditCards}. Delete the excess card${cardCount - limits.creditCards === 1 ? "" : "s"} to continue adding transactions.`,
      currentCount: cardCount,
      limit: limits.creditCards,
      requiredPlan: "pro",
    };
  }

  if (limits.bankAccounts !== null && accountCount > limits.bankAccounts) {
    return {
      allowed: false,
      reason: `You have ${accountCount} bank account${accountCount === 1 ? "" : "s"} but the Free plan allows ${limits.bankAccounts}. Delete the excess account${accountCount - limits.bankAccounts === 1 ? "" : "s"} to continue adding transactions.`,
      currentCount: accountCount,
      limit: limits.bankAccounts,
      requiredPlan: "pro",
    };
  }

  const count = await countMonthlyTransactions(userId);

  if (count >= limits.transactionsPerMonth) {
    return {
      allowed: false,
      reason: `Your Free plan allows up to ${limits.transactionsPerMonth} transactions per month. You've used ${count} this month.`,
      currentCount: count,
      limit: limits.transactionsPerMonth,
      requiredPlan: "pro",
    };
  }

  return {
    allowed: true,
    currentCount: count,
    limit: limits.transactionsPerMonth,
  };
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export async function checkCanExport(
  userId: string,
  format: "csv" | "pdf",
): Promise<GuardResult> {
  const plan = await getEffectivePlan(userId);
  const limits = getPlanLimits(plan);

  const allowed = format === "csv" ? limits.csvExport : limits.pdfExport;

  if (!allowed) {
    return {
      allowed: false,
      reason: `${format.toUpperCase()} export is available on the Premium plan. Upgrade to download your data.`,
      requiredPlan: "premium",
    };
  }

  return { allowed: true };
}

// ─── Composite: "Is user over limits?" ───────────────────────────────────────

/**
 * Returns whether a user currently exceeds the limits of their plan in *any* dimension.
 * Useful for the subscription banner and blocking status.
 */
export async function getUserOverLimitStatus(userId: string): Promise<{
  overCreditCards: boolean;
  overBankAccounts: boolean;
  overTransactions: boolean;
  creditCardCount: number;
  bankAccountCount: number;
  transactionCount: number;
  creditCardLimit: number | null;
  bankAccountLimit: number | null;
  transactionLimit: number | null;
}> {
  const plan = await getEffectivePlan(userId);
  const limits = getPlanLimits(plan);

  const [creditCardCount, bankAccountCount, transactionCount] =
    await Promise.all([
      db.credit_card.count({ where: { userId } }),
      db.bank_account.count({ where: { userId } }),
      countMonthlyTransactions(userId),
    ]);

  return {
    overCreditCards:
      limits.creditCards !== null && creditCardCount > limits.creditCards,
    overBankAccounts:
      limits.bankAccounts !== null && bankAccountCount > limits.bankAccounts,
    overTransactions:
      limits.transactionsPerMonth !== null &&
      transactionCount > limits.transactionsPerMonth,
    creditCardCount,
    bankAccountCount,
    transactionCount,
    creditCardLimit: limits.creditCards,
    bankAccountLimit: limits.bankAccounts,
    transactionLimit: limits.transactionsPerMonth,
  };
}
