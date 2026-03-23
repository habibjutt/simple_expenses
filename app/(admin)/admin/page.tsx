import { getAdminStats, getAuditLogs } from "@/app/api/admin-action";
import { Users, CreditCard, ArrowUpRight, BarChart3, ShieldAlert, Activity } from "lucide-react";
import Link from "next/link";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  href,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent: string;
  href?: string;
}) {
  const content = (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 border transition-all hover:border-opacity-60 group"
      style={{ background: "#0f1e38", borderColor: "#1a2d4a" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}18` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        {href && (
          <ArrowUpRight
            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: accent }}
          />
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          {label}
        </p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function ActionBadge({ action }: { action: string }) {
  const color =
    action.includes("deleted") || action.includes("banned")
      ? "#ef4444"
      : action.includes("admin") || action.includes("role")
      ? "#f59e0b"
      : action.includes("toggled")
      ? "#22c55e"
      : "#4f6ef7";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: `${color}18`, color }}
    >
      {action}
    </span>
  );
}

export default async function AdminPage() {
  const [stats, { logs }] = await Promise.all([
    getAdminStats(),
    getAuditLogs({ page: 1 }),
  ]);

  const recentLogs = logs.slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4" style={{ color: "#4f6ef7" }} />
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#4f6ef7" }}>
            Control Center
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          System health and key metrics at a glance.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.userCount}
          icon={Users}
          accent="#4f6ef7"
          href="/admin/users"
        />
        <StatCard
          label="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CreditCard}
          accent="#22c55e"
          href="/admin/subscriptions"
        />
        <StatCard
          label="Transactions"
          value={stats.totalTransactions.toLocaleString('en-US')}
          icon={BarChart3}
          accent="#22d3ee"
          href="/admin/metrics"
        />
        <StatCard
          label="Banned Users"
          value={stats.bannedCount}
          icon={ShieldAlert}
          accent={stats.bannedCount > 0 ? "#ef4444" : "#64748b"}
          href="/admin/users"
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: "/admin/users", label: "Manage Users" },
          { href: "/admin/subscriptions", label: "Subscriptions" },
          { href: "/admin/metrics", label: "Metrics" },
          { href: "/admin/flags", label: "Feature Flags" },
          { href: "/admin/logs", label: "Audit Logs" },
          { href: "/dashboard", label: "Back to App" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-3 rounded-xl text-sm font-medium text-center border transition-all hover:border-[#4f6ef7] hover:text-white"
            style={{
              background: "#0f1e38",
              borderColor: "#1a2d4a",
              color: "#94a3b8",
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Recent audit activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">Recent Activity</h2>
          <Link href="/admin/logs" className="text-xs hover:text-white transition-colors" style={{ color: "#4f6ef7" }}>
            View all →
          </Link>
        </div>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
        >
          {recentLogs.length === 0 ? (
            <p className="p-6 text-sm text-center" style={{ color: "#64748b" }}>
              No audit events yet.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: "#1a2d4a" }}>
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <ActionBadge action={log.action} />
                    <p className="text-xs mt-1 truncate" style={{ color: "#64748b" }}>
                      by {log.user.email}
                      {log.entityType && ` on ${log.entityType} ${log.entityId?.slice(0, 8)}`}
                    </p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: "#3d5a80" }}>
                    {new Date(log.createdAt).toLocaleDateString('en-US')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
