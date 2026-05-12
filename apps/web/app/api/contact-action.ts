"use server";

import { db } from "@/lib/db";
import { sanitizeString } from "@/lib/sanitize";
import { requireAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { contactSchema, type ContactFormValues } from "@/lib/contact-schema";

// ─── Submit enquiry (public) ──────────────────────────────────────────────────

export async function submitContactEnquiry(data: ContactFormValues) {
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { firstName, lastName, email, subject, message } = parsed.data;

  await db.contact_enquiry.create({
    data: {
      firstName: sanitizeString(firstName),
      lastName: sanitizeString(lastName),
      email: email.toLowerCase().trim(),
      subject: sanitizeString(subject),
      message: sanitizeString(message),
    },
  });

  return { success: true };
}

// ─── Admin: list enquiries ────────────────────────────────────────────────────

export async function listEnquiries({
  page = 1,
  status = "",
}: {
  page?: number;
  status?: string;
} = {}) {
  await requireAdmin();
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = status ? { status } : {};

  const [enquiries, total] = await Promise.all([
    db.contact_enquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.contact_enquiry.count({ where }),
  ]);

  return { enquiries, total, pages: Math.ceil(total / limit) };
}

// ─── Admin: get enquiry counts per status ─────────────────────────────────────

export async function getEnquiryCounts() {
  await requireAdmin();
  const counts = await db.contact_enquiry.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const result: Record<string, number> = { new: 0, read: 0, replied: 0, closed: 0 };
  for (const row of counts) result[row.status] = row._count.id;
  return result;
}

// ─── Admin: update status / note ─────────────────────────────────────────────

export async function updateEnquiryStatus(
  id: string,
  status: string,
  adminNote?: string
) {
  await requireAdmin();

  await db.contact_enquiry.update({
    where: { id },
    data: {
      status,
      ...(adminNote !== undefined ? { adminNote: sanitizeString(adminNote) } : {}),
    },
  });

  revalidatePath("/admin/enquiries");
  return { success: true };
}

// ─── Admin: delete enquiry ────────────────────────────────────────────────────

export async function deleteEnquiry(id: string) {
  await requireAdmin();
  await db.contact_enquiry.delete({ where: { id } });
  revalidatePath("/admin/enquiries");
  return { success: true };
}
