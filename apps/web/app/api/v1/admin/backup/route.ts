import { getApiUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/admin/backup  — admin only
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((user as { role?: string }).role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    users,
    creditCards,
    bankAccounts,
    transactions,
    categories,
    spendingLimits,
    savingsGoals,
    invoices,
    featureFlags,
    auditLogs,
  ] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        preferredCurrency: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.credit_card.findMany(),
    db.bank_account.findMany(),
    db.transaction.findMany(),
    db.category.findMany(),
    db.spending_limit.findMany(),
    db.savings_goal.findMany(),
    db.invoice.findMany(),
    db.feature_flag.findMany(),
    db.audit_log.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  await logAuditEvent({
    userId: user.id,
    action: "admin.backup_downloaded",
    entityType: "system",
  });

  const backup = {
    exportedAt: new Date().toISOString(),
    version: "1",
    data: {
      users,
      creditCards,
      bankAccounts,
      transactions,
      categories,
      spendingLimits,
      savingsGoals,
      invoices,
      featureFlags,
      auditLogs,
    },
  };

  const date = new Date().toISOString().slice(0, 10);
  const filename = `backup-${date}.json`;

  return new Response(JSON.stringify(backup, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
