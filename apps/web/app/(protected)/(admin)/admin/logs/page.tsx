import { getAuditLogs } from "@/app/api/admin-action";
import { ScrollText } from "lucide-react";
import Link from "next/link";

function ActionBadge({ action }: { action: string }) {
  const color =
    action.includes("deleted") || action.includes("banned")
      ? "#ef4444"
      : action.includes("admin") || action.includes("role")
        ? "#f59e0b"
        : action.includes("toggled") || action.includes("created")
          ? "#22c55e"
          : "#4f6ef7";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium whitespace-nowrap"
      style={{ background: `${color}18`, color }}
    >
      {action}
    </span>
  );
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const action = params.action ?? "";

  const { logs, total, pages } = await getAuditLogs({ page, action });

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ScrollText className="w-4 h-4" style={{ color: "#4f6ef7" }} />
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "#4f6ef7" }}
          >
            Audit Logs
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          {total} event{total !== 1 ? "s" : ""} recorded
        </p>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
      >
        {/* Mobile card list */}
        <div className="md:hidden divide-y" style={{ borderColor: "#1a2d4a" }}>
          {logs.length === 0 ? (
            <p
              className="px-4 py-8 text-center text-sm"
              style={{ color: "#64748b" }}
            >
              No audit events yet.
            </p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <ActionBadge action={log.action} />
                  <span
                    className="text-xs shrink-0"
                    style={{ color: "#3d5a80" }}
                  >
                    {new Date(log.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "#64748b" }}>
                  by {log.user.name || log.user.email}
                </p>
                {log.entityType && (
                  <p className="text-xs font-mono" style={{ color: "#4f6ef7" }}>
                    {log.entityType} · {log.entityId?.slice(0, 10)}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#1a2d4a" }}>
                {["Action", "Actor", "Entity", "IP", "Time"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#3d5a80" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#1a2d4a" }}>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: "#64748b" }}
                  >
                    No audit events yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-white">
                        {log.user.name || "—"}
                      </p>
                      <p
                        className="text-[11px] mt-0.5 truncate max-w-[140px]"
                        style={{ color: "#64748b" }}
                      >
                        {log.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {log.entityType ? (
                        <div>
                          <p className="text-xs" style={{ color: "#94a3b8" }}>
                            {log.entityType}
                          </p>
                          <p
                            className="text-[11px] font-mono mt-0.5"
                            style={{ color: "#64748b" }}
                          >
                            {log.entityId?.slice(0, 10)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: "#64748b" }}>
                          —
                        </span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-xs font-mono"
                      style={{ color: "#64748b" }}
                    >
                      {log.ipAddress || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-xs whitespace-nowrap"
                      style={{ color: "#64748b" }}
                    >
                      {new Date(log.createdAt).toLocaleString("en-US")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "#64748b" }}>
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?page=${page - 1}&action=${action}`}
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
                href={`?page=${page + 1}&action=${action}`}
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
