import { db } from "@/lib/db";
import { headers } from "next/headers";

export type AuditAction =
  | "user.role_changed"
  | "user.banned"
  | "user.unbanned"
  | "user.deleted"
  | "user.impersonated"
  | "invoice.paid"
  | "invoice.unpaid"
  | "transaction.deleted"
  | "credit_card.deleted"
  | "bank_account.deleted"
  | "feature_flag.toggled"
  | "feature_flag.created"
  | "feature_flag.deleted";

export async function logAuditEvent({
  userId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  userId: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const reqHeaders = await headers();
    const ipAddress =
      reqHeaders.get("x-forwarded-for") ||
      reqHeaders.get("x-real-ip") ||
      undefined;
    const userAgent = reqHeaders.get("user-agent") || undefined;

    await db.audit_log.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: metadata as any,
        ipAddress: ipAddress ?? undefined,
        userAgent,
      },
    });
  } catch (e) {
    // Audit logging must never break the main flow
    console.error("[audit] Failed to log event:", e);
  }
}
