import { getAdminSubscriptions } from "@/app/api/admin-action";
import { CreditCard } from "lucide-react";

function SubStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs" style={{ color: "#64748b" }}>no subscription</span>;
  const colors: Record<string, string> = {
    active: "#22c55e",
    trialing: "#22d3ee",
    past_due: "#f59e0b",
    canceled: "#ef4444",
    incomplete: "#f59e0b",
  };
  const color = colors[status] ?? "#94a3b8";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: `${color}18`, color }}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export default async function AdminSubscriptionsPage() {
  const subs = await getAdminSubscriptions();

  const activeCount = subs.filter((s) => s.subscriptionStatus === "active").length;
  const trialCount = subs.filter((s) => s.subscriptionStatus === "trialing").length;
  const canceledCount = subs.filter((s) => s.subscriptionStatus === "canceled").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-4 h-4" style={{ color: "#4f6ef7" }} />
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#4f6ef7" }}>
            Subscriptions
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          {subs.length} total subscription record{subs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Active", value: activeCount, color: "#22c55e" },
          { label: "Trialing", value: trialCount, color: "#22d3ee" },
          { label: "Canceled", value: canceledCount, color: "#ef4444" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-5 border"
            style={{ background: "#0f1e38", borderColor: "#1a2d4a" }}
          >
            <p className="text-2xl font-bold" style={{ color }}>
              {value}
            </p>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
      >
        {/* Mobile card list */}
        <div className="md:hidden divide-y" style={{ borderColor: "#1a2d4a" }}>
          {subs.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm" style={{ color: "#64748b" }}>No subscription records found.</p>
          ) : (
            subs.map((s) => (
              <div key={s.id} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-white text-sm">{s.name || "—"}</p>
                  <SubStatusBadge status={s.subscriptionStatus} />
                </div>
                <p className="text-xs truncate" style={{ color: "#64748b" }}>{s.email}</p>
                {s.currentPeriodEnd && (
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    Renews {new Date(s.currentPeriodEnd).toLocaleDateString('en-US')}
                  </p>
                )}
                {s.stripeSubscriptionId && (
                  <p className="text-xs font-mono truncate" style={{ color: "#4f6ef7" }}>
                    {s.stripeSubscriptionId.slice(0, 22)}
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
                {["User", "Status", "Current Period End", "Trial End", "Stripe ID"].map((h) => (
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
              {subs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                    No subscription records found.
                  </td>
                </tr>
              ) : (
                subs.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{s.name || "—"}</p>
                      <p className="text-xs mt-0.5 truncate max-w-[160px]" style={{ color: "#64748b" }}>
                        {s.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <SubStatusBadge status={s.subscriptionStatus} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>
                      {s.currentPeriodEnd
                        ? new Date(s.currentPeriodEnd).toLocaleDateString('en-US')
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>
                      {s.trialEndsAt
                        ? new Date(s.trialEndsAt).toLocaleDateString('en-US')
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "#4f6ef7" }}>
                        {s.stripeSubscriptionId?.slice(0, 18) ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
