import { listEnquiries, getEnquiryCounts } from "@/app/api/contact-action";
import { Mail } from "lucide-react";
import Link from "next/link";
import EnquiriesTable from "./EnquiriesTable";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "#4f6ef7",
  read: "#f59e0b",
  replied: "#22c55e",
  closed: "#64748b",
};

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status ?? "";

  const [{ enquiries, total, pages }, counts] = await Promise.all([
    listEnquiries({ page, status }),
    getEnquiryCounts(),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4" style={{ color: "#4f6ef7" }} />
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "#4f6ef7" }}
          >
            Contact Enquiries
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Enquiries</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          {total} enquir{total !== 1 ? "ies" : "y"} total
        </p>
      </div>

      {/* Status count chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([s, count]) => {
          const color = STATUS_COLORS[s] ?? "#64748b";
          return (
            <Link
              key={s}
              href={`?status=${s}&page=1`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
              style={{
                borderColor: status === s ? color : "#1a2d4a",
                background: status === s ? `${color}22` : "transparent",
                color: status === s ? color : "#64748b",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px]"
                style={{
                  background: `${color}33`,
                  color,
                }}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`?status=${opt.value}&page=1`}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
            style={{
              borderColor: status === opt.value ? "#4f6ef7" : "#1a2d4a",
              background:
                status === opt.value ? "#4f6ef722" : "transparent",
              color: status === opt.value ? "#4f6ef7" : "#64748b",
            }}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <EnquiriesTable enquiries={enquiries} />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "#64748b" }}>
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?status=${status}&page=${page - 1}`}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
                style={{
                  borderColor: "#1a2d4a",
                  color: "#94a3b8",
                  background: "#0f1e38",
                }}
              >
                Previous
              </Link>
            )}
            {page < pages && (
              <Link
                href={`?status=${status}&page=${page + 1}`}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
                style={{
                  borderColor: "#1a2d4a",
                  color: "#94a3b8",
                  background: "#0f1e38",
                }}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
