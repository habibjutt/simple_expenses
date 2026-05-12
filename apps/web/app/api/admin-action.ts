"use server";

import { db } from "@/lib/db";
import { sanitizeString } from "@/lib/sanitize";
import { requireAdmin } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import { revalidatePath } from "next/cache";

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  await requireAdmin();

  const [userCount, activeSubscriptions, totalTransactions, bannedCount] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { subscriptionStatus: "active" } }),
      db.transaction.count(),
      db.user.count({ where: { banned: true } }),
    ]);

  return { userCount, activeSubscriptions, totalTransactions, bannedCount };
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function listAdminUsers({
  page = 1,
  search = "",
  role = "",
  banned = "",
}: {
  page?: number;
  search?: string;
  role?: string;
  banned?: string;
} = {}) {
  await requireAdmin();
  const limit = 20;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  if (banned === "true") where.banned = true;
  if (banned === "false") where.banned = false;

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        banned: true,
        banReason: true,
        subscriptionStatus: true,
        createdAt: true,
        trialEndsAt: true,
        _count: {
          select: {
            bankAccounts: true,
            creditCards: true,
          },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  return { users, total, pages: Math.ceil(total / limit) };
}

export async function setUserRole(userId: string, role: "user" | "admin") {
  const session = await requireAdmin();
  await db.user.update({ where: { id: userId }, data: { role } });
  await logAuditEvent({
    userId: session.user.id,
    action: "user.role_changed",
    entityType: "user",
    entityId: userId,
    metadata: { newRole: role },
  });
  revalidatePath("/admin/users");
}

export async function banUser(userId: string, reason: string) {
  const session = await requireAdmin();
  await db.user.update({
    where: { id: userId },
    data: { banned: true, banReason: sanitizeString(reason) },
  });
  await logAuditEvent({
    userId: session.user.id,
    action: "user.banned",
    entityType: "user",
    entityId: userId,
    metadata: { reason },
  });
  revalidatePath("/admin/users");
}

export async function unbanUser(userId: string) {
  const session = await requireAdmin();
  await db.user.update({
    where: { id: userId },
    data: { banned: false, banReason: null },
  });
  await logAuditEvent({
    userId: session.user.id,
    action: "user.unbanned",
    entityType: "user",
    entityId: userId,
  });
  revalidatePath("/admin/users");
}

export async function adminDeleteUser(userId: string) {
  const session = await requireAdmin();
  await db.user.delete({ where: { id: userId } });
  await logAuditEvent({
    userId: session.user.id,
    action: "user.deleted",
    entityType: "user",
    entityId: userId,
  });
  revalidatePath("/admin/users");
}

export async function adminBulkDeleteUsers(userIds: string[]) {
  const session = await requireAdmin();
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await Promise.all(
    userIds.map((id) =>
      logAuditEvent({
        userId: session.user.id,
        action: "user.deleted",
        entityType: "user",
        entityId: id,
      }),
    ),
  );
  revalidatePath("/admin/users");
}

// ─── Feature Flags ────────────────────────────────────────────────────────────

export async function getFeatureFlags() {
  await requireAdmin();
  return db.feature_flag.findMany({ orderBy: { key: "asc" } });
}

export async function toggleFeatureFlag(key: string, enabled: boolean) {
  const session = await requireAdmin();
  await db.feature_flag.update({ where: { key }, data: { enabled } });
  await logAuditEvent({
    userId: session.user.id,
    action: "feature_flag.toggled",
    entityType: "feature_flag",
    entityId: key,
    metadata: { enabled },
  });
  revalidatePath("/admin/flags");
}

export async function createFeatureFlag(data: {
  key: string;
  description?: string;
  enabled?: boolean;
}) {
  const session = await requireAdmin();
  await db.feature_flag.create({ data });
  await logAuditEvent({
    userId: session.user.id,
    action: "feature_flag.created",
    entityType: "feature_flag",
    entityId: data.key,
  });
  revalidatePath("/admin/flags");
}

export async function deleteFeatureFlag(key: string) {
  const session = await requireAdmin();
  await db.feature_flag.delete({ where: { key } });
  await logAuditEvent({
    userId: session.user.id,
    action: "feature_flag.deleted",
    entityType: "feature_flag",
    entityId: key,
  });
  revalidatePath("/admin/flags");
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function getAuditLogs({
  page = 1,
  userId = "",
  action = "",
}: { page?: number; userId?: string; action?: string } = {}) {
  await requireAdmin();
  const limit = 50;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (userId) where.userId = userId;
  if (action) where.action = { contains: action };

  const [logs, total] = await Promise.all([
    db.audit_log.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
      },
    }),
    db.audit_log.count({ where }),
  ]);

  return { logs, total, pages: Math.ceil(total / limit) };
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getAdminSubscriptions() {
  await requireAdmin();
  return db.user.findMany({
    where: {
      OR: [
        { stripeSubscriptionId: { not: null } },
        { subscriptionStatus: { not: null } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export async function getAdminMetrics() {
  await requireAdmin();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalUsers,
    newUsersThisMonth,
    activeSubscriptions,
    totalTransactions,
    recentTransactions,
    totalCreditCards,
    totalBankAccounts,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.user.count({ where: { subscriptionStatus: "active" } }),
    db.transaction.count(),
    db.transaction.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.credit_card.count(),
    db.bank_account.count(),
  ]);

  // Raw user signups per month (last 6 months)
  const usersByMonth = await db.$queryRaw<
    Array<{ month: Date; count: bigint }>
  >`
    SELECT
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*) as count
    FROM "user"
    WHERE "createdAt" > ${sixMonthsAgo}
    GROUP BY month
    ORDER BY month ASC
  `;

  return {
    totalUsers,
    newUsersThisMonth,
    activeSubscriptions,
    totalTransactions,
    recentTransactions,
    totalCreditCards,
    totalBankAccounts,
    usersByMonth: usersByMonth.map((r) => ({
      month: r.month.toISOString().slice(0, 7),
      count: Number(r.count),
    })),
  };
}
